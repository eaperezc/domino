import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";
import { createGame, dealTiles } from "@/lib/engine/engine";
import { processAITurns } from "@/lib/engine/process-ai";
import type { Player } from "@/lib/engine/types";
import type { Prisma } from "@/generated/prisma/client";

const AI_NAMES = ["Carlos", "Maria", "Pedro"];
const SEAT_TEAM = {
  bottom: "team1",
  top: "team1",
  left: "team2",
  right: "team2",
} as const;
const SEAT_ORDER = ["bottom", "left", "top", "right"] as const;

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { gameId } = body as { gameId?: string };

  const game = await db.game.findFirst({
    where: { id: gameId, ownerId: user.id },
    include: { seats: true },
  });
  if (!game) {
    return NextResponse.json({ error: "Game not found or not owner" }, { status: 403 });
  }
  if (game.status !== "waiting") {
    return NextResponse.json({ error: "Game already started" }, { status: 400 });
  }

  const seatMap = new Map(game.seats.map((s) => [s.seat, s]));

  // Fill empty seats with AI
  let aiIndex = 0;
  for (const seat of SEAT_ORDER) {
    if (!seatMap.has(seat)) {
      const aiSeat = await db.gameSeat.create({
        data: {
          gameId: game.id,
          seat,
          playerName: AI_NAMES[aiIndex % AI_NAMES.length],
          team: SEAT_TEAM[seat],
          isAi: true,
        },
      });
      aiIndex++;
      seatMap.set(seat, aiSeat);
    }
  }

  // Build players array in seat order (clockwise from bottom)
  const players: Player[] = SEAT_ORDER.map((seat) => {
    const s = seatMap.get(seat)!;
    return {
      id: s.isAi ? `ai-${seat}` : s.playerId!,
      name: s.playerName,
      isAI: s.isAi,
      team: s.team,
    };
  });

  // Create, deal, and let AI open if it goes first
  let gameState = dealTiles(
    createGame(players, { playerCount: 4, targetScore: game.targetScore })
  );
  gameState = processAITurns(gameState);

  try {
    await db.game.update({
      where: { id: game.id },
      data: {
        status: gameState.status,
        gameState: gameState as unknown as Prisma.InputJsonValue,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to start game" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
