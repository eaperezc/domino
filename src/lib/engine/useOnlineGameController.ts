"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getValidMoves, playTile as enginePlayTile, drawTile as engineDrawTile, passTurn as enginePassTurn } from "./engine";
import type { GameState, Tile, ValidMove, SeatingMap, SeatPosition } from "./types";

const SEAT_POSITIONS: Record<number, SeatPosition> = {
  0: "bottom",
  1: "left",
  2: "top",
  3: "right",
};

export function useOnlineGameController(gameId: string) {
  const [serverState, setServerState] = useState<GameState | null>(null);
  const [optimisticState, setOptimisticState] = useState<GameState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handOrder, setHandOrder] = useState<number[] | null>(null);
  const pendingAction = useRef(false);

  const state = optimisticState ?? serverState;

  // Load user on mount
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // SSE subscription for game state
  useEffect(() => {
    const eventSource = new EventSource(`/api/games/${gameId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const gs = JSON.parse(event.data) as GameState;
        setServerState(gs);
        setOptimisticState(null);
        setSaving(false);
      } catch {
        // ignore parse errors
      }

      if (!loading) return;
      setLoading(false);
    };

    eventSource.onerror = () => {
      // EventSource auto-reconnects — just clear loading if stuck
      setLoading(false);
    };

    // First message clears loading
    const onFirstMessage = () => {
      setLoading(false);
      eventSource.removeEventListener("message", onFirstMessage);
    };
    eventSource.addEventListener("message", onFirstMessage);

    return () => {
      eventSource.close();
    };
  }, [gameId, loading]);

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

  const seating = useMemo<SeatingMap>(() => {
    if (!state || !userId) return {};
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

  const sendAction = useCallback(
    async (
      action: string,
      optimistic: GameState | null,
      body: Record<string, unknown>,
    ) => {
      if (pendingAction.current) return;
      pendingAction.current = true;

      setError(null);
      setSaving(true);

      if (optimistic) {
        setOptimisticState(optimistic);
      }

      try {
        const res = await fetch(`/api/games/${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId, ...body }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error);
          setOptimisticState(null);
          setSaving(false);
        }
        // SSE will deliver the new state
      } catch {
        setOptimisticState(null);
        setSaving(false);
        setError("Network error");
      } finally {
        pendingAction.current = false;
      }
    },
    [gameId],
  );

  const playTile = useCallback(
    async (tile: Tile, end: "left" | "right") => {
      if (!serverState || !userId) return;
      const optimistic = enginePlayTile(serverState, userId, tile, end);
      if (optimistic === serverState) return;
      await sendAction("action", optimistic, { action: "play", tile, end });
    },
    [serverState, userId, sendAction],
  );

  const drawTile = useCallback(async () => {
    if (!serverState || !userId) return;
    const optimistic = engineDrawTile(serverState, userId);
    if (optimistic === serverState) return;
    await sendAction("action", optimistic, { action: "draw" });
  }, [serverState, userId, sendAction]);

  const passTurn = useCallback(async () => {
    if (!serverState || !userId) return;
    const optimistic = enginePassTurn(serverState, userId);
    if (optimistic === serverState) return;
    await sendAction("action", optimistic, { action: "pass" });
  }, [serverState, userId, sendAction]);

  const startNewRound = useCallback(async () => {
    await sendAction("new-round", null, {});
  }, [sendAction]);

  return {
    state,
    loading,
    saving,
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
