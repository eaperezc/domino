import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { theme } from "@/lib/theme";
import SignOutButton from "./SignOutButton";

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? user.user_metadata?.username ?? null;
  }

  return (
    <header
      className="flex items-center justify-between px-4 py-2 shrink-0"
      style={{ backgroundColor: theme.surfaceBg, borderBottom: `1px solid ${theme.surfaceBorder}` }}
    >
      <Link href="/" className="text-lg font-bold" style={{ color: theme.pageText }}>
        Domino
      </Link>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm" style={{ color: theme.pageTextMuted }}>
              {username}
            </span>
            <SignOutButton />
          </>
        ) : (
          <Link
            href="/auth/login"
            className="px-3 py-1.5 rounded-md text-sm font-medium text-white"
            style={{ backgroundColor: theme.btnPrimary }}
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
