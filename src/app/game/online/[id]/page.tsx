"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SeatPosition } from "@/lib/engine/types";

interface Seat {
  id: string;
  seat: SeatPosition;
  player_id: string | null;
  player_name: string;
  team: string;
  is_ai: boolean;
}

interface Game {
  id: string;
  code: string;
  owner_id: string;
  status: string;
  target_score: number;
}

const SEATS: { position: SeatPosition; label: string; team: string }[] = [
  { position: "top", label: "Top", team: "team1" },
  { position: "left", label: "Left", team: "team2" },
  { position: "right", label: "Right", team: "team2" },
  { position: "bottom", label: "Bottom", team: "team1" },
];

export default function GameLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Load initial data
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUserId(user.id);

      const { data: gameData } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (!gameData) {
        setError("Game not found");
        setLoading(false);
        return;
      }

      setGame(gameData as Game);

      const { data: seatData } = await supabase
        .from("game_seats")
        .select("*")
        .eq("game_id", gameId);

      setSeats((seatData ?? []) as Seat[]);
      setLoading(false);
    }
    load();
  }, [gameId, router, supabase]);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel(`lobby-${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_seats", filter: `game_id=eq.${gameId}` },
        () => {
          // Refetch seats on any change
          supabase
            .from("game_seats")
            .select("*")
            .eq("game_id", gameId)
            .then(({ data }) => setSeats((data ?? []) as Seat[]));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          const updated = payload.new as Game;
          setGame(updated);
          if (updated.status === "playing") {
            router.push(`/game/online/${gameId}/play`);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, router, supabase]);

  const handleTakeSeat = useCallback(
    async (seat: SeatPosition) => {
      setError(null);
      const res = await fetch("/api/games/seat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, seat }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
      }
    },
    [gameId],
  );

  const handleStart = useCallback(async () => {
    setError(null);
    setStarting(true);
    const res = await fetch("/api/games/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      setStarting(false);
    }
    // Realtime will handle the redirect
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading lobby...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-destructive">{error ?? "Game not found"}</p>
      </div>
    );
  }

  const isOwner = userId === game.owner_id;
  const seatMap = new Map(seats.map((s) => [s.seat, s]));
  const mySeat = seats.find((s) => s.player_id === userId);
  const humanCount = seats.filter((s) => !s.is_ai).length;

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Game Lobby</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground">Code:</span>
            <span className="font-mono text-xl font-bold tracking-widest">{game.code}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this code with friends to join
          </p>
        </div>

        {/* Seat layout - table view */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-base">Choose Your Seat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 grid-rows-3 gap-2 max-w-xs mx-auto">
              {/* Top seat */}
              <div className="col-start-2">
                <SeatSlot
                  seat={seatMap.get("top")}
                  position="top"
                  team="team1"
                  isMe={mySeat?.seat === "top"}
                  canTake={!seatMap.has("top") && !!userId}
                  onTake={() => handleTakeSeat("top")}
                />
              </div>

              {/* Left seat */}
              <div className="col-start-1 row-start-2">
                <SeatSlot
                  seat={seatMap.get("left")}
                  position="left"
                  team="team2"
                  isMe={mySeat?.seat === "left"}
                  canTake={!seatMap.has("left") && !!userId}
                  onTake={() => handleTakeSeat("left")}
                />
              </div>

              {/* Center - table */}
              <div className="col-start-2 row-start-2 flex items-center justify-center">
                <div className="w-full aspect-square rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  Table
                </div>
              </div>

              {/* Right seat */}
              <div className="col-start-3 row-start-2">
                <SeatSlot
                  seat={seatMap.get("right")}
                  position="right"
                  team="team2"
                  isMe={mySeat?.seat === "right"}
                  canTake={!seatMap.has("right") && !!userId}
                  onTake={() => handleTakeSeat("right")}
                />
              </div>

              {/* Bottom seat */}
              <div className="col-start-2 row-start-3">
                <SeatSlot
                  seat={seatMap.get("bottom")}
                  position="bottom"
                  team="team1"
                  isMe={mySeat?.seat === "bottom"}
                  canTake={!seatMap.has("bottom") && !!userId}
                  onTake={() => handleTakeSeat("bottom")}
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span><Badge variant="outline" className="mr-1">T1</Badge> Top + Bottom</span>
              <span><Badge variant="outline" className="mr-1">T2</Badge> Left + Right</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3">
          {isOwner && (
            <Button onClick={handleStart} disabled={starting} size="lg">
              {starting ? "Starting..." : `Start Game (${humanCount} players, ${4 - humanCount} AI)`}
            </Button>
          )}
          {!isOwner && (
            <p className="text-sm text-muted-foreground">
              Waiting for the host to start the game...
            </p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function SeatSlot({
  seat,
  position,
  team,
  isMe,
  canTake,
  onTake,
}: {
  seat?: Seat;
  position: SeatPosition;
  team: string;
  isMe: boolean;
  canTake: boolean;
  onTake: () => void;
}) {
  if (seat) {
    return (
      <div
        className={`rounded-md border p-2 text-center text-xs space-y-1 ${
          isMe ? "border-primary bg-primary/10" : "border-border bg-card"
        }`}
      >
        <div className="font-medium truncate">
          {seat.is_ai ? `${seat.player_name} (AI)` : seat.player_name}
        </div>
        <Badge variant="outline" className="text-[10px]">
          {team === "team1" ? "T1" : "T2"}
        </Badge>
        {isMe && <div className="text-primary text-[10px]">You</div>}
      </div>
    );
  }

  return (
    <button
      onClick={onTake}
      disabled={!canTake}
      className="w-full rounded-md border border-dashed border-border p-2 text-center text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="font-medium">{position}</div>
      <div className="text-[10px]">Empty</div>
    </button>
  );
}
