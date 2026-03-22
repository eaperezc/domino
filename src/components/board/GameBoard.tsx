"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { PlayedTile, ValidMove, Tile } from "@/lib/engine/types";
import { computeLayout } from "@/lib/renderer";
import { TILE_WIDTH, TILE_HEIGHT } from "@/lib/renderer";
import DominoTile from "../tiles/DominoTile";

const MIN_WIDTH = 900;
const BOARD_HEIGHT = 650;

interface GameBoardProps {
  chain: PlayedTile[];
  selectedTile: Tile | null;
  validMoves: ValidMove[];
  onPlayTile: (end: "left" | "right") => void;
}

export default function GameBoard({
  chain,
  selectedTile,
  validMoves,
  onPlayTile,
}: GameBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(MIN_WIDTH);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setBoardWidth(Math.max(width, MIN_WIDTH));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(
    () => computeLayout(chain, boardWidth, BOARD_HEIGHT),
    [chain, boardWidth],
  );

  const playableEnds = useMemo(() => {
    if (!selectedTile) return new Set<string>();
    const ends = new Set<string>();
    for (const m of validMoves) {
      if (
        (m.tile.left === selectedTile.left && m.tile.right === selectedTile.right) ||
        (m.tile.left === selectedTile.right && m.tile.right === selectedTile.left)
      ) {
        ends.add(m.end);
      }
    }
    return ends;
  }, [selectedTile, validMoves]);

  const { bounds } = layout;

  // Keep 1:1 scale, always centered on the starter tile at (0, 0).
  const vbX = -boardWidth / 2;
  const vbY = -BOARD_HEIGHT / 2;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl bg-emerald-900 border border-emerald-700"
      style={{ minWidth: MIN_WIDTH, height: BOARD_HEIGHT }}
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />

      <svg
        width={boardWidth}
        height={BOARD_HEIGHT}
        viewBox={`${vbX} ${vbY} ${boardWidth} ${BOARD_HEIGHT}`}
        className="relative z-10"
      >
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

        {selectedTile &&
          layout.dropZones.map(
            (dz) =>
              playableEnds.has(dz.end) && (
                <g
                  key={dz.end}
                  transform={`translate(${dz.x}, ${dz.y})`}
                  onClick={() => onPlayTile(dz.end)}
                  className="cursor-pointer"
                >
                  <rect
                    width={TILE_WIDTH}
                    height={TILE_HEIGHT}
                    rx={3}
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                  />
                  <text
                    x={TILE_WIDTH / 2}
                    y={TILE_HEIGHT / 2 + 4}
                    textAnchor="middle"
                    fill="#3b82f6"
                    fontSize={12}
                    fontWeight="bold"
                  >
                    Play
                  </text>
                </g>
              ),
          )}
      </svg>
    </div>
  );
}
