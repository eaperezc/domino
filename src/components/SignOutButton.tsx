"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { theme } from "@/lib/theme";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
      style={{ color: theme.pageTextMuted, border: `1px solid ${theme.surfaceBorder}` }}
    >
      Sign Out
    </button>
  );
}
