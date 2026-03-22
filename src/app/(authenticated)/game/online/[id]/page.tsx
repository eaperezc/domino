"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  const [changingSeat, setChangingSeat] = useState(false);
  const [fillWithAI, setFillWithAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabaseRef = useRef(createClient());

  // Load initial data
  useEffect(() => {
    const supabase = supabaseRef.current;
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

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
  }, [gameId]);

  // Subscribe to realtime changes
  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`lobby-${gameId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_seats", filter: `game_id=eq.${gameId}` },
        () => {
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
  }, [gameId, router]);

  const handleTakeSeat = useCallback(
    async (seat: SeatPosition) => {
      if (!userId || changingSeat) return;
      setError(null);
      setChangingSeat(true);

      // Optimistic: remove from old seat, place in new
      const oldSeats = seats;
      const myCurrent = seats.find((s) => s.player_id === userId);
      let optimistic = seats.filter((s) => s.player_id !== userId);
      optimistic = [
        ...optimistic,
        {
          id: "optimistic",
          seat,
          player_id: userId,
          player_name: myCurrent?.player_name ?? "You",
          team: seat === "bottom" || seat === "top" ? "team1" : "team2",
          is_ai: false,
        },
      ];
      setSeats(optimistic);

      const res = await fetch("/api/games/seat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, seat }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        setSeats(oldSeats); // rollback
      }
      setChangingSeat(false);
    },
    [gameId, userId, seats, changingSeat],
  );

  const handleDelete = useCallback(async () => {
    if (!confirm("Are you sure you want to delete this game?")) return;
    setError(null);
    const res = await fetch("/api/games/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
    } else {
      router.push("/home");
    }
  }, [gameId, router]);

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
  const emptySeats = 4 - seats.length;

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
            <div className="grid grid-cols-3 grid-rows-3 gap-3 max-w-sm mx-auto">
              {/* Top seat - Team 1 */}
              <div className="col-start-2 aspect-square">
                <SeatSlot
                  seat={seatMap.get("top")}
                  position="top"
                  team="team1"
                  isMe={mySeat?.seat === "top"}
                  canTake={!seatMap.has("top") && !!userId && !changingSeat}
                  onTake={() => handleTakeSeat("top")}
                />
              </div>

              {/* Left seat - Team 2 */}
              <div className="col-start-1 row-start-2 aspect-square">
                <SeatSlot
                  seat={seatMap.get("left")}
                  position="left"
                  team="team2"
                  isMe={mySeat?.seat === "left"}
                  canTake={!seatMap.has("left") && !!userId && !changingSeat}
                  onTake={() => handleTakeSeat("left")}
                />
              </div>

              {/* Center - table / status */}
              <div className="col-start-2 row-start-2 aspect-square flex items-center justify-center">
                <div className="w-full h-full rounded-md bg-muted/50 border border-border flex flex-col items-center justify-center gap-1">
                  {changingSeat ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-[10px] text-muted-foreground">Changing...</span>
                    </>
                  ) : (
                    <svg viewBox="0 0 40 40" className="w-8 h-8 text-muted-foreground/50">
                      <rect x="4" y="4" width="32" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
                      <line x1="20" y1="6" x2="20" y2="34" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Right seat - Team 2 */}
              <div className="col-start-3 row-start-2 aspect-square">
                <SeatSlot
                  seat={seatMap.get("right")}
                  position="right"
                  team="team2"
                  isMe={mySeat?.seat === "right"}
                  canTake={!seatMap.has("right") && !!userId && !changingSeat}
                  onTake={() => handleTakeSeat("right")}
                />
              </div>

              {/* Bottom seat - Team 1 */}
              <div className="col-start-2 row-start-3 aspect-square">
                <SeatSlot
                  seat={seatMap.get("bottom")}
                  position="bottom"
                  team="team1"
                  isMe={mySeat?.seat === "bottom"}
                  canTake={!seatMap.has("bottom") && !!userId && !changingSeat}
                  onTake={() => handleTakeSeat("bottom")}
                />
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-info/20 border border-info/40" />
                <span className="text-muted-foreground">Team 1 (Top + Bottom)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-warning/20 border border-warning/40" />
                <span className="text-muted-foreground">Team 2 (Left + Right)</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3">
          {isOwner && (
            <>
              {emptySeats > 0 && (
                <div className="flex items-center gap-3">
                  <Switch
                    id="fill-ai"
                    checked={fillWithAI}
                    onCheckedChange={setFillWithAI}
                  />
                  <Label htmlFor="fill-ai" className="text-sm text-muted-foreground">
                    Fill {emptySeats} empty {emptySeats === 1 ? "seat" : "seats"} with AI
                  </Label>
                </div>
              )}
              <Button
                onClick={handleStart}
                disabled={starting || (emptySeats > 0 && !fillWithAI)}
                size="lg"
              >
                {starting
                  ? "Starting..."
                  : emptySeats > 0 && fillWithAI
                    ? `Start Game (${humanCount} players + ${emptySeats} AI)`
                    : "Start Game"
                }
              </Button>
              {emptySeats > 0 && !fillWithAI && (
                <p className="text-xs text-muted-foreground">
                  Waiting for {emptySeats} more {emptySeats === 1 ? "player" : "players"} or enable AI fill
                </p>
              )}
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Delete Game
              </Button>
            </>
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
  const isTeam1 = team === "team1";
  const teamColor = isTeam1 ? "info" : "warning";
  const teamLabel = isTeam1 ? "T1" : "T2";

  const baseClasses = "w-full h-full rounded-md border flex flex-col items-center justify-center gap-1 text-xs transition-colors";

  if (seat) {
    return (
      <div
        className={`${baseClasses} ${
          isMe
            ? `border-${teamColor} bg-${teamColor}/15`
            : `border-${teamColor}/30 bg-${teamColor}/5`
        }`}
        style={{
          borderColor: isMe
            ? `var(--${teamColor})`
            : `color-mix(in srgb, var(--${teamColor}) 30%, transparent)`,
          backgroundColor: isMe
            ? `color-mix(in srgb, var(--${teamColor}) 15%, transparent)`
            : `color-mix(in srgb, var(--${teamColor}) 5%, transparent)`,
        }}
      >
        <div className="font-medium truncate max-w-full px-1">
          {seat.is_ai ? `${seat.player_name}` : seat.player_name}
        </div>
        <div className="flex items-center gap-1">
          <span
            className="text-[10px] font-medium px-1 rounded"
            style={{
              color: `var(--${teamColor})`,
              backgroundColor: `color-mix(in srgb, var(--${teamColor}) 15%, transparent)`,
            }}
          >
            {teamLabel}
          </span>
          {seat.is_ai && (
            <span className="text-[10px] text-muted-foreground">AI</span>
          )}
        </div>
        {isMe && (
          <span className="text-[10px] font-medium" style={{ color: `var(--${teamColor})` }}>
            You
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onTake}
      disabled={!canTake}
      className={`${baseClasses} border-2 border-dashed text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
      style={{
        borderColor: `color-mix(in srgb, var(--${teamColor}) 25%, transparent)`,
        backgroundColor: `color-mix(in srgb, var(--${teamColor}) 5%, transparent)`,
      }}
      onMouseEnter={(e) => {
        if (canTake) e.currentTarget.style.borderColor = `var(--${teamColor})`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `color-mix(in srgb, var(--${teamColor}) 25%, transparent)`;
      }}
    >
      <span
        className="text-xs font-medium px-1.5 py-0.5 rounded"
        style={{
          color: `var(--${teamColor})`,
          backgroundColor: `color-mix(in srgb, var(--${teamColor}) 10%, transparent)`,
        }}
      >
        {teamLabel}
      </span>
      <span className="text-sm font-medium">Open</span>
    </button>
  );
}
