import type { GameState, GameSettings, Player, Tile, PlayedTile, ValidMove } from "./types";
import { createTileSet, shuffle, isDouble, sameTile, pipCount } from "./tiles";

// ── Create & Deal ──

export function createGame(players: Player[], settings: GameSettings): GameState {
  const hands: Record<string, Tile[]> = {};
  const scores: Record<string, number> = {};
  for (const p of players) {
    hands[p.id] = [];
    scores[p.id] = 0;
  }

  return {
    id: crypto.randomUUID(),
    players,
    chain: [],
    boneyard: shuffle(createTileSet()),
    hands,
    currentTurn: players[0].id,
    openEnds: [-1, -1],
    scores,
    status: "waiting",
    settings,
    winner: null,
    roundWinner: null,
  };
}

export function dealTiles(state: GameState): GameState {
  const boneyard = [...state.boneyard];
  const hands: Record<string, Tile[]> = {};

  for (const p of state.players) {
    hands[p.id] = boneyard.splice(0, 7);
  }

  // Determine who goes first: player with highest double
  const firstPlayer = findFirstPlayer(state.players, hands);

  return {
    ...state,
    boneyard,
    hands,
    currentTurn: firstPlayer,
    status: "playing",
    openEnds: [-1, -1],
    chain: [],
    roundWinner: null,
  };
}

function findFirstPlayer(players: Player[], hands: Record<string, Tile[]>): string {
  let bestPlayer = players[0].id;
  let bestDouble = -1;

  for (const p of players) {
    for (const tile of hands[p.id]) {
      if (isDouble(tile) && tile.left > bestDouble) {
        bestDouble = tile.left;
        bestPlayer = p.id;
      }
    }
  }

  return bestPlayer;
}

// ── Valid Moves ──

export function getValidMoves(state: GameState, playerId: string): ValidMove[] {
  const hand = state.hands[playerId];
  if (!hand) return [];

  const [leftEnd, rightEnd] = state.openEnds;
  const moves: ValidMove[] = [];

  // Empty chain — any tile can be played on "right" (starting the chain)
  if (leftEnd === -1 && rightEnd === -1) {
    for (const tile of hand) {
      moves.push({ tile, end: "right" });
    }
    return moves;
  }

  for (const tile of hand) {
    // Can play on left end?
    if (tile.left === leftEnd || tile.right === leftEnd) {
      moves.push({ tile, end: "left" });
    }
    // Can play on right end?
    if (tile.left === rightEnd || tile.right === rightEnd) {
      // When both ends have the same value, still allow both sides so the player can choose
      if (leftEnd !== rightEnd || !moves.some((m) => sameTile(m.tile, tile) && m.end === "right")) {
        moves.push({ tile, end: "right" });
      }
    }
  }

  return moves;
}

// ── Play a Tile ──

export function playTile(
  state: GameState,
  playerId: string,
  tile: Tile,
  end: "left" | "right",
): GameState {
  // Validate it's this player's turn
  if (state.currentTurn !== playerId) return state;

  const hand = state.hands[playerId];
  const tileIndex = hand.findIndex((t) => sameTile(t, tile));
  if (tileIndex === -1) return state;

  // Validate the move is legal
  const validMoves = getValidMoves(state, playerId);
  const isValid = validMoves.some((m) => sameTile(m.tile, tile) && m.end === end);
  if (!isValid) return state;

  // Orient the tile so the matching pip faces the chain
  const oriented = orientTile(tile, end, state.openEnds);

  const played: PlayedTile = {
    ...oriented,
    playedBy: playerId,
    end,
    isDouble: isDouble(tile),
  };

  // Update chain
  const chain = end === "left"
    ? [played, ...state.chain]
    : [...state.chain, played];

  // Update open ends
  const openEnds = computeOpenEnds(chain);

  // Remove tile from hand
  const newHand = [...hand];
  newHand.splice(tileIndex, 1);

  const newState: GameState = {
    ...state,
    chain,
    openEnds,
    hands: { ...state.hands, [playerId]: newHand },
    currentTurn: nextPlayer(state),
  };

  return checkRoundEnd(newState);
}

function orientTile(
  tile: Tile,
  end: "left" | "right",
  openEnds: [number, number],
): Tile {
  const [leftEnd, rightEnd] = openEnds;

  // First tile — no orientation needed
  if (leftEnd === -1 && rightEnd === -1) return tile;

  if (end === "left") {
    // The tile's right side must match the chain's left end
    return tile.right === leftEnd ? tile : { left: tile.right, right: tile.left };
  } else {
    // The tile's left side must match the chain's right end
    return tile.left === rightEnd ? tile : { left: tile.right, right: tile.left };
  }
}

function computeOpenEnds(chain: PlayedTile[]): [number, number] {
  if (chain.length === 0) return [-1, -1];
  return [chain[0].left, chain[chain.length - 1].right];
}

// ── Draw ──

export function drawTile(state: GameState, playerId: string): GameState {
  if (state.currentTurn !== playerId) return state;
  if (state.boneyard.length === 0) return state;

  const boneyard = [...state.boneyard];
  const drawn = boneyard.pop()!;

  return {
    ...state,
    boneyard,
    hands: {
      ...state.hands,
      [playerId]: [...state.hands[playerId], drawn],
    },
  };
}

// ── Pass ──

export function passTurn(state: GameState, playerId: string): GameState {
  if (state.currentTurn !== playerId) return state;
  if (state.boneyard.length > 0) return state; // must draw if boneyard has tiles

  const validMoves = getValidMoves(state, playerId);
  if (validMoves.length > 0) return state; // must play if possible

  const newState = {
    ...state,
    currentTurn: nextPlayer(state),
  };

  return checkRoundEnd(newState);
}

// ── Round End ──

function checkRoundEnd(state: GameState): GameState {
  // Check if current player (who just played) emptied their hand
  // The previous player just played, so check all hands
  for (const p of state.players) {
    if (state.hands[p.id].length === 0) {
      return endRound(state, p.id);
    }
  }

  // Check if game is blocked: no one can play and boneyard is empty
  if (state.boneyard.length === 0) {
    const allBlocked = state.players.every(
      (p) => getValidMoves(state, p.id).length === 0,
    );
    if (allBlocked) {
      // Winner is the player with the lowest pip count
      const winner = state.players.reduce((best, p) => {
        const bestPips = state.hands[best.id].reduce((s, t) => s + pipCount(t), 0);
        const pPips = state.hands[p.id].reduce((s, t) => s + pipCount(t), 0);
        return pPips < bestPips ? p : best;
      });
      return endRound(state, winner.id);
    }
  }

  return state;
}

function endRound(state: GameState, winnerId: string): GameState {
  // Winner scores the sum of all opponents' remaining pips
  let roundPoints = 0;
  for (const p of state.players) {
    if (p.id !== winnerId) {
      roundPoints += state.hands[p.id].reduce((s, t) => s + pipCount(t), 0);
    }
  }

  const scores = { ...state.scores };
  scores[winnerId] = (scores[winnerId] || 0) + roundPoints;

  // Check if anyone reached the target score
  const isGameOver = scores[winnerId] >= state.settings.targetScore;

  return {
    ...state,
    scores,
    roundWinner: winnerId,
    winner: isGameOver ? winnerId : null,
    status: isGameOver ? "game_over" : "round_over",
  };
}

// ── Helpers ──

function nextPlayer(state: GameState): string {
  const idx = state.players.findIndex((p) => p.id === state.currentTurn);
  return state.players[(idx + 1) % state.players.length].id;
}
