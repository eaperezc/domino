export type TileOrientation = "horizontal" | "vertical";

export interface TileRenderState {
  tileId: string;
  x: number;
  y: number;
  rotation: number; // degrees: 0, 90, 180, 270
  left: number;
  right: number;
  isDouble: boolean;
  orientation: TileOrientation;
  isStarter: boolean;
}

export type DropZoneDirection = "right" | "down" | "left" | "up";

export interface DropZoneRenderState {
  end: "left" | "right";
  /** Raw cursor x (chain attachment point) */
  cursorX: number;
  /** Raw cursor y (chain attachment point) */
  cursorY: number;
  direction: DropZoneDirection;
  /** Whether this zone uses the left-arm positioning logic */
  isLeftArm: boolean;
}

export interface BoardLayout {
  tiles: TileRenderState[];
  dropZones: DropZoneRenderState[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

// Tile dimensions (in logical pixels)
export const TILE_WIDTH = 110;  // long side
export const TILE_HEIGHT = 55;  // short side
export const TILE_GAP = 2;

/**
 * Compute the rendered rectangle for a drop zone given the cursor state
 * and whether the tile being placed is a double.
 */
export function dropZoneRect(
  dz: DropZoneRenderState,
  isDbl: boolean,
): { x: number; y: number; width: number; height: number } {
  const { cursorX: cx, cursorY: cy, direction: dir, isLeftArm } = dz;

  // Determine orientation: doubles are perpendicular to chain direction
  const isHorizontalChain = dir === "right" || dir === "left";
  // When chain is horizontal: non-double=horizontal, double=vertical → swap
  // When chain is vertical: non-double=vertical, double=horizontal → swap
  const tileW = isHorizontalChain
    ? (isDbl ? TILE_HEIGHT : TILE_WIDTH)
    : (isDbl ? TILE_WIDTH : TILE_HEIGHT);
  const tileH = isHorizontalChain
    ? (isDbl ? TILE_WIDTH : TILE_HEIGHT)
    : (isDbl ? TILE_HEIGHT : TILE_WIDTH);

  // For left arm in its initial "left" direction, position from right edge
  if (isLeftArm && dir === "left") {
    const xOffset = isDbl ? TILE_HEIGHT : TILE_WIDTH;
    return {
      x: cx - xOffset,
      y: cy - tileH / 2,
      width: tileW,
      height: tileH,
    };
  }

  // Standard positioning (right arm, or left arm after bending)
  switch (dir) {
    case "right":
      return { x: cx, y: cy - tileH / 2, width: tileW, height: tileH };
    case "left":
      return { x: cx - tileW, y: cy - tileH / 2, width: tileW, height: tileH };
    case "down":
      return { x: cx - tileW / 2, y: cy, width: tileW, height: tileH };
    case "up":
      return { x: cx - tileW / 2, y: cy - tileH, width: tileW, height: tileH };
  }
}
