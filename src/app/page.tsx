import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-2">Domino</h1>
        <p className="text-slate-400">Classic draw dominoes</p>
      </div>

      <Link
        href="/game/local"
        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-lg font-medium transition-colors"
      >
        Play vs Computer
      </Link>
    </div>
  );
}
