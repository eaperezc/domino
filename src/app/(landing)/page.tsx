import Link from "next/link";
import { theme } from "@/lib/theme";

export default function LandingPage() {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-10 p-6"
      style={{ backgroundColor: theme.pageBg, color: theme.pageText }}
    >
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-bold tracking-tight">Domino</h1>
        <p className="text-lg" style={{ color: theme.pageTextMuted }}>
          Classic draw dominoes
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        <Link
          href="/game/local"
          className="group rounded-lg border p-6 text-center transition-all hover:scale-[1.02]"
          style={{
            backgroundColor: theme.surfaceBg,
            borderColor: theme.surfaceBorder,
          }}
        >
          <div className="text-3xl mb-3">🎮</div>
          <h2 className="text-lg font-semibold mb-1">Play Solo</h2>
          <p className="text-sm" style={{ color: theme.pageTextMuted }}>
            You vs 3 computer opponents
          </p>
        </Link>

        <Link
          href="/game/online"
          className="group rounded-lg border p-6 text-center transition-all hover:scale-[1.02]"
          style={{
            backgroundColor: theme.surfaceBg,
            borderColor: theme.surfaceBorder,
          }}
        >
          <div className="text-3xl mb-3">👥</div>
          <h2 className="text-lg font-semibold mb-1">Play with Friends</h2>
          <p className="text-sm" style={{ color: theme.pageTextMuted }}>
            Create or join an online game
          </p>
        </Link>
      </div>

      <p className="text-sm" style={{ color: theme.pageTextMuted }}>
        <Link href="/auth/login" className="underline underline-offset-4 hover:text-foreground transition-colors">
          Sign in
        </Link>
        {" "}to play online and track your stats
      </p>
    </div>
  );
}
