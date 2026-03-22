"use client";

import { useMemo, useRef, useState, useEffect, useCallback, type DragEvent } from "react";
import type { PlayedTile, ValidMove, Tile } from "@/lib/engine/types";
import { computeLayout, dropZoneRect } from "@/lib/renderer";
import { sameTile } from "@/lib/engine/tiles";
import { theme } from "@/lib/theme";
import DominoTile from "../tiles/DominoTile";

const MIN_WIDTH = 0;

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
  const activeHoverEnd = draggingTile ? hoverEnd : null;

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

  // Use a minimum viewBox size so tiles zoom out on small boards
  // instead of getting clipped
  const MIN_VB_WIDTH = 900;
  const MIN_VB_HEIGHT = 600;
  const vbW = Math.max(boardWidth, MIN_VB_WIDTH);
  const vbH = Math.max(boardHeight, MIN_VB_HEIGHT);
  const vbX = -vbW / 2;
  const vbY = -vbH / 2;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        minWidth: MIN_WIDTH,
        minHeight: 200,
        background: "radial-gradient(circle at center, #166534 0%, #064e3b 100%)",
        boxShadow: "inset 0 10px 30px rgba(0,0,0,0.4)",
        borderRadius: 16,
      }}
    >
      {/* Felt texture + vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      <svg
        width={boardWidth}
        height={boardHeight}
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
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
          layout.dropZones.map((dz) => {
            if (!playableEnds.has(dz.end)) return null;
            const isDbl = draggingTile.left === draggingTile.right;
            const rect = dropZoneRect(dz, isDbl);
            const pad = 20;
            return (
              <foreignObject
                key={dz.end}
                x={rect.x - pad}
                y={rect.y - pad}
                width={rect.width + pad * 2}
                height={rect.height + pad * 2}
              >
                <DropTarget
                  isHover={activeHoverEnd === dz.end}
                  onDragOver={(e) => {
                    handleDragOver(e);
                    setHoverEnd(dz.end);
                  }}
                  onDragLeave={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const { clientX, clientY } = e;
                    if (
                      clientX <= r.left ||
                      clientX >= r.right ||
                      clientY <= r.top ||
                      clientY >= r.bottom
                    ) {
                      setHoverEnd(null);
                    }
                  }}
                  onDrop={(e) => handleDropOnBoard(e, dz.end)}
                />
              </foreignObject>
            );
          })}
      </svg>
    </div>
  );
}

function DropTarget({
  isHover,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
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
      className="w-full h-full flex items-center justify-center p-[20px]"
    >
      <div
        className={`w-full h-full rounded border-2 border-dashed transition-all duration-150 ${
          isHover
            ? "border-green-400 bg-green-500/40"
            : "border-blue-400 bg-blue-500/20"
        }`}
      />
    </div>
  );
}
