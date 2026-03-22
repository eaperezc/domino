import type { Tile } from "./types";

/** Generate the full double-six domino set (28 tiles). */
export function createTileSet(): Tile[] {
  const tiles: Tile[] = [];
  for (let left = 0; left <= 6; left++) {
    for (let right = left; right <= 6; right++) {
      tiles.push({ left, right });
    }
  }
  return tiles;
}

/** Fisher-Yates shuffle (returns a new array). */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Total pip count of a tile. */
export function pipCount(tile: Tile): number {
  return tile.left + tile.right;
}

/** Check if a tile is a double. */
export function isDouble(tile: Tile): boolean {
  return tile.left === tile.right;
}

/** Check if two tiles are the same (order-independent). */
export function sameTile(a: Tile, b: Tile): boolean {
  return (a.left === b.left && a.right === b.right) ||
         (a.left === b.right && a.right === b.left);
}

/** Unique string id for a tile. */
export function tileId(tile: Tile): string {
  const lo = Math.min(tile.left, tile.right);
  const hi = Math.max(tile.left, tile.right);
  return `${lo}-${hi}`;
}
