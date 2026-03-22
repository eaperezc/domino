import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";


const SEAT_TEAM: Record<string, string> = {
  bottom: "team1",
  top: "team1",
  left: "team2",
  right: "team2",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { gameId, seat } = body;

  if (!gameId || !seat || !SEAT_TEAM[seat]) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Check game exists and is waiting
  const { data: game } = await supabase
    .from("games")
    .select("id, status")
    .eq("id", gameId)
    .single();

  if (!game || game.status !== "waiting") {
    return NextResponse.json({ error: "Game not available" }, { status: 400 });
  }

  // Check seat is free
  const { data: existing } = await supabase
    .from("game_seats")
    .select("id, player_id")
    .eq("game_id", gameId)
    .eq("seat", seat)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Seat is taken" }, { status: 400 });
  }

  // Remove player from their current seat
  await supabase
    .from("game_seats")
    .delete()
    .eq("game_id", gameId)
    .eq("player_id", user.id);

  // Get username
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  // Take the new seat
  const { error } = await supabase.from("game_seats").insert({
    game_id: gameId,
    seat,
    player_id: user.id,
    player_name: profile?.username ?? "Player",
    team: SEAT_TEAM[seat],
    is_ai: false,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to change seat" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
