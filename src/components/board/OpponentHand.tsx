"use client";

import DominoTile from "../tiles/DominoTile";
import PlayerAvatar from "./PlayerAvatar";

interface OpponentHandProps {
  name: string;
  tileCount: number;
  isCurrentTurn: boolean;
  position: "left" | "right";
}

// Rendered size for opponent's horizontal tiles
const TILE_W = 95;
const TILE_H = 45;

export default function OpponentHand({
  name,
  tileCount,
  isCurrentTurn,
  position,
}: OpponentHandProps) {
  const tiles = Array.from({ length: tileCount });

  return (
    <div className="flex flex-col items-center gap-4 flex-shrink-0">
      <PlayerAvatar
        name={name}
        tileCount={tileCount}
        isCurrentTurn={isCurrentTurn}
        position={position}
      />
      <div className="flex flex-col  gap-2 align-center">
        {tiles.map((_, i) => (
          <DominoTile
            key={i}
            left={0}
            right={0}
            orientation="horizontal"
            renderWidth={TILE_W}
            renderHeight={TILE_H}
            isFaceDown
            isPlayable
          />
        ))}
      </div>
    </div>
  );
}
