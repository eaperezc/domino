import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { broadcastLobbyEvent } from "@/lib/supabase/broadcast";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const code = (body.code ?? "").toUpperCase().trim();

  if (!code) {
    return NextResponse.json({ error: "Game code is required" }, { status: 400 });
  }

  // Find the game
  const { data: game } = await supabase
    .from("games")
    .select("id, status")
    .eq("code", code)
    .single();

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  if (game.status !== "waiting") {
    return NextResponse.json({ error: "Game already started" }, { status: 400 });
  }

  // Check if already in this game
  const { data: existingSeat } = await supabase
    .from("game_seats")
    .select("id")
    .eq("game_id", game.id)
    .eq("player_id", user.id)
    .single();

  if (existingSeat) {
    // Already in the game, just return the game id
    return NextResponse.json({ gameId: game.id });
  }

  // Get current seats
  const { data: seats } = await supabase
    .from("game_seats")
    .select("seat")
    .eq("game_id", game.id);

  const takenSeats = new Set((seats ?? []).map((s) => s.seat));
  const allSeats = ["bottom", "left", "top", "right"] as const;
  // Team assignments: bottom+top = team1, left+right = team2
  const seatTeam: Record<string, string> = {
    bottom: "team1",
    top: "team1",
    left: "team2",
    right: "team2",
  };

  const availableSeat = allSeats.find((s) => !takenSeats.has(s));
  if (!availableSeat) {
    return NextResponse.json({ error: "Game is full" }, { status: 400 });
  }

  // Get username
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const username = profile?.username ?? "Player";

  const { error } = await supabase.from("game_seats").insert({
    game_id: game.id,
    seat: availableSeat,
    player_id: user.id,
    player_name: username,
    team: seatTeam[availableSeat],
    is_ai: false,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to join game" }, { status: 500 });
  }

  await broadcastLobbyEvent(game.id, "seats_changed", {});

  return NextResponse.json({ gameId: game.id, seat: availableSeat });
}
