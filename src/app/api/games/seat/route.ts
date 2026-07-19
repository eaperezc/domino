import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";

const SEAT_TEAM: Record<string, "team1" | "team2"> = {
  bottom: "team1",
  top: "team1",
  left: "team2",
  right: "team2",
};

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { gameId, seat } = body as { gameId?: string; seat?: string };
  if (!gameId || !seat || !SEAT_TEAM[seat]) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const game = await db.game.findUnique({ where: { id: gameId }, select: { status: true } });
  if (!game || game.status !== "waiting") {
    return NextResponse.json({ error: "Game not available" }, { status: 400 });
  }

  const existing = await db.gameSeat.findUnique({
    where: { gameId_seat: { gameId, seat: seat as "bottom" | "left" | "top" | "right" } },
    select: { id: true },
  });
  if (existing) return NextResponse.json({ error: "Seat is taken" }, { status: 400 });

  try {
    await db.$transaction([
      db.gameSeat.deleteMany({ where: { gameId, playerId: user.id } }),
      db.gameSeat.create({
        data: {
          gameId,
          seat: seat as "bottom" | "left" | "top" | "right",
          playerId: user.id,
          playerName: user.username,
          team: SEAT_TEAM[seat],
        },
      }),
    ]);
  } catch {
    return NextResponse.json({ error: "Failed to change seat" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
