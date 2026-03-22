"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch open public games (waiting status)
      const { data: openGames } = await supabase
        .from("games")
        .select("id, code, status, target_score, created_at, owner_id")
        .eq("status", "waiting")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch my active games
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

        // Get seat counts
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

      // Enrich open games
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
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push("/game/online")}>
            Play or Join Game
          </Button>
        </div>

        {/* My active games */}
        {myGames.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">My Games</h2>
            <div className="grid gap-3">
              {myGames.map((g) => (
                <Link key={g.id} href={g.status === "waiting" ? `/game/online/${g.id}` : `/game/online/${g.id}/play`}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold tracking-widest">{g.code}</span>
                        {getStatusBadge(g.status)}
                        <span className="text-sm text-muted-foreground">
                          {g.seat_count}/4 players
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Target: {g.target_score}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Open games to join */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Open Games</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading games...</p>
          ) : games.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-3">No open games right now</p>
                <Button onClick={() => router.push("/game/online")} size="sm">
                  Create One
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {games.map((g) => (
                <Link key={g.id} href={`/game/online/${g.id}`}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold tracking-widest">{g.code}</span>
                        <span className="text-sm text-muted-foreground">
                          by {g.owner?.username ?? "Unknown"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {g.seat_count}/4 players
                        </span>
                      </div>
                      <Button size="sm" variant="outline">Join</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
