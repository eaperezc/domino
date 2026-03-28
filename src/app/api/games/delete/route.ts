import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { gameId } = body;

  if (!gameId) {
    return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
  }

  const db = createServiceClient();

  // Check if user is the owner
  const { data: game } = await db
    .from("games")
    .select("id, owner_id")
    .eq("id", gameId)
    .single();

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  if (game.owner_id === user.id) {
    // Owner: delete the entire game
    await db.from("game_seats").delete().eq("game_id", gameId);
    await db.from("games").delete().eq("id", gameId);
    return NextResponse.json({ ok: true, action: "deleted" });
  }

  // Not owner: leave the game (remove seat)
  const { data: seat } = await db
    .from("game_seats")
    .select("id")
    .eq("game_id", gameId)
    .eq("player_id", user.id)
    .single();

  if (!seat) {
    return NextResponse.json({ error: "You are not in this game" }, { status: 403 });
  }

  await db.from("game_seats").delete().eq("id", seat.id);
  return NextResponse.json({ ok: true, action: "left" });
}
