import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";

const SEAT_TEAM = {
  bottom: "team1",
  top: "team1",
  left: "team2",
  right: "team2",
} as const;
const ALL_SEATS = ["bottom", "left", "top", "right"] as const;

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const code = (body.code ?? "").toUpperCase().trim();
  if (!code) return NextResponse.json({ error: "Game code is required" }, { status: 400 });

  const game = await db.game.findUnique({
    where: { code },
    select: { id: true, status: true, seats: { select: { seat: true, playerId: true } } },
  });
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
  if (game.status !== "waiting") {
    return NextResponse.json({ error: "Game already started" }, { status: 400 });
  }

  if (game.seats.some((s) => s.playerId === user.id)) {
    return NextResponse.json({ gameId: game.id });
  }

  const taken = new Set(game.seats.map((s) => s.seat));
  const availableSeat = ALL_SEATS.find((s) => !taken.has(s));
  if (!availableSeat) return NextResponse.json({ error: "Game is full" }, { status: 400 });

  try {
    await db.gameSeat.create({
      data: {
        gameId: game.id,
        seat: availableSeat,
        playerId: user.id,
        playerName: user.username,
        team: SEAT_TEAM[availableSeat],
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to join game" }, { status: 500 });
  }

  return NextResponse.json({ gameId: game.id, seat: availableSeat });
}
