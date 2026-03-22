"use client";

import DominoTile from "../tiles/DominoTile";
import PlayerAvatar from "./PlayerAvatar";

interface PartnerHandProps {
  name: string;
  tileCount: number;
  isCurrentTurn: boolean;
}

const TILE_W = 42;
const TILE_H = 85;

export default function PartnerHand({
  name,
  tileCount,
  isCurrentTurn,
}: PartnerHandProps) {
  const tiles = Array.from({ length: tileCount });

  return (
    <div
      className="flex flex-row my-2 items-center gap-4 flex-shrink-0 transition-all duration-200"
      style={{
        opacity: isCurrentTurn ? 1 : 0.6,
        transform: isCurrentTurn ? "scale(1.05)" : "scale(1)",
      }}
    >
      <div className="flex flex-row gap-1 items-center">
        {tiles.map((_, i) => (
          <DominoTile
            key={i}
            left={0}
            right={0}
            orientation="vertical"
            renderWidth={TILE_W}
            renderHeight={TILE_H}
            isFaceDown
            isPlayable
          />
        ))}
      </div>
      <PlayerAvatar
        name={name}
        tileCount={tileCount}
        isCurrentTurn={isCurrentTurn}
        position="top"
      />
    </div>
  );
}
