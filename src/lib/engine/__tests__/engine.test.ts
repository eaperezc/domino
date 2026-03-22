import { describe, it, expect } from "vitest";
import type { GameState, Player, Tile } from "../types";
import {
  createGame,
  dealTiles,
  playTile,
  drawTile,
  passTurn,
  getValidMoves,
} from "../engine";
import { sameTile } from "../tiles";

const PLAYERS: Player[] = [
  { id: "p1", name: "Player 1", isAI: false, team: "t1" },
  { id: "p2", name: "Player 2", isAI: false, team: "t2" },
];

const SETTINGS = { playerCount: 2, targetScore: 100 };

function setupGame(): GameState {
  return dealTiles(createGame(PLAYERS, SETTINGS));
}

describe("createGame", () => {
  it("initializes with correct structure", () => {
    const game = createGame(PLAYERS, SETTINGS);
    expect(game.players).toHaveLength(2);
    expect(game.boneyard).toHaveLength(28);
    expect(game.chain).toHaveLength(0);
    expect(game.status).toBe("waiting");
    expect(game.hands["p1"]).toHaveLength(0);
    expect(game.hands["p2"]).toHaveLength(0);
  });
});

describe("dealTiles", () => {
  it("deals 7 tiles to each player", () => {
    const game = setupGame();
    expect(game.hands["p1"]).toHaveLength(7);
    expect(game.hands["p2"]).toHaveLength(7);
  });

  it("leaves correct number in boneyard", () => {
    const game = setupGame();
    // 28 - 7 - 7 = 14
    expect(game.boneyard).toHaveLength(14);
  });

  it("sets status to playing", () => {
    const game = setupGame();
    expect(game.status).toBe("playing");
  });

  it("sets open ends to [-1, -1] (any tile can start)", () => {
    const game = setupGame();
    expect(game.openEnds).toEqual([-1, -1]);
  });

  it("assigns first turn to player with highest double", () => {
    // Run multiple times to ensure it finds the right player
    for (let i = 0; i < 10; i++) {
      const game = setupGame();
      const currentPlayer = game.currentTurn;
      const hand = game.hands[currentPlayer];
      const otherPlayer = currentPlayer === "p1" ? "p2" : "p1";
      const otherHand = game.hands[otherPlayer];

      const myHighestDouble = hand
        .filter((t) => t.left === t.right)
        .reduce((max, t) => Math.max(max, t.left), -1);
      const otherHighestDouble = otherHand
        .filter((t) => t.left === t.right)
        .reduce((max, t) => Math.max(max, t.left), -1);

      expect(myHighestDouble).toBeGreaterThanOrEqual(otherHighestDouble);
    }
  });
});

describe("getValidMoves", () => {
  it("allows any tile when chain is empty", () => {
    const game = setupGame();
    const moves = getValidMoves(game, game.currentTurn);
    expect(moves).toHaveLength(7); // all tiles are valid
    moves.forEach((m) => expect(m.end).toBe("right"));
  });

  it("only allows tiles matching open ends", () => {
    let game = setupGame();
    const playerId = game.currentTurn;

    // Play the first tile to establish open ends
    const firstTile = game.hands[playerId][0];
    game = playTile(game, playerId, firstTile, "right");

    // Now check the other player's valid moves
    const nextPlayer = game.currentTurn;
    const moves = getValidMoves(game, nextPlayer);
    const [leftEnd, rightEnd] = game.openEnds;

    for (const move of moves) {
      const { tile } = move;
      const matchesLeft = tile.left === leftEnd || tile.right === leftEnd;
      const matchesRight = tile.left === rightEnd || tile.right === rightEnd;
      expect(matchesLeft || matchesRight).toBe(true);
    }
  });

  it("returns empty array for player with no matching tiles", () => {
    let game = setupGame();
    const playerId = game.currentTurn;

    // Force a specific board state where the next player can't match
    // by manually setting hands
    const firstTile: Tile = { left: 6, right: 6 };
    game = {
      ...game,
      hands: {
        ...game.hands,
        [playerId]: [firstTile, ...game.hands[playerId].slice(1)],
      },
    };
    game = playTile(game, playerId, firstTile, "right");

    // Give the other player tiles that don't have a 6
    const nextPlayer = game.currentTurn;
    game = {
      ...game,
      hands: {
        ...game.hands,
        [nextPlayer]: [
          { left: 0, right: 1 },
          { left: 0, right: 2 },
          { left: 1, right: 2 },
        ],
      },
    };

    const moves = getValidMoves(game, nextPlayer);
    expect(moves).toHaveLength(0);
  });
});

describe("playTile", () => {
  it("adds tile to chain", () => {
    let game = setupGame();
    const playerId = game.currentTurn;
    const tile = game.hands[playerId][0];

    game = playTile(game, playerId, tile, "right");
    expect(game.chain).toHaveLength(1);
  });

  it("removes tile from player hand", () => {
    let game = setupGame();
    const playerId = game.currentTurn;
    const tile = game.hands[playerId][0];

    game = playTile(game, playerId, tile, "right");
    expect(game.hands[playerId]).toHaveLength(6);
    expect(game.hands[playerId].some((t) => sameTile(t, tile))).toBe(false);
  });

  it("updates open ends correctly", () => {
    let game = setupGame();
    const playerId = game.currentTurn;
    const tile = game.hands[playerId][0];

    game = playTile(game, playerId, tile, "right");
    expect(game.openEnds[0]).toBe(tile.left);
    expect(game.openEnds[1]).toBe(tile.right);
  });

  it("advances turn to next player", () => {
    let game = setupGame();
    const playerId = game.currentTurn;
    const tile = game.hands[playerId][0];

    game = playTile(game, playerId, tile, "right");
    expect(game.currentTurn).not.toBe(playerId);
  });

  it("rejects play when not player's turn", () => {
    const game = setupGame();
    const notCurrentPlayer = game.currentTurn === "p1" ? "p2" : "p1";
    const tile = game.hands[notCurrentPlayer][0];

    const result = playTile(game, notCurrentPlayer, tile, "right");
    expect(result).toBe(game); // unchanged
  });

  it("orients tile correctly when playing on left end", () => {
    let game = setupGame();
    const p = game.currentTurn;

    // Play first tile: [3, 5]
    game = {
      ...game,
      hands: { ...game.hands, [p]: [{ left: 3, right: 5 }] },
    };
    game = playTile(game, p, { left: 3, right: 5 }, "right");
    // openEnds should be [3, 5]
    expect(game.openEnds).toEqual([3, 5]);

    // Next player plays on left end with a tile that has 3
    const np = game.currentTurn;
    game = {
      ...game,
      hands: { ...game.hands, [np]: [{ left: 1, right: 3 }] },
    };
    game = playTile(game, np, { left: 1, right: 3 }, "left");

    // The tile should be oriented so its right side (3) matches the left end
    // openEnds should now be [1, 5]
    expect(game.openEnds).toEqual([1, 5]);
    expect(game.chain).toHaveLength(2);
  });
});

describe("drawTile", () => {
  it("moves a tile from boneyard to player hand", () => {
    const game = setupGame();
    const playerId = game.currentTurn;
    const boneyardBefore = game.boneyard.length;
    const handBefore = game.hands[playerId].length;

    const after = drawTile(game, playerId);
    expect(after.boneyard).toHaveLength(boneyardBefore - 1);
    expect(after.hands[playerId]).toHaveLength(handBefore + 1);
  });

  it("does nothing when boneyard is empty", () => {
    let game = setupGame();
    game = { ...game, boneyard: [] };
    const playerId = game.currentTurn;

    const after = drawTile(game, playerId);
    expect(after).toBe(game);
  });

  it("does not advance turn", () => {
    const game = setupGame();
    const playerId = game.currentTurn;

    const after = drawTile(game, playerId);
    expect(after.currentTurn).toBe(playerId);
  });
});

describe("passTurn", () => {
  it("advances turn when player has no moves and boneyard is empty", () => {
    let game = setupGame();
    const p = game.currentTurn;

    // Set up: empty boneyard, player has no matching tiles
    game = {
      ...game,
      boneyard: [],
      chain: [
        { left: 6, right: 6, playedBy: "p2", end: "right" as const, isDouble: true },
      ],
      openEnds: [6, 6] as [number, number],
      hands: {
        ...game.hands,
        [p]: [{ left: 0, right: 1 }],
      },
    };

    const after = passTurn(game, p);
    expect(after.currentTurn).not.toBe(p);
  });

  it("does not allow pass when boneyard has tiles", () => {
    const game = setupGame();
    const playerId = game.currentTurn;

    const after = passTurn(game, playerId);
    expect(after).toBe(game); // unchanged because boneyard has tiles
  });
});

describe("round end", () => {
  it("detects win when player empties their hand", () => {
    let game = setupGame();
    const p = game.currentTurn;

    // Give player exactly one tile and make it playable
    game = {
      ...game,
      hands: { ...game.hands, [p]: [{ left: 3, right: 5 }] },
      openEnds: [-1, -1] as [number, number],
    };

    game = playTile(game, p, { left: 3, right: 5 }, "right");
    expect(game.status).toBe("round_over");
    expect(game.roundWinner).toBe(p);
  });

  it("scores winning team with opposing team's remaining pips", () => {
    let game = setupGame();
    const p = game.currentTurn;
    const pTeam = game.players.find((pl) => pl.id === p)!.team;
    const other = p === "p1" ? "p2" : "p1";

    game = {
      ...game,
      hands: {
        [p]: [{ left: 3, right: 5 }],
        [other]: [{ left: 6, right: 6 }, { left: 4, right: 2 }], // 12 + 6 = 18 pips
      },
      openEnds: [-1, -1] as [number, number],
    };

    game = playTile(game, p, { left: 3, right: 5 }, "right");
    expect(game.scores[pTeam]).toBe(18);
  });

  it("detects blocked game when no one can play", () => {
    let game = setupGame();
    const p1 = "p1";
    const p2 = "p2";

    // Set up a blocked game: both players have tiles that don't match, no boneyard
    game = {
      ...game,
      currentTurn: p1,
      boneyard: [],
      chain: [
        { left: 6, right: 6, playedBy: p1, end: "right" as const, isDouble: true },
      ],
      openEnds: [6, 6] as [number, number],
      hands: {
        [p1]: [{ left: 0, right: 1 }], // 1 pip
        [p2]: [{ left: 2, right: 3 }], // 5 pips
      },
    };

    // p1 passes, p2 passes — should detect block
    game = passTurn(game, p1);
    game = passTurn(game, p2);

    expect(game.status).toBe("round_over");
    expect(game.roundWinner).toBe(p1); // lower pip count wins
  });
});
