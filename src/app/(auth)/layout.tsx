import Link from "next/link";
import DominoLogo from "@/components/DominoLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="noise flex flex-col min-h-screen bg-background text-foreground">
      {/* Minimal nav */}
      <nav className="flex items-center px-6 sm:px-12 py-6">
        <Link href="/">
          <DominoLogo />
        </Link>
      </nav>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>

      {/* Subtle footer line */}
      <div className="border-t border-border/30 px-6 sm:px-12 py-4">
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/50 text-center">
          Classic draw dominoes
        </p>
      </div>
    </div>
  );
}
