"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Panel, PanelHeader, PanelTitle, PanelTag, PanelDescription } from "@/components/ui/panel";
import { SectionTitle, SectionHeading, SectionSubtitle } from "@/components/ui/section-title";
import AccentText from "@/components/AccentText";

interface GameListing {
  id: string;
  code: string;
  status: string;
  target_score: number;
  created_at: string;
  owner: { username: string } | null;
  seat_count: number;
}

export default function AppHomePage() {
  const router = useRouter();
  const [games, setGames] = useState<GameListing[]>([]);
  const [myGames, setMyGames] = useState<GameListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: openGames } = await supabase
        .from("games")
        .select("id, code, status, target_score, created_at, owner_id")
        .eq("status", "waiting")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: mySeatGames } = await supabase
        .from("game_seats")
        .select("game_id")
        .eq("player_id", user.id);

      const myGameIds = (mySeatGames ?? []).map((s) => s.game_id);

      if (myGameIds.length > 0) {
        const { data: activeGames } = await supabase
          .from("games")
          .select("id, code, status, target_score, created_at, owner_id")
          .in("id", myGameIds)
          .in("status", ["waiting", "playing", "round_over"])
          .order("created_at", { ascending: false });

        const enriched = await Promise.all(
          (activeGames ?? []).map(async (g) => {
            const { count } = await supabase
              .from("game_seats")
              .select("id", { count: "exact", head: true })
              .eq("game_id", g.id)
              .eq("is_ai", false);

            const { data: owner } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", g.owner_id)
              .single();

            return { ...g, seat_count: count ?? 0, owner };
          }),
        );

        setMyGames(enriched);
      }

      const enrichedOpen = await Promise.all(
        (openGames ?? []).filter((g) => !myGameIds.includes(g.id)).map(async (g) => {
          const { count } = await supabase
            .from("game_seats")
            .select("id", { count: "exact", head: true })
            .eq("game_id", g.id)
            .eq("is_ai", false);

          const { data: owner } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", g.owner_id)
            .single();

          return { ...g, seat_count: count ?? 0, owner };
        }),
      );

      setGames(enrichedOpen);
      setLoading(false);
    }
    load();
  }, []);

  async function handleCreate() {
    setError(null);
    setActionLoading(true);
    const res = await fetch("/api/games/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetScore: 100, isPublic }),
    });
    const data = await res.json();
    setActionLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create game");
      return;
    }
    router.push(`/game/online/${data.gameId}`);
  }

  async function handleJoin() {
    setError(null);
    if (!code.trim()) {
      setError("Enter a game code");
      return;
    }
    setActionLoading(true);
    const res = await fetch("/api/games/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });
    const data = await res.json();
    setActionLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to join game");
      return;
    }
    router.push(`/game/online/${data.gameId}`);
  }

  async function handleDelete(e: React.MouseEvent, gameId: string) {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(gameId);
    const res = await fetch("/api/games/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });
    setDeletingId(null);
    if (res.ok) {
      setMyGames((prev) => prev.filter((g) => g.id !== gameId));
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to delete game");
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "waiting":
        return <Badge variant="info">Waiting</Badge>;
      case "playing":
        return <Badge variant="warning">In Progress</Badge>;
      case "round_over":
        return <Badge variant="secondary">Round Over</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10 space-y-16">

        {/* Game actions */}
        <section>
          <SectionTitle className="mb-10 sm:mb-14">
            <SectionHeading>
              Make your <AccentText>move</AccentText>
            </SectionHeading>
          </SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Create */}
            <Panel className="flex flex-col">
              <PanelHeader>
                <PanelTitle>Create</PanelTitle>
                <PanelTag>New Game</PanelTag>
              </PanelHeader>
              <PanelDescription className="mb-5">
                Start a new game and invite friends with a code.
              </PanelDescription>
              <div className="flex items-center justify-between mb-4">
                <label className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                  Public
                </label>
                <Switch
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
              <Button onClick={handleCreate} disabled={actionLoading} className="w-full mt-auto">
                {actionLoading ? "Creating..." : "Create Game"}
              </Button>
            </Panel>

            {/* Join */}
            <Panel className="flex flex-col">
              <PanelHeader>
                <PanelTitle>Join</PanelTitle>
                <PanelTag>By Code</PanelTag>
              </PanelHeader>
              <PanelDescription className="mb-5">
                Enter a 4-letter code to join a friend&apos;s game.
              </PanelDescription>
              <input
                placeholder="ABCD"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                maxLength={4}
                className="w-full h-12 bg-transparent border border-border/40 px-3 text-center text-xl font-mono tracking-[0.3em] uppercase text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors mb-4"
              />
              <Button onClick={handleJoin} disabled={actionLoading} variant="secondary" className="w-full mt-auto">
                {actionLoading ? "Joining..." : "Join Game"}
              </Button>
            </Panel>

            {/* Solo */}
            <Panel className="flex flex-col">
              <PanelHeader>
                <PanelTitle>Solo</PanelTitle>
                <PanelTag>vs AI</PanelTag>
              </PanelHeader>
              <PanelDescription className="mb-5">
                Quick game against 3 computer opponents.
              </PanelDescription>
              <Button onClick={() => router.push("/game/local")} variant="outline" className="w-full mt-auto">
                Start Solo Game
              </Button>
            </Panel>
          </div>

          {error && (
            <p className="font-mono text-xs text-destructive mt-4 text-center">{error}</p>
          )}
        </section>

        {/* My active games */}
        {myGames.length > 0 && (
          <section>
            <SectionTitle className="mb-10 sm:mb-14">
              <SectionHeading>
                Your <AccentText>games</AccentText>
              </SectionHeading>
              <SectionSubtitle>{myGames.length} active</SectionSubtitle>
            </SectionTitle>

            <div className="space-y-0">
              {myGames.map((g) => (
                <div key={g.id} className="product-card relative group border-t border-border/30 py-4 sm:py-5 flex items-center gap-4 sm:gap-8 transition-colors hover:bg-muted/30">
                  <Link
                    href={g.status === "waiting" ? `/game/online/${g.id}` : `/game/online/${g.id}/play`}
                    className="flex items-center gap-4 sm:gap-8 flex-1 min-w-0"
                  >
                    <span className="font-mono text-sm font-bold tracking-widest w-16">{g.code}</span>
                    {getStatusBadge(g.status)}
                    <span className="text-sm text-muted-foreground">
                      {g.seat_count}/4 players
                    </span>
                    <span className="text-sm text-muted-foreground ml-auto hidden sm:block">
                      To {g.target_score}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground/40 group-hover:text-foreground transition-colors">
                      &rarr;
                    </span>
                  </Link>
                  <Button
                    onClick={(e) => handleDelete(e, g.id)}
                    variant="ghost"
                    size="xs"
                    disabled={deletingId === g.id}
                    className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    {deletingId === g.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              ))}
              <div className="border-t border-border/30" />
            </div>
          </section>
        )}

        {/* Open games */}
        <section>
          <SectionTitle className="mb-10 sm:mb-14">
            <SectionHeading>
              Open <AccentText>tables</AccentText>
            </SectionHeading>
            <SectionSubtitle>Public games looking for players</SectionSubtitle>
          </SectionTitle>

          {loading ? (
            <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
              Loading...
            </p>
          ) : games.length === 0 ? (
            <Panel className="text-center py-10">
              <PanelDescription className="mb-4">No open games right now</PanelDescription>
              <Button onClick={handleCreate} size="sm">
                Create One
              </Button>
            </Panel>
          ) : (
            <div className="space-y-0">
              {games.map((g) => (
                <Link key={g.id} href={`/game/online/${g.id}`}>
                  <div className="product-card relative group border-t border-border/30 py-4 sm:py-5 flex items-center gap-4 sm:gap-8 cursor-pointer transition-colors hover:bg-muted/30">
                    <span className="font-mono text-sm font-bold tracking-widest w-16">{g.code}</span>
                    <span className="text-sm text-muted-foreground">
                      by {g.owner?.username ?? "Unknown"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {g.seat_count}/4
                    </span>
                    <span className="ml-auto">
                      <Button size="xs" variant="outline">Join</Button>
                    </span>
                  </div>
                </Link>
              ))}
              <div className="border-t border-border/30" />
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
