import Link from "next/link";
import { theme } from "@/lib/theme";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8"
      style={{ backgroundColor: theme.pageBg, color: theme.pageText }}
    >
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-2">Domino</h1>
        <p style={{ color: theme.pageTextMuted }}>Classic draw dominoes</p>
      </div>

      <Link
        href="/game/local"
        className="px-8 py-3 rounded-lg text-lg font-medium transition-colors text-white"
        style={{ backgroundColor: theme.btnPrimary }}
      >
        Play vs Computer
      </Link>
    </div>
  );
}
