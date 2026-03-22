import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateGameCode } from "@/lib/game-code";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const targetScore = body.targetScore ?? 100;
  const isPublic = body.isPublic ?? false;

  // Get username from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const username = profile?.username ?? "Player";

  // Generate unique code (retry on collision)
  let code = generateGameCode();
  let attempts = 0;
  while (attempts < 5) {
    const { error } = await supabase.from("games").insert({
      code,
      owner_id: user.id,
      target_score: targetScore,
      is_public: isPublic,
    });

    if (!error) break;

    // Code collision, try again
    code = generateGameCode();
    attempts++;
  }

  if (attempts >= 5) {
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
  }

  // Get the created game
  const { data: game } = await supabase
    .from("games")
    .select("id, code")
    .eq("code", code)
    .single();

  if (!game) {
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
  }

  // Owner takes the bottom seat by default
  await supabase.from("game_seats").insert({
    game_id: game.id,
    seat: "bottom",
    player_id: user.id,
    player_name: username,
    team: "team1",
    is_ai: false,
  });

  return NextResponse.json({ gameId: game.id, code: game.code });
}
