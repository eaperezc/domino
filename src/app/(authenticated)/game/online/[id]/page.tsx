"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Panel } from "@/components/ui/panel";
import { SectionTitle, SectionHeading } from "@/components/ui/section-title";
import AccentText from "@/components/AccentText";
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

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
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
      setLoading(false);
    }
    load();
  }, [gameId]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/games/${gameId}/lobby-stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { status: string; seats: Seat[] };
        setSeats(data.seats);

        if (data.status === "playing") {
          eventSource.close();
          router.push(`/game/online/${gameId}/play`);
        }
      } catch {
        // ignore
      }
    };

    return () => {
      eventSource.close();
    };
  }, [gameId, router]);

  const handleTakeSeat = useCallback(
    async (seat: SeatPosition) => {
      if (!userId || changingSeat) return;
      setError(null);
      setChangingSeat(true);

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
        setSeats(oldSeats);
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
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Loading lobby...
        </p>
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
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Game <AccentText>Lobby</AccentText>
          </h1>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Code:</span>
            <span className="font-mono text-3xl font-bold tracking-[0.3em]">{game.code}</span>
          </div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
            Share this code with friends to join
          </p>
        </div>

        {/* Seat layout */}
        <Panel>
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground text-center mb-4">
            Choose your seat
          </p>
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

            {/* Center - table */}
            <div className="col-start-2 row-start-2 aspect-square flex items-center justify-center">
              <div className="w-full h-full border border-border/30 flex flex-col items-center justify-center gap-1">
                {changingSeat ? (
                  <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground animate-pulse">
                    Changing...
                  </span>
                ) : (
                  <svg viewBox="0 0 40 40" className="w-8 h-8 text-muted-foreground/30">
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
              <span className="inline-block w-3 h-3 border border-info/40 bg-info/20" />
              <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">Team 1</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 border border-warning/40 bg-warning/20" />
              <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">Team 2</span>
            </span>
          </div>
        </Panel>

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
                  <label htmlFor="fill-ai" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                    Fill {emptySeats} empty {emptySeats === 1 ? "seat" : "seats"} with AI
                  </label>
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
                    ? `Start Game (${humanCount} + ${emptySeats} AI)`
                    : "Start Game"
                }
              </Button>
              {emptySeats > 0 && !fillWithAI && (
                <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                  Waiting for {emptySeats} more {emptySeats === 1 ? "player" : "players"} or enable AI
                </p>
              )}
              <Button variant="ghost" size="xs" onClick={handleDelete} className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10">
                Delete Game
              </Button>
            </>
          )}
          {!isOwner && (
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground animate-pulse">
              Waiting for host to start...
            </p>
          )}
          {error && <p className="font-mono text-xs text-destructive">{error}</p>}
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

  const baseClasses = "w-full h-full border flex flex-col items-center justify-center gap-1 text-xs transition-colors";

  if (seat) {
    return (
      <div
        className={baseClasses}
        style={{
          borderColor: isMe
            ? `var(--${teamColor})`
            : `color-mix(in srgb, var(--${teamColor}) 30%, transparent)`,
          backgroundColor: isMe
            ? `color-mix(in srgb, var(--${teamColor}) 15%, transparent)`
            : `color-mix(in srgb, var(--${teamColor}) 5%, transparent)`,
        }}
      >
        <div className="font-mono text-xs font-medium truncate max-w-full px-1">
          {seat.player_name}
        </div>
        <div className="flex items-center gap-1">
          <span
            className="font-mono text-[10px] font-medium px-1 rounded"
            style={{
              color: `var(--${teamColor})`,
              backgroundColor: `color-mix(in srgb, var(--${teamColor}) 15%, transparent)`,
            }}
          >
            {teamLabel}
          </span>
          {seat.is_ai && (
            <span className="font-mono text-[10px] text-muted-foreground">AI</span>
          )}
        </div>
        {isMe && (
          <span className="font-mono text-[10px] font-medium" style={{ color: `var(--${teamColor})` }}>
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
        className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded"
        style={{
          color: `var(--${teamColor})`,
          backgroundColor: `color-mix(in srgb, var(--${teamColor}) 10%, transparent)`,
        }}
      >
        {teamLabel}
      </span>
      <span className="font-mono text-xs font-medium uppercase">Open</span>
    </button>
  );
}
