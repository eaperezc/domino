"use client";

import DominoTile from "../tiles/DominoTile";
import type { Tile, ValidMove } from "@/lib/engine/types";
import { sameTile } from "@/lib/engine/tiles";

interface PlayerHandProps {
  tiles: Tile[];
  validMoves: ValidMove[];
  selectedTile: Tile | null;
  onSelectTile: (tile: Tile) => void;
}

export default function PlayerHand({
  tiles,
  validMoves,
  selectedTile,
  onSelectTile,
}: PlayerHandProps) {
  return (
    <div className="flex items-center justify-center gap-2 p-4">
      {tiles.map((tile, i) => {
        const playable = validMoves.some((m) => sameTile(m.tile, tile));
        const selected = selectedTile !== null && sameTile(selectedTile, tile);

        return (
          <DominoTile
            key={`${tile.left}-${tile.right}-${i}`}
            left={tile.left}
            right={tile.right}
            isPlayable={playable}
            isSelected={selected}
            onClick={() => playable && onSelectTile(tile)}
          />
        );
      })}
    </div>
  );
}
