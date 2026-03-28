import type { PlayedTile } from "../engine/types";
import type { TileRenderState, DropZoneRenderState, BoardLayout } from "./types";
import { TILE_WIDTH, TILE_HEIGHT, TILE_GAP } from "./types";
import { tileId } from "../engine/tiles";

type Direction = "right" | "down" | "left" | "up";

interface Cursor {
  x: number;
  y: number;
  dir: Direction;
}

const BOARD_MARGIN_LARGE = 80;
const BOARD_MARGIN_SMALL = 30;
const MIN_TILES_BEFORE_BEND = 2;

/**
 * Layout: the chain array is ordered [leftmost ... rightmost].
 * We find the starter tile (first "right" end tile), place it at center,
 * then walk outward in both directions.
 */
export function computeLayout(
  chain: PlayedTile[],
  boardWidth: number,
  boardHeight: number,
): BoardLayout {
  const boardMargin = boardWidth < 640 ? BOARD_MARGIN_SMALL : BOARD_MARGIN_LARGE;

  if (chain.length === 0) {
    return {
      tiles: [],
      dropZones: [{ end: "right", cursorX: 0, cursorY: 0, direction: "right" as const, isLeftArm: false }],
      bounds: { minX: -100, minY: -100, maxX: 100, maxY: 100 },
    };
  }

  // Find the starter tile: the first tile with end === "right"
  // (all tiles before it were prepended with end === "left")
  let starterIndex = 0;
  for (let i = 0; i < chain.length; i++) {
    if (chain[i].end === "right") {
      starterIndex = i;
      break;
    }
  }

  const tiles: TileRenderState[] = new Array(chain.length);

  // Place the starter tile centered on (0, 0)
  const starterDbl = chain[starterIndex].isDouble;
  const starterW = starterDbl ? TILE_HEIGHT : TILE_WIDTH;
  const starterOrigin = -starterW / 2; // offset so tile center is at x=0
  tiles[starterIndex] = makeTileRender(chain[starterIndex], starterIndex, tilePosition({ x: starterOrigin, y: 0, dir: "right" }, starterDbl), starterDbl, "right", true, "starter");

  // Walk RIGHT from the starter
  const rightCursor: Cursor = { x: starterOrigin, y: 0, dir: "right" };
  advanceCursor(rightCursor, starterDbl);

  let rightTilesSinceBend = MIN_TILES_BEFORE_BEND;
  let rightLastDbl = starterDbl;
  let rightBendCount = 0;
  for (let i = starterIndex + 1; i < chain.length; i++) {
    const played = chain[i];
    const dbl = played.isDouble;

    const advance = dbl ? TILE_HEIGHT + TILE_GAP : TILE_WIDTH + TILE_GAP;
    if (rightTilesSinceBend >= MIN_TILES_BEFORE_BEND && shouldBend(rightCursor, advance, boardWidth, boardHeight, boardMargin)) {
      // Snake pattern: bends 0,1 go CW (down then left), bends 2,3 go CCW (up then right), etc.
      const rightTurn: "clockwise" | "counter" = Math.floor(rightBendCount / 2) % 2 === 0 ? "clockwise" : "counter";
      bendCursor(rightCursor, rightLastDbl, rightTurn);
      rightBendCount++;
      rightTilesSinceBend = 0;
    }

    const pos = tilePosition(rightCursor, dbl);
    tiles[i] = makeTileRender(played, i, pos, dbl, rightCursor.dir, false, "right");
    advanceCursor(rightCursor, dbl);
    rightLastDbl = dbl;
    rightTilesSinceBend++;
  }

  // Walk LEFT from the starter.
  // The left cursor starts at -GAP (just left of the starter's left edge).
  // For "left" direction, tilePosition places the tile so its right edge is at cursor.x.
  const leftCursor: Cursor = { x: starterOrigin - TILE_GAP, y: 0, dir: "left" };

  let leftTilesSinceBend = MIN_TILES_BEFORE_BEND;
  let leftLastDbl = starterDbl;
  let leftBendCount = 0;
  for (let i = starterIndex - 1; i >= 0; i--) {
    const played = chain[i];
    const dbl = played.isDouble;

    const tileW = dbl ? TILE_HEIGHT : TILE_WIDTH;
    const advance = tileW + TILE_GAP;
    if (leftTilesSinceBend >= MIN_TILES_BEFORE_BEND && shouldBend(leftCursor, advance, boardWidth, boardHeight, boardMargin)) {
      // Snake pattern: bends 0,1 go CW (down then right), bends 2,3 go CCW (up then left), etc.
      const leftTurn: "clockwise" | "counter" = Math.floor(leftBendCount / 2) % 2 === 0 ? "clockwise" : "counter";
      bendCursor(leftCursor, leftLastDbl, leftTurn);
      leftBendCount++;
      leftTilesSinceBend = 0;
    }

    // For "left" direction, place tile so its right edge aligns with cursor.x
    const pos = tilePositionLeft(leftCursor, dbl);
    tiles[i] = makeTileRender(played, i, pos, dbl, leftCursor.dir, false, "left");

    // Move cursor further left past this tile
    switch (leftCursor.dir) {
      case "left":  leftCursor.x -= advance; break;
      case "right": leftCursor.x += advance; break;
      case "down":  leftCursor.y += advance; break;
      case "up":    leftCursor.y -= advance; break;
    }
    leftLastDbl = dbl;
    leftTilesSinceBend++;
  }

  // Drop zones — store raw cursor position + direction so the renderer
  // can compute the correct rect based on the dragged tile (double vs not).
  const dropZones: DropZoneRenderState[] = [];

  dropZones.push({
    end: "left",
    cursorX: leftCursor.x,
    cursorY: leftCursor.y,
    direction: leftCursor.dir,
    isLeftArm: true,
  });

  dropZones.push({
    end: "right",
    cursorX: rightCursor.x,
    cursorY: rightCursor.y,
    direction: rightCursor.dir,
    isLeftArm: false,
  });

  // Bounds — use non-double position as a reasonable estimate for padding
  const padding = TILE_WIDTH + 40;
  const leftDZPos = tilePositionLeft(leftCursor, false);
  const rightDZPos = tilePosition(rightCursor, false);
  const allX = [...tiles.map((t) => t.x), leftDZPos.x, rightDZPos.x];
  const allY = [...tiles.map((t) => t.y), leftDZPos.y, rightDZPos.y];
  const bounds = {
    minX: Math.min(...allX) - padding,
    minY: Math.min(...allY) - padding,
    maxX: Math.max(...allX) + padding + TILE_WIDTH,
    maxY: Math.max(...allY) + padding + TILE_WIDTH,
  };

  return { tiles, dropZones, bounds };
}

type Arm = "right" | "left" | "starter";

function makeTileRender(
  played: PlayedTile,
  index: number,
  pos: { x: number; y: number },
  isDbl: boolean,
  dir: Direction,
  isStarter = false,
  arm: Arm = "right",
): TileRenderState {
  const isHorizontalChain = dir === "right" || dir === "left";
  const orientation = (isHorizontalChain !== isDbl) ? "horizontal" : "vertical";

  // The engine orients tiles so left=backward, right=forward in the chain array.
  // When the visual direction changes after bending, we need to swap left/right
  // so the connecting pips still face the correct side visually.
  //
  // Right arm (going right initially): swap when going up or left
  // Left arm (going left initially): swap when going down or right
  const shouldFlip =
    (arm === "right" && (dir === "up" || dir === "left")) ||
    (arm === "left" && (dir === "down" || dir === "right"));

  const left = shouldFlip ? played.right : played.left;
  const right = shouldFlip ? played.left : played.right;

  return {
    tileId: `${tileId(played)}-${index}`,
    x: pos.x,
    y: pos.y,
    rotation: 0,
    left,
    right,
    isDouble: isDbl,
    orientation,
    isStarter,
  };
}

/**
 * Compute the top-left position of a tile centered on the chain centerline.
 */
function tilePosition(cursor: Cursor, isDbl: boolean): { x: number; y: number } {
  switch (cursor.dir) {
    case "right": {
      if (isDbl) return { x: cursor.x, y: cursor.y - TILE_WIDTH / 2 };
      return { x: cursor.x, y: cursor.y - TILE_HEIGHT / 2 };
    }
    case "left": {
      if (isDbl) return { x: cursor.x - TILE_HEIGHT, y: cursor.y - TILE_WIDTH / 2 };
      return { x: cursor.x - TILE_WIDTH, y: cursor.y - TILE_HEIGHT / 2 };
    }
    case "down": {
      if (isDbl) return { x: cursor.x - TILE_WIDTH / 2, y: cursor.y };
      return { x: cursor.x - TILE_HEIGHT / 2, y: cursor.y };
    }
    case "up": {
      if (isDbl) return { x: cursor.x - TILE_WIDTH / 2, y: cursor.y - TILE_HEIGHT };
      return { x: cursor.x - TILE_HEIGHT / 2, y: cursor.y - TILE_WIDTH };
    }
  }
}

/**
 * Position for the left-walk cursor. The cursor.x is the right edge of the slot.
 * For "left" dir: tile top-left is at (cursor.x - tileW, centered on centerline).
 * After bending, other directions follow normal logic.
 */
function tilePositionLeft(cursor: Cursor, isDbl: boolean): { x: number; y: number } {
  switch (cursor.dir) {
    case "left": {
      const tileW = isDbl ? TILE_HEIGHT : TILE_WIDTH;
      if (isDbl) return { x: cursor.x - tileW, y: cursor.y - TILE_WIDTH / 2 };
      return { x: cursor.x - tileW, y: cursor.y - TILE_HEIGHT / 2 };
    }
    // After bending, use the same logic as the right walk
    case "down": {
      if (isDbl) return { x: cursor.x - TILE_WIDTH / 2, y: cursor.y };
      return { x: cursor.x - TILE_HEIGHT / 2, y: cursor.y };
    }
    case "right": {
      if (isDbl) return { x: cursor.x, y: cursor.y - TILE_WIDTH / 2 };
      return { x: cursor.x, y: cursor.y - TILE_HEIGHT / 2 };
    }
    case "up": {
      if (isDbl) return { x: cursor.x - TILE_WIDTH / 2, y: cursor.y - TILE_HEIGHT };
      return { x: cursor.x - TILE_HEIGHT / 2, y: cursor.y - TILE_WIDTH };
    }
  }
}

function advanceCursor(cursor: Cursor, isDbl: boolean): void {
  const advance = (isDbl ? TILE_HEIGHT : TILE_WIDTH) + TILE_GAP;
  switch (cursor.dir) {
    case "right": cursor.x += advance; break;
    case "left":  cursor.x -= advance; break;
    case "down":  cursor.y += advance; break;
    case "up":    cursor.y -= advance; break;
  }
}

/** Bend the cursor in the given turn direction */
function bendCursor(cursor: Cursor, lastWasDouble: boolean, turn: "clockwise" | "counter"): void {
  const oldDir = cursor.dir;
  cursor.dir = turnDirection(oldDir, turn);

  // Remove the gap from the last advance
  switch (oldDir) {
    case "right": cursor.x -= TILE_GAP; break;
    case "left":  cursor.x += TILE_GAP; break;
    case "down":  cursor.y -= TILE_GAP; break;
    case "up":    cursor.y += TILE_GAP; break;
  }

  // After advancing past the last tile, the cursor is at the leading edge + GAP.
  // We already removed the GAP above. Now the cursor is at the leading edge of the last tile.
  //
  // For the new segment:
  // - Along the OLD direction: back up by TILE_HEIGHT/2 so the new row aligns.
  // - Perpendicular to OLD direction: shift outward to clear the chain row.
  //   The perpendicular direction depends on whether we're turning CW or CCW.
  const half = TILE_HEIGHT / 2;
  const extra = lastWasDouble ? (TILE_WIDTH - TILE_HEIGHT) / 2 + TILE_GAP : 0;

  // Perpendicular sign: CCW turns shift in one direction, CW in the opposite
  const sign = turn === "counter" ? 1 : -1;

  switch (oldDir) {
    case "right":
      // CCW: → turning to ↑ (shift y negative)
      // CW:  → turning to ↓ (shift y positive)
      cursor.x -= half;
      cursor.y -= sign * (half + extra);
      break;
    case "up":
      // CCW: ↑ turning to ← (shift x negative)
      // CW:  ↑ turning to → (shift x positive)
      cursor.y += half;
      cursor.x -= sign * (half + extra);
      break;
    case "left":
      // CCW: ← turning to ↓ (shift y positive)
      // CW:  ← turning to ↑ (shift y negative)
      cursor.x += half;
      cursor.y += sign * (half + extra);
      break;
    case "down":
      // CCW: ↓ turning to → (shift x positive)
      // CW:  ↓ turning to ← (shift x negative)
      cursor.y -= half;
      cursor.x += sign * (half + extra);
      break;
  }
}

function shouldBend(
  cursor: Cursor,
  advance: number,
  boardWidth: number,
  boardHeight: number,
  margin: number,
): boolean {
  const halfW = boardWidth / 2 - margin;
  const halfH = boardHeight / 2 - margin;

  switch (cursor.dir) {
    case "right":  return cursor.x + advance > halfW;
    case "left":   return cursor.x - advance < -halfW;
    case "down":   return cursor.y + advance > halfH;
    case "up":     return cursor.y - advance < -halfH;
  }
}

function turnDirection(dir: Direction, turn: "clockwise" | "counter"): Direction {
  const order: Direction[] = ["right", "down", "left", "up"];
  const idx = order.indexOf(dir);
  const offset = turn === "clockwise" ? 1 : -1;
  return order[(idx + offset + 4) % 4];
}
