import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";
import { dealTiles } from "@/lib/engine/engine";
import { processAITurns } from "@/lib/engine/process-ai";
import type { GameState } from "@/lib/engine/types";
import type { Prisma } from "@/generated/prisma/client";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { gameId } = body as { gameId?: string };

  const game = await db.game.findUnique({
    where: { id: gameId },
    select: { gameState: true, ownerId: true },
  });
  if (!game?.gameState) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  if (game.ownerId !== user.id) {
    return NextResponse.json({ error: "Only the owner can start a new round" }, { status: 403 });
  }

  const state = game.gameState as unknown as GameState;
  if (state.status !== "round_over") {
    return NextResponse.json({ error: "Round is not over" }, { status: 400 });
  }

  let newState = dealTiles(state);
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
    return NextResponse.json({ error: "Failed to start new round" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
