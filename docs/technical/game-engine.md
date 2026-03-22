# Game Engine & State Management

## Design Principle: Engine ≠ Renderer

The game engine is a **pure logic layer** with zero knowledge of how tiles are displayed. It tracks what tiles exist, who holds them, what moves are legal, and what the score is. It has **no concept of positions, rotations, coordinates, or visual layout**.

The renderer (see [board-rendering.md](./board-rendering.md)) is a completely separate layer that reads engine state and decides how to draw it. This separation means:

- The engine can run identically on client and server
- The renderer can be swapped (canvas, SVG, 3D) without touching game logic
- Tests for game rules don't need any rendering setup
- The renderer never mutates game state — it only reads it

```
┌──────────────────┐        reads         ┌──────────────────┐
│   Game Engine    │ ──────────────────►  │    Renderer      │
│  (pure logic)    │                      │  (visual layer)  │
│                  │                      │                  │
│  - tile values   │                      │  - positions     │
│  - hands         │                      │  - rotations     │
│  - open ends     │                      │  - bending       │
│  - turn order    │                      │  - animations    │
│  - scores        │                      │  - drag/drop     │
│  - move validity │                      │  - zoom/pan      │
└──────────────────┘                      └──────────────────┘
```

## Game State

The engine state is purely logical — an ordered chain with open ends, not a spatial layout.

```typescript
interface GameState {
  id: string;
  players: Player[];
  chain: PlayedTile[];        // ordered sequence of placed tiles (logical, not spatial)
  boneyard: Tile[];           // draw pile
  hands: Map<string, Tile[]>; // player id -> their tiles
  currentTurn: string;        // player id
  openEnds: [number, number]; // the two playable pip values
  scores: Map<string, number>;
  status: 'waiting' | 'playing' | 'round_over' | 'game_over';
  settings: GameSettings;
}

interface Tile {
  left: number;  // 0-6
  right: number; // 0-6
}

interface PlayedTile extends Tile {
  playedBy: string;
  end: 'left' | 'right';     // which end of the chain it was placed on
  isDouble: boolean;          // doubles have special visual treatment (but engine doesn't care how)
}
```

## Game Engine API

```typescript
// Pure functions — no side effects, no visual concerns
function createGame(settings: GameSettings): GameState;
function dealTiles(state: GameState): GameState;
function playTile(state: GameState, playerId: string, tile: Tile, end: 'left' | 'right'): GameState;
function drawTile(state: GameState, playerId: string): GameState;
function passTurn(state: GameState, playerId: string): GameState;
function getValidMoves(state: GameState, playerId: string): ValidMove[];
function checkRoundEnd(state: GameState): GameState;
function calculateScore(state: GameState): Map<string, number>;
```

## Client-Side State

- Full game state received on join (minus opponents' hands)
- Incremental updates via WebSocket events
- **Game engine state** managed separately from **render state**
- React state for UI-specific concerns (selected tile, drag position, animations) lives in the renderer layer
- Game engine functions reused client-side for move validation / preview
