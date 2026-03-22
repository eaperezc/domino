import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { broadcastGameState } from "@/lib/supabase/broadcast";
import { playTile, drawTile, passTurn } from "@/lib/engine/engine";
import { chooseMove } from "@/lib/engine/ai";
import type { GameState } from "@/lib/engine/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { gameId, action, tile, end } = body;

  if (!gameId || !action) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Use service client for DB reads/writes (bypasses RLS)
  const db = createServiceClient();

  // Get game state
  const { data: game } = await db
    .from("games")
    .select("game_state, status")
    .eq("id", gameId)
    .single();

  if (!game || !game.game_state) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const state = game.game_state as unknown as GameState;

  if (state.status !== "playing") {
    return NextResponse.json({ error: "Game is not in progress" }, { status: 400 });
  }

  // Verify it's this player's turn
  if (state.currentTurn !== user.id) {
    return NextResponse.json({ error: "Not your turn" }, { status: 400 });
  }

  // Verify this user is actually a player in the game
  const isPlayer = state.players.some((p) => p.id === user.id);
  if (!isPlayer) {
    return NextResponse.json({ error: "You are not in this game" }, { status: 403 });
  }

  // Apply the action
  let newState: GameState;
  switch (action) {
    case "play":
      if (!tile || !end) {
        return NextResponse.json({ error: "Tile and end are required" }, { status: 400 });
      }
      newState = playTile(state, user.id, tile, end);
      break;
    case "draw":
      newState = drawTile(state, user.id);
      break;
    case "pass":
      newState = passTurn(state, user.id);
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // Check if state actually changed (validation failed if it didn't)
  if (newState === state) {
    return NextResponse.json({ error: "Invalid move" }, { status: 400 });
  }

  // Process AI turns after human move
  newState = processAITurns(newState);

  // Save with service client
  const { error } = await db
    .from("games")
    .update({ game_state: newState, status: newState.status })
    .eq("id", gameId);

  if (error) {
    return NextResponse.json({ error: "Failed to save game state" }, { status: 500 });
  }

  // Broadcast to all connected clients
  await broadcastGameState(gameId, newState);

  return NextResponse.json({ ok: true });
}

function processAITurns(state: GameState): GameState {
  let current = state;

  while (current.status === "playing") {
    const player = current.players.find((p) => p.id === current.currentTurn);
    if (!player?.isAI) break;

    const decision = chooseMove(current, player.id);

    switch (decision.action) {
      case "play":
        current = playTile(current, player.id, decision.tile, decision.end);
        break;
      case "draw":
        current = drawTile(current, player.id);
        continue;
      case "pass":
        current = passTurn(current, player.id);
        break;
    }
  }

  return current;
}
