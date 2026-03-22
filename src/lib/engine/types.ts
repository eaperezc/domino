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
}

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
  scores: Record<string, number>;
  status: "waiting" | "playing" | "round_over" | "game_over";
  settings: GameSettings;
  winner: string | null;
  roundWinner: string | null;
}

// ── Moves ──

export interface ValidMove {
  tile: Tile;
  end: "left" | "right";
}
