import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { gameId } = body as { gameId?: string };
  if (!gameId) return NextResponse.json({ error: "Game ID is required" }, { status: 400 });

  const game = await db.game.findUnique({
    where: { id: gameId },
    select: { ownerId: true },
  });
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

  if (game.ownerId === user.id) {
    // Owner: delete the game (seats cascade)
    await db.game.delete({ where: { id: gameId } });
    return NextResponse.json({ ok: true, action: "deleted" });
  }

  // Not owner: leave the game (free the seat)
  const { count } = await db.gameSeat.deleteMany({ where: { gameId, playerId: user.id } });
  if (count === 0) {
    return NextResponse.json({ error: "You are not in this game" }, { status: 403 });
  }
  return NextResponse.json({ ok: true, action: "left" });
}
