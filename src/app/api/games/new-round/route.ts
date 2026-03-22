import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { broadcastGameState } from "@/lib/supabase/broadcast";
import { dealTiles, playTile, drawTile, passTurn } from "@/lib/engine/engine";
import { chooseMove } from "@/lib/engine/ai";
import type { GameState } from "@/lib/engine/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { gameId } = body;

  const db = createServiceClient();

  const { data: game } = await db
    .from("games")
    .select("game_state, status, owner_id")
    .eq("id", gameId)
    .single();

  if (!game || !game.game_state) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  if (game.owner_id !== user.id) {
    return NextResponse.json({ error: "Only the owner can start a new round" }, { status: 403 });
  }

  const state = game.game_state as unknown as GameState;

  if (state.status !== "round_over") {
    return NextResponse.json({ error: "Round is not over" }, { status: 400 });
  }

  let newState = dealTiles(state);
  newState = processAITurns(newState);

  const { error } = await db
    .from("games")
    .update({ game_state: newState, status: newState.status })
    .eq("id", gameId);

  if (error) {
    return NextResponse.json({ error: "Failed to start new round" }, { status: 500 });
  }

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
