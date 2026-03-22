import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

import { createGame, dealTiles, playTile, drawTile, passTurn } from "@/lib/engine/engine";
import { chooseMove } from "@/lib/engine/ai";
import type { Player, GameState } from "@/lib/engine/types";

const AI_NAMES = ["Carlos", "Maria", "Pedro"];
const SEAT_TEAM: Record<string, string> = {
  bottom: "team1",
  top: "team1",
  left: "team2",
  right: "team2",
};
const SEAT_ORDER = ["bottom", "left", "top", "right"] as const;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { gameId } = body;

  const db = createServiceClient();

  // Verify ownership
  const { data: game } = await db
    .from("games")
    .select("*")
    .eq("id", gameId)
    .eq("owner_id", user.id)
    .single();

  if (!game) {
    return NextResponse.json({ error: "Game not found or not owner" }, { status: 403 });
  }

  if (game.status !== "waiting") {
    return NextResponse.json({ error: "Game already started" }, { status: 400 });
  }

  // Get current seats
  const { data: seats } = await db
    .from("game_seats")
    .select("*")
    .eq("game_id", gameId);

  const seatMap = new Map((seats ?? []).map((s: Record<string, unknown>) => [s.seat as string, s]));

  // Fill empty seats with AI
  let aiIndex = 0;
  for (const seat of SEAT_ORDER) {
    if (!seatMap.has(seat)) {
      const aiName = AI_NAMES[aiIndex % AI_NAMES.length];
      aiIndex++;

      const { data: aiSeat } = await db
        .from("game_seats")
        .insert({
          game_id: gameId,
          seat,
          player_id: null,
          player_name: aiName,
          team: SEAT_TEAM[seat],
          is_ai: true,
        })
        .select()
        .single();

      if (aiSeat) seatMap.set(seat, aiSeat);
    }
  }

  // Build players array in seat order (clockwise from bottom)
  const players: Player[] = SEAT_ORDER.map((seat) => {
    const s = seatMap.get(seat) as Record<string, unknown>;
    return {
      id: s.is_ai ? `ai-${seat}` : s.player_id as string,
      name: s.player_name as string,
      isAI: s.is_ai as boolean,
      team: s.team as string,
    };
  });

  // Create and deal
  let gameState = dealTiles(
    createGame(players, {
      playerCount: 4,
      targetScore: game.target_score,
    }),
  );

  // Process AI turns if AI goes first
  gameState = processAITurns(gameState);

  // Save game state
  const { error } = await db
    .from("games")
    .update({ status: gameState.status, game_state: gameState })
    .eq("id", gameId);

  if (error) {
    return NextResponse.json({ error: "Failed to start game" }, { status: 500 });
  }

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
