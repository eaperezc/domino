import { describe, it, expect } from "vitest";
import { createTileSet, shuffle, isDouble, sameTile, tileId, pipCount } from "../tiles";

describe("createTileSet", () => {
  it("generates 28 tiles for a double-six set", () => {
    const tiles = createTileSet();
    expect(tiles).toHaveLength(28);
  });

  it("includes all unique combinations from 0-0 to 6-6", () => {
    const tiles = createTileSet();
    const ids = tiles.map(tileId);
    expect(new Set(ids).size).toBe(28);
  });

  it("has left <= right for all tiles", () => {
    const tiles = createTileSet();
    for (const t of tiles) {
      expect(t.left).toBeLessThanOrEqual(t.right);
    }
  });

  it("contains 7 doubles", () => {
    const tiles = createTileSet();
    expect(tiles.filter(isDouble)).toHaveLength(7);
  });
});

describe("shuffle", () => {
  it("returns the same number of elements", () => {
    const tiles = createTileSet();
    expect(shuffle(tiles)).toHaveLength(28);
  });

  it("does not mutate the original array", () => {
    const tiles = createTileSet();
    const copy = [...tiles];
    shuffle(tiles);
    expect(tiles).toEqual(copy);
  });
});

describe("isDouble", () => {
  it("returns true for doubles", () => {
    expect(isDouble({ left: 3, right: 3 })).toBe(true);
  });

  it("returns false for non-doubles", () => {
    expect(isDouble({ left: 3, right: 5 })).toBe(false);
  });
});

describe("sameTile", () => {
  it("matches identical tiles", () => {
    expect(sameTile({ left: 3, right: 5 }, { left: 3, right: 5 })).toBe(true);
  });

  it("matches reversed tiles", () => {
    expect(sameTile({ left: 3, right: 5 }, { left: 5, right: 3 })).toBe(true);
  });

  it("rejects different tiles", () => {
    expect(sameTile({ left: 3, right: 5 }, { left: 3, right: 6 })).toBe(false);
  });
});

describe("pipCount", () => {
  it("sums both sides", () => {
    expect(pipCount({ left: 3, right: 5 })).toBe(8);
  });

  it("returns 0 for blank-blank", () => {
    expect(pipCount({ left: 0, right: 0 })).toBe(0);
  });
});

describe("tileId", () => {
  it("normalizes order", () => {
    expect(tileId({ left: 5, right: 3 })).toBe("3-5");
    expect(tileId({ left: 3, right: 5 })).toBe("3-5");
  });
});
