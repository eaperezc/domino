import { describe, it, expect } from "vitest";
import type { PlayedTile } from "../../engine/types";
import { computeLayout } from "../layout";
import { TILE_WIDTH, TILE_HEIGHT } from "../types";

function tile(left: number, right: number, end: "left" | "right" = "right"): PlayedTile {
  return { left, right, playedBy: "test", end, isDouble: left === right };
}

describe("computeLayout", () => {
  it("returns empty layout with one drop zone for empty chain", () => {
    const layout = computeLayout([], 900, 500);
    expect(layout.tiles).toHaveLength(0);
    expect(layout.dropZones).toHaveLength(1);
  });

  it("places a single non-double tile", () => {
    const layout = computeLayout([tile(3, 5)], 900, 500);
    expect(layout.tiles).toHaveLength(1);
    expect(layout.tiles[0].orientation).toBe("horizontal");
    expect(layout.dropZones).toHaveLength(2);
  });

  it("places a single double tile vertically", () => {
    const layout = computeLayout([tile(5, 5)], 900, 500);
    expect(layout.tiles).toHaveLength(1);
    expect(layout.tiles[0].orientation).toBe("vertical");
  });

  it("doubles are perpendicular to non-doubles on horizontal chain", () => {
    const chain = [tile(2, 3), tile(3, 3), tile(3, 6)];
    const layout = computeLayout(chain, 900, 500);

    expect(layout.tiles[0].orientation).toBe("horizontal"); // non-double
    expect(layout.tiles[1].orientation).toBe("vertical");   // double
    expect(layout.tiles[2].orientation).toBe("horizontal"); // non-double
  });

  it("tiles are placed left-to-right with increasing x", () => {
    const chain = [tile(1, 3), tile(3, 5), tile(5, 2)];
    const layout = computeLayout(chain, 900, 500);

    for (let i = 1; i < layout.tiles.length; i++) {
      expect(layout.tiles[i].x).toBeGreaterThan(layout.tiles[i - 1].x);
    }
  });

  it("doubles take less horizontal space than non-doubles", () => {
    const chain = [tile(2, 3), tile(3, 3), tile(3, 6)];
    const layout = computeLayout(chain, 900, 500);

    const gap01 = layout.tiles[1].x - layout.tiles[0].x;
    const gap12 = layout.tiles[2].x - layout.tiles[1].x;

    // The gap from non-double to double should be TILE_WIDTH advance
    // The gap from double to non-double should be TILE_HEIGHT advance
    expect(gap01).toBeGreaterThan(gap12);
  });

  it("doubles are centered vertically on the chain line", () => {
    const chain = [tile(2, 3), tile(3, 3), tile(3, 6)];
    const layout = computeLayout(chain, 900, 500);

    const nonDoubleY = layout.tiles[0].y;
    const doubleY = layout.tiles[1].y;
    const nonDoubleCenterY = nonDoubleY + TILE_HEIGHT / 2;
    const doubleCenterY = doubleY + TILE_WIDTH / 2;

    expect(doubleCenterY).toBe(nonDoubleCenterY);
  });

  it("bends chain when it reaches board edge", () => {
    // Create a long chain that should trigger bending on a small board
    const chain = Array.from({ length: 8 }, (_, i) => tile(i % 7, (i + 1) % 7));
    const layout = computeLayout(chain, 400, 400);

    // After bending, not all tiles should have the same y
    const ys = new Set(layout.tiles.map((t) => t.y));
    expect(ys.size).toBeGreaterThan(1);
  });

  it("provides two drop zones (left and right) when chain has tiles", () => {
    const layout = computeLayout([tile(3, 5)], 900, 500);
    expect(layout.dropZones).toHaveLength(2);

    const ends = layout.dropZones.map((d) => d.end);
    expect(ends).toContain("left");
    expect(ends).toContain("right");
  });

  it("left drop zone is to the left of the first tile", () => {
    const layout = computeLayout([tile(3, 5)], 900, 500);
    const leftDZ = layout.dropZones.find((d) => d.end === "left")!;
    const firstTile = layout.tiles[0];
    expect(leftDZ.x).toBeLessThan(firstTile.x);
  });

  it("right drop zone is to the right of the last tile", () => {
    const layout = computeLayout([tile(3, 5)], 900, 500);
    const rightDZ = layout.dropZones.find((d) => d.end === "right")!;
    const lastTile = layout.tiles[layout.tiles.length - 1];
    expect(rightDZ.x).toBeGreaterThan(lastTile.x);
  });
});
