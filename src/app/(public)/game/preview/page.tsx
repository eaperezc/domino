"use client";

import { useState } from "react";
import GameBoard from "@/components/board/GameBoard";
import type { PlayedTile } from "@/lib/engine/types";

type Scenario = {
  name: string;
  chain: PlayedTile[];
};

function tile(left: number, right: number, end: "left" | "right" = "right"): PlayedTile {
  return {
    left,
    right,
    playedBy: "preview",
    end,
    isDouble: left === right,
  };
}

const SCENARIOS: Scenario[] = [
  {
    name: "Single non-double",
    chain: [tile(3, 5)],
  },
  {
    name: "Single double",
    chain: [tile(5, 5)],
  },
  {
    name: "Double in middle",
    chain: [tile(2, 3), tile(3, 3), tile(3, 6)],
  },
  {
    name: "Double at left end",
    chain: [tile(4, 4, "left"), tile(4, 2), tile(2, 6)],
  },
  {
    name: "Double at right end",
    chain: [tile(1, 3), tile(3, 5), tile(5, 5)],
  },
  {
    name: "Multiple doubles",
    chain: [tile(2, 2, "left"), tile(2, 5), tile(5, 5), tile(5, 3), tile(3, 3)],
  },
  {
    name: "Long chain (no doubles)",
    chain: [tile(1, 3), tile(3, 5), tile(5, 2), tile(2, 6), tile(6, 4), tile(4, 0), tile(0, 1)],
  },
  {
    name: "Long chain with doubles",
    chain: [
      tile(1, 1, "left"),
      tile(1, 3),
      tile(3, 3),
      tile(3, 5),
      tile(5, 2),
      tile(2, 2),
      tile(2, 6),
      tile(6, 4),
      tile(4, 4),
      tile(4, 0),
    ],
  },
  {
    name: "Very long (should bend)",
    chain: [
      tile(0, 1),
      tile(1, 2),
      tile(2, 3),
      tile(3, 4),
      tile(4, 5),
      tile(5, 6),
      tile(6, 0),
      tile(0, 2),
      tile(2, 4),
      tile(4, 6),
      tile(6, 1),
      tile(1, 3),
      tile(3, 5),
    ],
  },
  {
    name: "Adjacent doubles",
    chain: [tile(2, 3), tile(3, 3), tile(3, 5), tile(5, 5), tile(5, 1)],
  },
  {
    name: "Double at bend (both)",
    chain: [
      // Left arm — double [1,1] near left edge
      tile(3, 1, "left"),
      tile(1, 1, "left"), // double at left bend
      tile(1, 5, "left"),
      tile(5, 4, "left"),
      tile(4, 2, "left"),
      tile(2, 6, "left"),
      tile(6, 0, "left"),
      // Starter
      tile(0, 3),
      // Right arm — double [0,0] near right edge
      tile(3, 5),
      tile(5, 2),
      tile(2, 6),
      tile(6, 4),
      tile(4, 0),
      tile(0, 0), // double at right bend
      tile(0, 3),
      tile(3, 1),
      tile(1, 1), // double at second bend
      tile(1, 5),
      tile(5, 6),
      tile(0, 3),
      tile(3, 1),
      tile(1, 5),
    ],
  },
  {
    name: "Double after bend",
    chain: [
      // Right arm — non-double before bend, then non-double, then double after bend
      tile(1, 3),
      tile(3, 5),
      tile(5, 2),
      tile(2, 6),
      tile(6, 4),
      tile(4, 0),
      tile(0, 3), // last tile before bend (non-double)
      tile(3, 1), // first tile after bend (non-double)
      tile(1, 1), // double as SECOND tile after bend
      tile(1, 5),
    ],
  },
  {
    name: "Grow right (bend)",
    chain: [
      // Starter + all tiles grow to the right
      tile(0, 1),
      tile(1, 2),
      tile(2, 3),
      tile(3, 4),
      tile(4, 5),
      tile(5, 6),
      tile(6, 0),
      tile(0, 2),
      tile(2, 4),
      tile(4, 6),
      tile(6, 1),
      tile(1, 3),
    ],
  },
  {
    name: "Grow left (bend)",
    chain: [
      // All tiles prepended to the left of the starter
      tile(3, 1, "left"),
      tile(1, 6, "left"),
      tile(6, 4, "left"),
      tile(4, 2, "left"),
      tile(2, 0, "left"),
      tile(0, 6, "left"),
      tile(6, 5, "left"),
      tile(5, 4, "left"),
      tile(4, 3, "left"),
      tile(3, 2, "left"),
      tile(2, 1, "left"),
      tile(1, 3), // starter
    ],
  },
  {
    name: "Grow both sides",
    chain: [
      // Left arm (prepended) — each tile's right connects to next tile's left
      // Leftmost [4|0] ← [0|2] ← [2|5] ← [5|1] ← [1|6] ← [6|4] ← [4|5] ← [5|3] ← starter [3|6]
      tile(4, 0, "left"),
      tile(0, 2, "left"),
      tile(2, 5, "left"),
      tile(5, 1, "left"),
      tile(1, 6, "left"),
      tile(6, 4, "left"),
      tile(4, 5, "left"),
      tile(5, 3, "left"),
      // Starter
      tile(3, 6),
      // Right arm — each tile's left connects to previous tile's right
      // starter [3|6] → [6|0] → [0|2] → [2|4] → [4|1] → [1|5] → [5|3] → [3|0] → [0|4]
      tile(6, 0),
      tile(0, 2),
      tile(2, 4),
      tile(4, 1),
      tile(1, 5),
      tile(5, 3),
      tile(3, 0),
      tile(0, 4),
    ],
  },
];

export default function PreviewPage() {
  const [selected, setSelected] = useState(0);
  const scenario = SCENARIOS[selected];

  return (
    <div className="h-screen bg-slate-900 text-white p-6 flex flex-col items-center gap-4 overflow-hidden">
      <h1 className="text-xl font-bold">Board Preview</h1>

      {/* Scenario picker */}
      <div className="flex flex-wrap gap-2 justify-center">
        {SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`px-3 py-1 rounded text-sm ${
              i === selected
                ? "bg-emerald-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Chain description */}
      <div className="text-sm text-slate-400 font-mono">
        {scenario.chain.map((t, i) => (
          <span key={i}>
            {i > 0 && " — "}
            <span className={t.isDouble ? "text-amber-400" : ""}>
              [{t.left}|{t.right}]
            </span>
          </span>
        ))}
      </div>

      {/* Board */}
      <div className="w-full flex-1 min-h-0">
        <GameBoard
          chain={scenario.chain}
          draggingTile={null}
          validMoves={[]}
          onPlayTile={() => {}}
          onDragReset={() => {}}
        />
      </div>
    </div>
  );
}
