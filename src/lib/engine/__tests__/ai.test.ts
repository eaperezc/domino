import { describe, it, expect } from "vitest";
import type { GameState, Player } from "../types";
import { createGame, dealTiles, playTile, getValidMoves } from "../engine";
import { chooseMove } from "../ai";

const PLAYERS: Player[] = [
  { id: "p1", name: "Player 1", isAI: false },
  { id: "ai", name: "AI", isAI: true },
];

function setupGame(): GameState {
  return dealTiles(createGame(PLAYERS, { playerCount: 2, targetScore: 100 }));
}

describe("chooseMove", () => {
  it("plays a tile when valid moves exist", () => {
    let game = setupGame();

    // Make it AI's turn with valid moves
    if (game.currentTurn !== "ai") {
      const p1Tile = game.hands["p1"][0];
      game = playTile(game, "p1", p1Tile, "right");
    }

    // Give AI a tile that matches
    const [leftEnd] = game.openEnds;
    if (leftEnd !== -1) {
      game = {
        ...game,
        hands: {
          ...game.hands,
          ai: [{ left: leftEnd, right: 0 }, ...game.hands["ai"]],
        },
      };
    }

    const decision = chooseMove(game, "ai");
    expect(decision.action).toBe("play");
  });

  it("draws when no valid moves but boneyard has tiles", () => {
    let game = setupGame();

    // Set up: AI's turn, no matching tiles, boneyard has tiles
    game = {
      ...game,
      currentTurn: "ai",
      chain: [
        { left: 6, right: 6, playedBy: "p1", end: "right" as const, isDouble: true },
      ],
      openEnds: [6, 6] as [number, number],
      hands: { ...game.hands, ai: [{ left: 0, right: 1 }] },
      boneyard: [{ left: 2, right: 3 }],
    };

    const decision = chooseMove(game, "ai");
    expect(decision.action).toBe("draw");
  });

  it("passes when no valid moves and boneyard is empty", () => {
    let game = setupGame();

    game = {
      ...game,
      currentTurn: "ai",
      chain: [
        { left: 6, right: 6, playedBy: "p1", end: "right" as const, isDouble: true },
      ],
      openEnds: [6, 6] as [number, number],
      hands: { ...game.hands, ai: [{ left: 0, right: 1 }] },
      boneyard: [],
    };

    const decision = chooseMove(game, "ai");
    expect(decision.action).toBe("pass");
  });

  it("prefers heavier tiles (greedy strategy)", () => {
    let game = setupGame();

    game = {
      ...game,
      currentTurn: "ai",
      openEnds: [-1, -1] as [number, number],
      hands: {
        ...game.hands,
        ai: [
          { left: 1, right: 2 }, // 3 pips
          { left: 5, right: 6 }, // 11 pips
          { left: 0, right: 3 }, // 3 pips
        ],
      },
    };

    const decision = chooseMove(game, "ai");
    expect(decision.action).toBe("play");
    if (decision.action === "play") {
      expect(decision.tile.left + decision.tile.right).toBe(11);
    }
  });
});
