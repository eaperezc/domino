"use client";

import { useEffect, useState } from "react";
import DominoTile from "../tiles/DominoTile";
import PlayerAvatar from "./PlayerAvatar";

interface PartnerHandProps {
  name: string;
  tileCount: number;
  isCurrentTurn: boolean;
}

function useTileSize() {
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setSmall(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSmall(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return small ? { w: 28, h: 56 } : { w: 42, h: 85 };
}

export default function PartnerHand({
  name,
  tileCount,
  isCurrentTurn,
}: PartnerHandProps) {
  const tiles = Array.from({ length: tileCount });
  const size = useTileSize();

  return (
    <div
      className="flex flex-row my-1 md:my-2 items-center gap-2 md:gap-4 flex-shrink-0 transition-all duration-200"
      style={{
        opacity: isCurrentTurn ? 1 : 0.6,
        transform: isCurrentTurn ? "scale(1.05)" : "scale(1)",
      }}
    >
      <div className="flex flex-row gap-0.5 md:gap-1 items-center">
        {tiles.map((_, i) => (
          <DominoTile
            key={i}
            left={0}
            right={0}
            orientation="vertical"
            renderWidth={size.w}
            renderHeight={size.h}
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
