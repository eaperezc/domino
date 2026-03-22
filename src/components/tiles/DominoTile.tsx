"use client";

import { theme } from "@/lib/theme";

interface DominoTileProps {
  left: number;
  right: number;
  isSelected?: boolean;
  isPlayable?: boolean;
  isFaceDown?: boolean;
  isStarter?: boolean;
  /** Override rendered width in pixels (SVG scales to fit) */
  renderWidth?: number;
  /** Override rendered height in pixels (SVG scales to fit) */
  renderHeight?: number;
  onClick?: () => void;
  /** "horizontal" = wide tile (left|right), "vertical" = tall tile (top/bottom) for doubles */
  orientation?: "horizontal" | "vertical";
}

// Pip positions within a half-tile cell (normalized 0-1)
const PIP_LAYOUTS: Record<number, [number, number][]> = {
  0: [],
  1: [[0.5, 0.5]],
  2: [
    [0.25, 0.25],
    [0.75, 0.75],
  ],
  3: [
    [0.25, 0.25],
    [0.5, 0.5],
    [0.75, 0.75],
  ],
  4: [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.25, 0.75],
    [0.75, 0.75],
  ],
  5: [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.5, 0.5],
    [0.25, 0.75],
    [0.75, 0.75],
  ],
  6: [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.25, 0.5],
    [0.75, 0.5],
    [0.25, 0.75],
    [0.75, 0.75],
  ],
};

const PIP_RADIUS = 5;

function renderPips(
  value: number,
  offsetX: number,
  offsetY: number,
  cellW: number,
  cellH: number,
) {
  const positions = PIP_LAYOUTS[value] || [];
  return positions.map(([px, py], i) => (
    <circle
      key={i}
      cx={offsetX + px * cellW}
      cy={offsetY + py * cellH}
      r={PIP_RADIUS}
      fill={theme.tilePip}
    />
  ));
}

// Tile logical size — must match renderer constants
const LONG = 110;
const SHORT = 55;

export default function DominoTile({
  left,
  right,
  isSelected = false,
  isPlayable = false,
  isFaceDown = false,
  isStarter = false,
  renderWidth,
  renderHeight,
  onClick,
  orientation = "horizontal",
}: DominoTileProps) {
  const isVert = orientation === "vertical";
  // Internal coordinate space (always full size for crisp rendering)
  const viewW = isVert ? SHORT : LONG;
  const viewH = isVert ? LONG : SHORT;
  // Rendered pixel size (can be overridden for smaller tiles)
  const width = renderWidth ?? viewW;
  const height = renderHeight ?? viewH;
  // All SVG internals use viewBox coordinates
  const w = viewW;
  const h = viewH;
  const rx = 8;

  // Shadow and glow styles
  const shadowFilter = (() => {
    if (isSelected) {
      return "drop-shadow(0 0 8px #3b82f6)";
    }
    if (isStarter) {
      return "drop-shadow(0 0 10px rgba(250, 204, 21, 0.6))";
    }
    if (isFaceDown) {
      return "drop-shadow(0 1px 2px rgba(0,0,0,0.3))";
    }
    return "drop-shadow(0 2px 4px rgba(0,0,0,0.25))";
  })();

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${viewW} ${viewH}`}
      onClick={onClick}
      className={[
        "transition-all duration-150",
        isSelected ? "scale-110" : "",
        isPlayable
          ? "cursor-grab opacity-100 hover:-translate-y-[2px] hover:brightness-110 active:scale-[0.97]"
          : "cursor-default opacity-40",
      ].join(" ")}
      style={{ filter: shadowFilter }}
    >
      {/* Bevel highlight */}
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={rx}
        fill="rgba(255,255,255,0.15)"
      />
      {/* Background */}
      <rect
        x={0.5}
        y={1.5}
        width={w - 1}
        height={h - 2}
        rx={rx}
        fill={
          isFaceDown
            ? theme.tileBack
            : isStarter
              ? theme.tileStarter
              : theme.tileFace
        }
        stroke={
          isSelected
            ? "#3b82f6"
            : isStarter
              ? theme.tileStarterBorder
              : "rgba(0,0,0,0.15)"
        }
        strokeWidth={isSelected ? 2 : isStarter ? 1.5 : 1}
      />

      {isFaceDown ? (
        <rect
          x={5}
          y={5}
          width={w - 10}
          height={h - 10}
          rx={2}
          fill={theme.tileBorder}
        />
      ) : isVert ? (
        <>
          <line
            x1={3}
            y1={h / 2}
            x2={w - 3}
            y2={h / 2}
            stroke={theme.tileBorder}
            strokeWidth={1}
          />
          {renderPips(left, 0, 0, w, h / 2)}
          {renderPips(right, 0, h / 2, w, h / 2)}
        </>
      ) : (
        <>
          <line
            x1={w / 2}
            y1={3}
            x2={w / 2}
            y2={h - 3}
            stroke={theme.tileBorder}
            strokeWidth={1}
          />
          {renderPips(left, 0, 0, w / 2, h)}
          {renderPips(right, w / 2, 0, w / 2, h)}
        </>
      )}
    </svg>
  );
}
