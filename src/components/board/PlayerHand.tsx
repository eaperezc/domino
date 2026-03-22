"use client";

import { useState, useCallback } from "react";
import DominoTile from "../tiles/DominoTile";
import type { Tile, ValidMove } from "@/lib/engine/types";
import { sameTile } from "@/lib/engine/tiles";

interface PlayerHandProps {
  tiles: Tile[];
  validMoves: ValidMove[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onDragStart: (tile: Tile, index: number) => void;
  onDragReset: () => void;
  isDragging: boolean;
}

export default function PlayerHand({
  tiles,
  validMoves,
  onReorder,
  onDragStart,
  onDragReset,
  isDragging,
}: PlayerHandProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const resetLocal = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      const tile = tiles[index];
      const playable = validMoves.some((m) => sameTile(m.tile, tile));

      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", JSON.stringify({ tile, index, source: "hand" }));

      if (playable) {
        onDragStart(tile, index);
      }
    },
    [tiles, validMoves, onDragStart],
  );

  const handleDragEnd = useCallback(() => {
    resetLocal();
    onDragReset();
  }, [resetLocal, onDragReset]);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragIndex !== null && index !== dragIndex) {
        setDragOverIndex(index);
      }
    },
    [dragIndex],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      if (dragIndex !== null && dragIndex !== toIndex) {
        onReorder(dragIndex, toIndex);
      }
      resetLocal();
      onDragReset();
    },
    [dragIndex, onReorder, resetLocal, onDragReset],
  );

  return (
    <div className="flex items-end justify-center gap-2 p-4">
      {tiles.map((tile, i) => {
        const playable = validMoves.some((m) => sameTile(m.tile, tile));
        const isSource = dragIndex === i;
        const isOver = dragOverIndex === i;

        return (
          <div
            key={`${tile.left}-${tile.right}-${i}`}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            style={{
              opacity: isSource ? 0.3 : 1,
              transform: isOver ? "translateX(16px)" : "none",
              transition: isDragging ? "transform 150ms ease" : "none",
            }}
            className={`cursor-grab active:cursor-grabbing ${
              playable && !isSource ? "hover:-translate-y-2" : ""
            }`}
          >
            <DominoTile
              left={tile.left}
              right={tile.right}
              orientation="vertical"
              isPlayable={playable}
            />
          </div>
        );
      })}
    </div>
  );
}
