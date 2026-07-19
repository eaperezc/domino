import { playTile, drawTile, passTurn } from "./engine";
import { chooseMove } from "./ai";
import type { GameState } from "./types";

/** Advance the game through consecutive AI turns until a human is up (or the round ends). */
export function processAITurns(state: GameState): GameState {
  let current = state;

  while (current.status === "playing") {
    const player = current.players.find((p) => p.id === current.currentTurn);
    if (!player?.isAI) break;

    const decision = chooseMove(current, player.id);

    switch (decision.action) {
      case "play":
        current = playTile(current, player.id, decision.tile, decision.end);
        break;
      case "draw":
        current = drawTile(current, player.id);
        continue;
      case "pass":
        current = passTurn(current, player.id);
        break;
    }
  }

  return current;
}
