import type { GameState, ValidMove } from "./types";
import { getValidMoves } from "./engine";
import { pipCount } from "./tiles";

export type AIDecision =
  | { action: "play"; tile: ValidMove["tile"]; end: ValidMove["end"] }
  | { action: "draw" }
  | { action: "pass" };

/** Simple greedy AI: play the heaviest valid tile. */
export function chooseMove(state: GameState, playerId: string): AIDecision {
  const moves = getValidMoves(state, playerId);

  if (moves.length > 0) {
    // Pick the move with the highest pip count
    const best = moves.reduce((a, b) =>
      pipCount(b.tile) > pipCount(a.tile) ? b : a,
    );
    return { action: "play", tile: best.tile, end: best.end };
  }

  if (state.boneyard.length > 0) {
    return { action: "draw" };
  }

  return { action: "pass" };
}
