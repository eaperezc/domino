import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";
import { serializeGame, serializeSeat } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const game = await db.game.findUnique({
    where: { id },
    include: { seats: true },
  });
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });

  return NextResponse.json({
    game: serializeGame(game),
    seats: game.seats.map(serializeSeat),
  });
}
