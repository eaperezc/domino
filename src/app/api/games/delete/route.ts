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

  // Verify ownership
  const { data: game } = await db
    .from("games")
    .select("id, owner_id")
    .eq("id", gameId)
    .eq("owner_id", user.id)
    .single();

  if (!game) {
    return NextResponse.json({ error: "Game not found or not owner" }, { status: 403 });
  }

  // Delete seats first (cascade should handle this, but be explicit)
  await db.from("game_seats").delete().eq("game_id", gameId);
  await db.from("games").delete().eq("id", gameId);

  return NextResponse.json({ ok: true });
}
