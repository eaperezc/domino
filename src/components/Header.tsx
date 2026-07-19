import Link from "next/link";
import { currentUser } from "@/lib/current-user";
import { Navbar, NavbarBrand, NavbarItems, NavbarItem } from "@/components/ui/navbar";
import { buttonVariants } from "@/components/ui/button-variants";
import DominoLogo from "./DominoLogo";
import SignOutButton from "./SignOutButton";

export default async function Header() {
  const user = await currentUser();

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
              <span className="text-sm text-muted-foreground">{user.username}</span>
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
