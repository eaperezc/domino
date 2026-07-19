import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";
import { playTile, drawTile, passTurn } from "@/lib/engine/engine";
import { processAITurns } from "@/lib/engine/process-ai";
import type { GameState } from "@/lib/engine/types";
import type { Prisma } from "@/generated/prisma/client";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { gameId, action, tile, end } = body;
  if (!gameId || !action) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const game = await db.game.findUnique({
    where: { id: gameId },
    select: { gameState: true },
  });
  if (!game?.gameState) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const state = game.gameState as unknown as GameState;
  if (state.status !== "playing") {
    return NextResponse.json({ error: "Game is not in progress" }, { status: 400 });
  }
  if (state.currentTurn !== user.id) {
    return NextResponse.json({ error: "Not your turn" }, { status: 400 });
  }
  if (!state.players.some((p) => p.id === user.id)) {
    return NextResponse.json({ error: "You are not in this game" }, { status: 403 });
  }

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

  // The engine returns the same object when a move is invalid
  if (newState === state) {
    return NextResponse.json({ error: "Invalid move" }, { status: 400 });
  }

  newState = processAITurns(newState);

  try {
    await db.game.update({
      where: { id: gameId },
      data: {
        gameState: newState as unknown as Prisma.InputJsonValue,
        status: newState.status,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to save game state" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
