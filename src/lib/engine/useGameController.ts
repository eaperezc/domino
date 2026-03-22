"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GameState, Tile, Player, SeatingMap } from "./types";
import {
  createGame,
  dealTiles,
  playTile,
  drawTile,
  passTurn,
  getValidMoves,
} from "./engine";
import { chooseMove } from "./ai";
import { sameTile } from "./tiles";

const HUMAN_ID = "human";

const PLAYERS_2V2: Player[] = [
  { id: "human",    name: "You",      isAI: false, team: "team1" },
  { id: "ai-left",  name: "West",     isAI: true,  team: "team2" },
  { id: "ai-top",   name: "Partner",  isAI: true,  team: "team1" },
  { id: "ai-right", name: "East",     isAI: true,  team: "team2" },
];

export const SEATING: SeatingMap = {
  "human":    "bottom",
  "ai-left":  "left",
  "ai-top":   "top",
  "ai-right": "right",
};

function initGame(): GameState {
  const game = createGame(PLAYERS_2V2, { playerCount: 4, targetScore: 200 });
  return dealTiles(game);
}

export function useGameController() {
  const [state, setState] = useState<GameState | null>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [handOrder, setHandOrder] = useState<number[] | null>(null);
  const prevHandLength = useRef(0);
  const aiThinking = useRef(false);

  // Initialize client-side only
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!state) setState(initGame()); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset hand order when hand length changes (tile played/drawn/new round)
  const handLength = state?.hands[HUMAN_ID]?.length ?? 0;
  if (handLength !== prevHandLength.current) {
    prevHandLength.current = handLength;
    if (handOrder !== null) setHandOrder(null);
  }

  const isHumanTurn = state?.currentTurn === HUMAN_ID && state?.status === "playing";

  const validMoves = isHumanTurn && state ? getValidMoves(state, HUMAN_ID) : [];

  // Ordered hand
  const rawHand = state?.hands[HUMAN_ID] ?? [];
  const orderedHand = handOrder && handOrder.length === rawHand.length
    ? handOrder.map((i) => rawHand[i])
    : rawHand;

  const selectTile = useCallback(
    (tile: Tile) => {
      if (!isHumanTurn) return;
      if (selectedTile && sameTile(selectedTile, tile)) {
        setSelectedTile(null);
      } else {
        setSelectedTile(tile);
      }
    },
    [isHumanTurn, selectedTile],
  );

  const reorderHand = useCallback((fromIndex: number, toIndex: number) => {
    setHandOrder((prev) => {
      const base = prev ?? Array.from({ length: handLength }, (_, i) => i);
      const next = [...base];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, [handLength]);

  const handlePlayTile = useCallback(
    (tile: Tile, end: "left" | "right") => {
      if (!isHumanTurn || !state) return;
      setState(playTile(state, HUMAN_ID, tile, end));
      setSelectedTile(null);
    },
    [state, isHumanTurn],
  );

  const handleDrawTile = useCallback(() => {
    if (!isHumanTurn || !state) return;
    if (state.boneyard.length === 0) return;
    setState(drawTile(state, HUMAN_ID));
  }, [state, isHumanTurn]);

  const handlePassTurn = useCallback(() => {
    if (!isHumanTurn || !state) return;
    setState(passTurn(state, HUMAN_ID));
  }, [state, isHumanTurn]);

  const startNewRound = useCallback(() => {
    setState((prev) => prev ? dealTiles(prev) : initGame());
    setSelectedTile(null);
  }, []);

  const startNewGame = useCallback(() => {
    setState(initGame());
    setSelectedTile(null);
  }, []);

  // AI turn logic — triggers for any AI player
  useEffect(() => {
    if (!state) return;
    if (state.status !== "playing") return;
    if (state.currentTurn === HUMAN_ID) return;

    // Check if current player is AI
    const currentPlayer = state.players.find((p) => p.id === state.currentTurn);
    if (!currentPlayer?.isAI) return;
    if (aiThinking.current) return;

    aiThinking.current = true;

    const runAI = () => {
      setState((current) => {
        if (!current || current.currentTurn === HUMAN_ID || current.status !== "playing") {
          aiThinking.current = false;
          return current;
        }

        const aiId = current.currentTurn;
        const decision = chooseMove(current, aiId);

        let next: GameState;
        switch (decision.action) {
          case "play":
            next = playTile(current, aiId, decision.tile, decision.end);
            break;
          case "draw":
            next = drawTile(current, aiId);
            setTimeout(runAI, 400);
            return next;
          case "pass":
            next = passTurn(current, aiId);
            break;
          default:
            next = current;
        }

        aiThinking.current = false;
        return next;
      });
    };

    const timeout = setTimeout(runAI, 700);
    return () => {
      clearTimeout(timeout);
      aiThinking.current = false;
    };
  }, [state]);

  const canPlay = validMoves.length > 0;
  const canDraw = (state?.boneyard.length ?? 0) > 0;
  const mustPass = isHumanTurn && !canPlay && !canDraw;

  return {
    state,
    humanId: HUMAN_ID,
    seating: SEATING,
    isHumanTurn,
    selectedTile,
    validMoves,
    orderedHand,
    canPlay,
    canDraw,
    mustPass,
    selectTile,
    reorderHand,
    playTile: handlePlayTile,
    drawTile: handleDrawTile,
    passTurn: handlePassTurn,
    startNewRound,
    startNewGame,
  };
}
