import * as React from "react";
import { cn } from "@/lib/utils";

function Navbar({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="navbar"
      className={cn(
        "flex items-center justify-between px-6 sm:px-12 py-4 border-b border-border bg-card",
        className
      )}
      {...props}
    />
  );
}

function NavbarBrand({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="navbar-brand"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function NavbarItems({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="navbar-items"
      className={cn("flex items-center gap-4", className)}
      {...props}
    />
  );
}

function NavbarItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="navbar-item"
      className={cn(
        "font-mono text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

export { Navbar, NavbarBrand, NavbarItems, NavbarItem };
