"use client";

import DominoTile from "../tiles/DominoTile";
import PlayerAvatar from "./PlayerAvatar";

interface PartnerHandProps {
  name: string;
  tileCount: number;
  isCurrentTurn: boolean;
}

// Rendered size for partner's vertical tiles
const TILE_W = 42;
const TILE_H = 85;

export default function PartnerHand({
  name,
  tileCount,
  isCurrentTurn,
}: PartnerHandProps) {
  const tiles = Array.from({ length: tileCount });

  return (
    <div className="flex flex-row my-2 items-center gap-4 flex-shrink-0">
      <div className="flex flex-row gap-2 items-center">
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
