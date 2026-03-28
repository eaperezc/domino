"use client";

import { useEffect, useState } from "react";
import DominoTile from "../tiles/DominoTile";
import PlayerAvatar from "./PlayerAvatar";

interface OpponentHandProps {
  name: string;
  tileCount: number;
  isCurrentTurn: boolean;
  position: "left" | "right";
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
  return small ? { w: 60, h: 30 } : { w: 95, h: 45 };
}

export default function OpponentHand({
  name,
  tileCount,
  isCurrentTurn,
  position,
}: OpponentHandProps) {
  const tiles = Array.from({ length: tileCount });
  const size = useTileSize();

  return (
    <div
      className="flex flex-col items-center gap-2 md:gap-3 flex-shrink-0 transition-all duration-200"
      style={{
        opacity: isCurrentTurn ? 1 : 0.6,
        transform: isCurrentTurn ? "scale(1.05)" : "scale(1)",
      }}
    >
      <PlayerAvatar
        name={name}
        tileCount={tileCount}
        isCurrentTurn={isCurrentTurn}
        position={position}
      />
      <div className="flex flex-col gap-0.5 md:gap-1">
        {tiles.map((_, i) => (
          <DominoTile
            key={i}
            left={0}
            right={0}
            orientation="horizontal"
            renderWidth={size.w}
            renderHeight={size.h}
            isFaceDown
            isPlayable
          />
        ))}
      </div>
    </div>
  );
}
