"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { GameState, Tile } from "./types";
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
const AI_ID = "ai";

function initGame(): GameState {
  const game = createGame(
    [
      { id: HUMAN_ID, name: "You", isAI: false },
      { id: AI_ID, name: "Computer", isAI: true },
    ],
    { playerCount: 2, targetScore: 100 },
  );
  return dealTiles(game);
}

export function useGameController() {
  const [state, setState] = useState<GameState | null>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const aiThinking = useRef(false);

  // Initialize game client-side only to avoid hydration mismatch from random shuffle
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!state) setState(initGame()); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isHumanTurn = state?.currentTurn === HUMAN_ID && state?.status === "playing";

  const validMoves = isHumanTurn && state ? getValidMoves(state, HUMAN_ID) : [];

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

  const handlePlayTile = useCallback(
    (end: "left" | "right") => {
      if (!selectedTile || !isHumanTurn || !state) return;
      setState(playTile(state, HUMAN_ID, selectedTile, end));
      setSelectedTile(null);
    },
    [state, selectedTile, isHumanTurn],
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

  // AI turn logic
  useEffect(() => {
    if (!state) return;
    if (state.status !== "playing") return;
    if (state.currentTurn !== AI_ID) return;
    if (aiThinking.current) return;

    aiThinking.current = true;

    const runAI = () => {
      setState((current) => {
        if (!current || current.currentTurn !== AI_ID || current.status !== "playing") {
          aiThinking.current = false;
          return current;
        }

        const decision = chooseMove(current, AI_ID);

        let next: GameState;
        switch (decision.action) {
          case "play":
            next = playTile(current, AI_ID, decision.tile, decision.end);
            break;
          case "draw":
            next = drawTile(current, AI_ID);
            setTimeout(runAI, 400);
            return next;
          case "pass":
            next = passTurn(current, AI_ID);
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
    isHumanTurn,
    selectedTile,
    validMoves,
    canPlay,
    canDraw,
    mustPass,
    selectTile,
    playTile: handlePlayTile,
    drawTile: handleDrawTile,
    passTurn: handlePassTurn,
    startNewRound,
    startNewGame,
  };
}
