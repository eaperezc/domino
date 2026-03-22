"use client";

import { useMemo, useRef, useState, useEffect, useCallback, type DragEvent } from "react";
import type { PlayedTile, ValidMove, Tile } from "@/lib/engine/types";
import { computeLayout } from "@/lib/renderer";
import { TILE_WIDTH, TILE_HEIGHT } from "@/lib/renderer";
import { sameTile } from "@/lib/engine/tiles";
import { theme } from "@/lib/theme";
import DominoTile from "../tiles/DominoTile";

const MIN_WIDTH = 900;

interface GameBoardProps {
  chain: PlayedTile[];
  draggingTile: Tile | null;
  validMoves: ValidMove[];
  onPlayTile: (tile: Tile, end: "left" | "right") => void;
  onDragReset: () => void;
}

export default function GameBoard({
  chain,
  draggingTile,
  validMoves,
  onPlayTile,
  onDragReset,
}: GameBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(MIN_WIDTH);
  const [boardHeight, setBoardHeight] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setBoardWidth(Math.max(width, MIN_WIDTH));
      setBoardHeight(Math.max(height, 200));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(
    () => computeLayout(chain, boardWidth, boardHeight),
    [chain, boardWidth, boardHeight],
  );

  // Which ends can the dragged tile be played on?
  const playableEnds = useMemo(() => {
    if (!draggingTile) return new Set<string>();
    const ends = new Set<string>();
    for (const m of validMoves) {
      if (sameTile(m.tile, draggingTile)) {
        ends.add(m.end);
      }
    }
    return ends;
  }, [draggingTile, validMoves]);

  const [hoverEnd, setHoverEnd] = useState<string | null>(null);

  const handleDropOnBoard = useCallback(
    (e: DragEvent, end: "left" | "right") => {
      e.preventDefault();
      setHoverEnd(null);
      try {
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        if (data.source === "hand" && data.tile) {
          onPlayTile(data.tile as Tile, end);
        }
      } catch {
        // ignore
      }
      onDragReset();
    },
    [onPlayTile, onDragReset],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  // Reset hover when drag ends (tile dropped or drag cancelled)
  useEffect(() => {
    if (!draggingTile) setHoverEnd(null);
  }, [draggingTile]);

  const vbX = -boardWidth / 2;
  const vbY = -boardHeight / 2;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-2xl border"
      style={{
        minWidth: MIN_WIDTH,
        minHeight: 200,
        backgroundColor: theme.boardBg,
        borderColor: theme.boardBorder,
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${theme.boardFelt}, transparent)`,
        }}
      />

      <svg
        width={boardWidth}
        height={boardHeight}
        viewBox={`${vbX} ${vbY} ${boardWidth} ${boardHeight}`}
        className="relative z-10"
      >
        {/* Rendered tiles */}
        {layout.tiles.map((t) => (
          <g key={t.tileId} transform={`translate(${t.x}, ${t.y})`}>
            <DominoTile
              left={t.left}
              right={t.right}
              orientation={t.orientation}
              isStarter={t.isStarter}
              isPlayable
            />
          </g>
        ))}

        {/* Drop zones — visible when dragging a playable tile */}
        {draggingTile &&
          layout.dropZones.map(
            (dz) =>
              playableEnds.has(dz.end) && (
                <foreignObject
                  key={dz.end}
                  x={dz.x}
                  y={dz.y}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                >
                  <DropTarget
                    end={dz.end}
                    isHover={hoverEnd === dz.end}
                    onDragOver={(e) => {
                      handleDragOver(e);
                      setHoverEnd(dz.end);
                    }}
                    onDragLeave={(e) => {
                      // Only clear if actually leaving the container (not entering a child)
                      const rect = e.currentTarget.getBoundingClientRect();
                      const { clientX, clientY } = e;
                      if (
                        clientX <= rect.left ||
                        clientX >= rect.right ||
                        clientY <= rect.top ||
                        clientY >= rect.bottom
                      ) {
                        setHoverEnd(null);
                      }
                    }}
                    onDrop={(e) => handleDropOnBoard(e, dz.end)}
                  />
                </foreignObject>
              ),
          )}
      </svg>
    </div>
  );
}

function DropTarget({
  end,
  isHover,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  end: string;
  isHover: boolean;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`w-full h-full rounded border-2 border-dashed flex items-center justify-center transition-all duration-150 ${
        isHover
          ? "border-green-400 bg-green-500/40"
          : "border-blue-400 bg-blue-500/20"
      }`}
    >
      <span
        className={`text-sm font-bold select-none pointer-events-none ${
          isHover ? "text-green-300" : "text-blue-400"
        }`}
      >
        {isHover ? "Drop" : end === "left" ? "◄" : "►"}
      </span>
    </div>
  );
}
