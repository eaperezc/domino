// Wire-format serializers. The client pages consume the snake_case shapes the
// app has always sent; the database layer is camelCase Prisma.

export interface WireSeat {
  id: string;
  seat: string;
  player_id: string | null;
  player_name: string;
  team: string;
  is_ai: boolean;
}

export function serializeSeat(s: {
  id: string;
  seat: string;
  playerId: string | null;
  playerName: string;
  team: string;
  isAi: boolean;
}): WireSeat {
  return {
    id: s.id,
    seat: s.seat,
    player_id: s.playerId,
    player_name: s.playerName,
    team: s.team,
    is_ai: s.isAi,
  };
}

export function serializeGame(g: {
  id: string;
  code: string;
  ownerId: string;
  status: string;
  targetScore: number;
}) {
  return {
    id: g.id,
    code: g.code,
    owner_id: g.ownerId,
    status: g.status,
    target_score: g.targetScore,
  };
}
