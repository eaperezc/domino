import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";
import { generateGameCode } from "@/lib/game-code";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const targetScore = body.targetScore ?? 100;
  const isPublic = body.isPublic ?? false;

  // Generate unique code (retry on collision)
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateGameCode();
    try {
      const game = await db.game.create({
        data: {
          code,
          ownerId: user.id,
          targetScore,
          isPublic,
          seats: {
            create: {
              seat: "bottom",
              playerId: user.id,
              playerName: user.username,
              team: "team1",
            },
          },
        },
        select: { id: true, code: true },
      });
      return NextResponse.json({ gameId: game.id, code: game.code });
    } catch (e) {
      // P2002 = unique violation (code collision), try a new code
      if ((e as { code?: string }).code !== "P2002") throw e;
    }
  }
  return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
}
