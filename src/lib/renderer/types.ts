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

export interface DropZoneRenderState {
  end: "left" | "right";
  x: number;
  y: number;
  rotation: number;
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
