// ── Core tile types ──

export interface Tile {
  left: number;  // 0-6
  right: number; // 0-6
}

export interface PlayedTile {
  left: number;
  right: number;
  playedBy: string;
  end: "left" | "right"; // which end of the chain it was placed on
  isDouble: boolean;
}

// ── Player ──

export interface Player {
  id: string;
  name: string;
  isAI: boolean;
  team: string; // team identifier (e.g., "team1", "team2")
}

// ── Seating ──

export type SeatPosition = "bottom" | "left" | "top" | "right";

/** Maps player ID to their seat position around the board */
export type SeatingMap = Record<string, SeatPosition>;

// ── Game settings ──

export interface GameSettings {
  playerCount: number;
  targetScore: number;
}

// ── Game state ──

export interface GameState {
  id: string;
  players: Player[];
  chain: PlayedTile[];
  boneyard: Tile[];
  hands: Record<string, Tile[]>;
  currentTurn: string;
  openEnds: [number, number]; // [-1, -1] means any tile can start
  scores: Record<string, number>; // team scores
  status: "waiting" | "playing" | "round_over" | "game_over";
  settings: GameSettings;
  winner: string | null;       // winning team id
  roundWinner: string | null;  // player who went out (or lowest pips)
  winningTeam: string | null;  // team that won the round/game
}

// ── Moves ──

export interface ValidMove {
  tile: Tile;
  end: "left" | "right";
}
