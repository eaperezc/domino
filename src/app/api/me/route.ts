import { NextResponse } from "next/server";
import { currentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { id: user.id, username: user.username, avatarUrl: user.avatarUrl },
  });
}
