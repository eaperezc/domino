"use client";

interface DominoTileProps {
  left: number;
  right: number;
  isSelected?: boolean;
  isPlayable?: boolean;
  isFaceDown?: boolean;
  isStarter?: boolean;
  onClick?: () => void;
  /** "horizontal" = wide tile (left|right), "vertical" = tall tile (top/bottom) for doubles */
  orientation?: "horizontal" | "vertical";
}

// Pip positions within a half-tile cell (normalized 0-1)
const PIP_LAYOUTS: Record<number, [number, number][]> = {
  0: [],
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
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
      fill="#1a1a2e"
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
  onClick,
  orientation = "horizontal",
}: DominoTileProps) {
  const isVert = orientation === "vertical";
  const width = isVert ? SHORT : LONG;
  const height = isVert ? LONG : SHORT;
  const rx = 3;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      onClick={onClick}
      className={`cursor-pointer transition-transform ${
        isSelected ? "scale-110" : ""
      } ${isPlayable && !isSelected ? "opacity-100" : ""} ${
        !isPlayable && !isSelected ? "opacity-60" : ""
      }`}
      style={{ filter: isSelected ? "drop-shadow(0 0 6px #3b82f6)" : undefined }}
    >
      {/* Background */}
      <rect
        x={0.5}
        y={0.5}
        width={width - 1}
        height={height - 1}
        rx={rx}
        fill={isFaceDown ? "#1e293b" : isStarter ? "#fef9c3" : "#faf9f6"}
        stroke={isSelected ? "#3b82f6" : isStarter ? "#ca8a04" : "#334155"}
        strokeWidth={isSelected ? 2 : isStarter ? 1.5 : 1}
      />

      {isFaceDown ? (
        <rect x={5} y={5} width={width - 10} height={height - 10} rx={2} fill="#334155" />
      ) : isVert ? (
        <>
          {/* Horizontal divider for vertical tile */}
          <line
            x1={3}
            y1={height / 2}
            x2={width - 3}
            y2={height / 2}
            stroke="#94a3b8"
            strokeWidth={1}
          />
          {/* Top half = left value, Bottom half = right value */}
          {renderPips(left, 0, 0, width, height / 2)}
          {renderPips(right, 0, height / 2, width, height / 2)}
        </>
      ) : (
        <>
          {/* Vertical divider for horizontal tile */}
          <line
            x1={width / 2}
            y1={3}
            x2={width / 2}
            y2={height - 3}
            stroke="#94a3b8"
            strokeWidth={1}
          />
          {/* Left half, Right half */}
          {renderPips(left, 0, 0, width / 2, height)}
          {renderPips(right, width / 2, 0, width / 2, height)}
        </>
      )}
    </svg>
  );
}
