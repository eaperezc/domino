import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

// Wire format matches what the pages historically consumed (snake_case).
function listing(g: {
  id: string;
  code: string;
  status: string;
  targetScore: number;
  createdAt: Date;
  owner: { username: string };
  _count: { seats: number };
}) {
  return {
    id: g.id,
    code: g.code,
    status: g.status,
    target_score: g.targetScore,
    created_at: g.createdAt.toISOString(),
    owner: { username: g.owner.username },
    seat_count: g._count.seats,
  };
}

const LISTING_SELECT = {
  id: true,
  code: true,
  status: true,
  targetScore: true,
  createdAt: true,
  owner: { select: { username: true } },
  _count: { select: { seats: { where: { isAi: false } } } },
} as const;

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [myGames, openGames] = await Promise.all([
    db.game.findMany({
      where: {
        status: { in: ["waiting", "playing", "round_over"] },
        seats: { some: { playerId: user.id } },
      },
      orderBy: { createdAt: "desc" },
      select: LISTING_SELECT,
    }),
    db.game.findMany({
      where: {
        status: "waiting",
        isPublic: true,
        seats: { none: { playerId: user.id } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: LISTING_SELECT,
    }),
  ]);

  return NextResponse.json({
    myGames: myGames.map(listing),
    openGames: openGames.map(listing),
  });
}
