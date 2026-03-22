"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import DominoTile from "../tiles/DominoTile";
import type { Tile, ValidMove } from "@/lib/engine/types";
import { sameTile } from "@/lib/engine/tiles";

interface PlayerHandProps {
  tiles: Tile[];
  validMoves: ValidMove[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onDragStart: (tile: Tile, index: number) => void;
  onDragReset: () => void;
}

/** Width of a vertical tile (SHORT side) + gap */
const TILE_SLOT_WIDTH = 55 + 8; // matches DominoTile vertical width + gap

export default function PlayerHand({
  tiles,
  validMoves,
  onReorder,
  onDragStart,
  onDragReset,
}: PlayerHandProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset drag state and refs when tiles change (e.g. tile played on board)
  useEffect(() => {
    tileRefs.current = tileRefs.current.slice(0, tiles.length);
    setDragIndex(null);
    setHoverIndex(null);
  }, [tiles.length]);

  const resetLocal = useCallback(() => {
    setDragIndex(null);
    setHoverIndex(null);
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      const tile = tiles[index];
      const playable = validMoves.some((m) => sameTile(m.tile, tile));

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({ tile, index, source: "hand" }),
      );

      // Set drag image before hiding the element
      const el = tileRefs.current[index];
      if (el) {
        e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
      }

      // Delay state update so browser captures the drag image first
      requestAnimationFrame(() => {
        setDragIndex(index);
        setHoverIndex(index);
      });

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

  // Compute insertion index based on cursor position over the hand
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      if (dragIndex === null || !containerRef.current) return;

      // Find which slot the cursor is closest to
      const containerRect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - containerRect.left;

      let bestIndex = 0;
      let bestDist = Infinity;

      for (let i = 0; i < tiles.length; i++) {
        const el = tileRefs.current[i];
        if (!el) continue;
        // Use the element's center relative to container
        const elRect = el.getBoundingClientRect();
        const elCenter = elRect.left + elRect.width / 2 - containerRect.left;
        const dist = Math.abs(cursorX - elCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = i;
        }
      }

      setHoverIndex(bestIndex);
    },
    [dragIndex, tiles.length],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (dragIndex !== null && hoverIndex !== null && dragIndex !== hoverIndex) {
        onReorder(dragIndex, hoverIndex);
      }
      resetLocal();
      onDragReset();
    },
    [dragIndex, hoverIndex, onReorder, resetLocal, onDragReset],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      // Only reset hover if leaving the container entirely
      if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
        setHoverIndex(null);
      }
    },
    [],
  );

  // Compute visual offset for each tile to animate the gap
  function getTranslateX(index: number): number {
    if (dragIndex === null || hoverIndex === null) return 0;
    if (index === dragIndex) return 0; // dragged tile is hidden

    // Tiles between old and new position shift to fill the gap
    if (dragIndex < hoverIndex) {
      // Dragging right: tiles between (dragIndex, hoverIndex] shift left
      if (index > dragIndex && index <= hoverIndex) {
        return -TILE_SLOT_WIDTH;
      }
    } else if (dragIndex > hoverIndex) {
      // Dragging left: tiles between [hoverIndex, dragIndex) shift right
      if (index >= hoverIndex && index < dragIndex) {
        return TILE_SLOT_WIDTH;
      }
    }
    return 0;
  }

  return (
    <div
      ref={containerRef}
      className="flex items-end justify-center gap-2 px-4 py-2"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      {tiles.map((tile, i) => {
        const playable = validMoves.some((m) => sameTile(m.tile, tile));
        const isSource = dragIndex === i;
        const translateX = getTranslateX(i);

        return (
          <div
            key={`${tile.left}-${tile.right}-${i}`}
            ref={(el) => { tileRefs.current[i] = el; }}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragEnd={handleDragEnd}
            className={[
              "cursor-grab active:cursor-grabbing",
              "transition-transform duration-200 ease-out",
              playable && !isSource ? "hover:-translate-y-2" : "",
            ].join(" ")}
            style={{
              transform: isSource
                ? undefined
                : `translateX(${translateX}px)`,
              opacity: isSource ? 0 : 1,
              pointerEvents: isSource ? "none" : undefined,
              filter:
                playable && !isSource
                  ? "drop-shadow(0 0 6px rgba(250, 204, 21, 0.4))"
                  : undefined,
            }}
          >
            <DominoTile
              left={tile.left}
              right={tile.right}
              orientation="vertical"
              isPlayable={playable && !isSource}
            />
          </div>
        );
      })}
    </div>
  );
}
