"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { getValidMoves } from "./engine";
import type { GameState, Tile, ValidMove, SeatingMap, SeatPosition } from "./types";

const SEAT_POSITIONS: Record<number, SeatPosition> = {
  0: "bottom",
  1: "right",
  2: "top",
  3: "left",
};

export function useOnlineGameController(gameId: string) {
  const [state, setState] = useState<GameState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handOrder, setHandOrder] = useState<number[] | null>(null);

  const supabase = createClient();

  // Load initial state and user
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data: game } = await supabase
        .from("games")
        .select("game_state")
        .eq("id", gameId)
        .single();

      if (game?.game_state) {
        setState(game.game_state as unknown as GameState);
      }
      setLoading(false);
    }
    load();
  }, [gameId, supabase]);

  // Subscribe to game state changes
  useEffect(() => {
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          const gs = (payload.new as { game_state: unknown }).game_state;
          if (gs) {
            setState(gs as unknown as GameState);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, supabase]);

  // Reset hand order when hand changes
  const myHand = state?.hands[userId ?? ""] ?? [];
  const handLength = myHand.length;
  useEffect(() => {
    setHandOrder(null);
  }, [handLength]);

  const orderedHand = useMemo(() => {
    if (!handOrder) return myHand;
    return handOrder.map((i) => myHand[i]).filter(Boolean);
  }, [myHand, handOrder]);

  const reorderHand = useCallback(
    (fromIndex: number, toIndex: number) => {
      setHandOrder((prev) => {
        const base = prev ?? Array.from({ length: handLength }, (_, i) => i);
        const next = [...base];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });
    },
    [handLength],
  );

  // Seating map based on player order
  const seating = useMemo<SeatingMap>(() => {
    if (!state || !userId) return {};

    // Find user's index in the player array
    const myIndex = state.players.findIndex((p) => p.id === userId);
    if (myIndex === -1) return {};

    const map: SeatingMap = {};
    for (let i = 0; i < state.players.length; i++) {
      const offset = (i - myIndex + 4) % 4;
      map[state.players[i].id] = SEAT_POSITIONS[offset];
    }
    return map;
  }, [state, userId]);

  const validMoves = useMemo<ValidMove[]>(() => {
    if (!state || !userId) return [];
    return getValidMoves(state, userId);
  }, [state, userId]);

  const isMyTurn = state?.currentTurn === userId;
  const canPlay = validMoves.length > 0;
  const canDraw = isMyTurn && !canPlay && (state?.boneyard.length ?? 0) > 0;
  const mustPass = isMyTurn && !canPlay && !canDraw;

  // Actions
  const playTile = useCallback(
    async (tile: Tile, end: "left" | "right") => {
      setError(null);
      const res = await fetch("/api/games/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, action: "play", tile, end }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
      }
    },
    [gameId],
  );

  const drawTile = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/games/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, action: "draw" }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
    }
  }, [gameId]);

  const passTurn = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/games/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, action: "pass" }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
    }
  }, [gameId]);

  const startNewRound = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/games/new-round", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
    }
  }, [gameId]);

  return {
    state,
    loading,
    error,
    userId,
    seating,
    validMoves,
    isMyTurn,
    canPlay,
    canDraw,
    mustPass,
    orderedHand,
    reorderHand,
    playTile,
    drawTile,
    passTurn,
    startNewRound,
  };
}
