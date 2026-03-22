# Board Rendering & Tile Layout

This document covers how tiles are **visually placed** on the board. This is entirely separate from the game engine — the renderer reads logical game state and produces a spatial layout.

## Tile Orientation Rules

### Non-doubles: inline (lengthwise)
Non-double tiles are placed **lengthwise**, aligned with the direction the chain is growing. The matching pip half touches the open end.

```
──[3|5]──[5|2]──[2|6]──
```

### Doubles: perpendicular (crosswise)
Doubles are **always placed crosswise** — rotated 90° relative to the chain direction, straddling the line.

```
            ┌───┐
──[3|5]──── │ 5 │ ────[5|2]──
            │ 5 │
            └───┘
```

This is a universal convention in all domino games, physical and digital.

## Chain Growth & Bending

The chain starts from a center tile and grows outward in both directions. When it approaches the edge of the board, it **bends 90°** to stay on-screen.

```
                ┌───┐
  [6|4][4|3]    │ 3 │
                │ 3 │
                └───┘
                  │
                [3|1][1|5][5|2]──►  (continues...)
```

Key rules for the renderer:
- **Bending is purely visual** — it has no game logic meaning
- Turns are always 90° (right angles)
- The chain snakes back and forth across the board as it grows
- Doubles can serve as natural visual turning points (since they're already perpendicular)
- The renderer decides when to bend based on available board space

## Spinner Layout (Future: All Fives variant)

A **spinner** is the first double played, which allows branching in **4 directions**, forming a cross:

```
              [1|4]
                │
  [3|1]──── [1 | 1] ────[1|6]
                │
              [1|2]
```

Spinner rules:
1. First two tiles played off the spinner extend the **main line** (left/right)
2. Third and fourth tiles start the **perpendicular arms** (up/down)
3. After all four arms exist, any open end can be played on

For MVP (draw dominoes), spinners are not used — the chain is a simple line with two open ends.

## Renderer Responsibilities

The renderer translates the engine's logical chain into visual positions:

| Input (from engine)          | Output (renderer computes)        |
| ---------------------------- | --------------------------------- |
| Ordered list of played tiles | (x, y) position for each tile     |
| Which end each tile is on    | Rotation angle (0°, 90°, 180°, 270°) |
| Whether tile is a double     | Perpendicular vs inline placement |
| Open ends                    | Highlight valid drop zones        |

### Layout Algorithm (simplified)

```
1. Start at board center
2. Walk the chain in each direction (left arm, right arm)
3. For each tile:
   a. If double → place perpendicular to current direction
   b. If non-double → place inline with current direction
   c. If next tile would go off-screen → insert a 90° turn
4. Store computed { x, y, rotation } for each tile
```

### Render State (separate from game state)

```typescript
interface TileRenderState {
  tileId: string;
  x: number;
  y: number;
  rotation: number;       // degrees
  isHighlighted: boolean; // valid drop zone
}

interface BoardRenderState {
  tiles: TileRenderState[];
  viewportOffset: { x: number; y: number }; // pan
  zoom: number;
  boardBounds: { width: number; height: number };
}
```

## Visual References

- [DominoRules.com — The Basics](https://www.dominorules.com/the-basics) — line of play, doubles crosswise, spinner rules
- [Pagat.com — All Fives](https://www.pagat.com/domino/cross/all_fives.html) — spinner cross layout with four arms
- [Pagat.com — Block with Spinners](https://www.pagat.com/domino/cross/block_sp.html) — crowded board handling, chicken-foot bending
- [Masters of Games — Dominoes Rules](https://www.mastersofgames.com/rules/dominoes-rules.htm) — chain formation, snake-like development
- [Dribbble — Dominoes designs](https://dribbble.com/tags/dominoes) — UI/visual design inspiration
- [GitHub — Dominoes topic](https://github.com/topics/dominoes) — open source implementations for reference
