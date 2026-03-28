import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar, NavbarBrand, NavbarItems, NavbarItem } from "@/components/ui/navbar";
import { buttonVariants } from "@/components/ui/button-variants";
import DominoLogo from "./DominoLogo";
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
    <Navbar>
      <NavbarBrand>
        <Link href="/home">
          <DominoLogo />
        </Link>
      </NavbarBrand>

      <NavbarItems>
        {user ? (
          <>
            <NavbarItem>
              <span className="text-sm text-muted-foreground">{username}</span>
            </NavbarItem>
            <SignOutButton />
          </>
        ) : (
          <Link href="/auth/login" className={buttonVariants({ size: "sm" })}>
            Sign In
          </Link>
        )}
      </NavbarItems>
    </Navbar>
  );
}
