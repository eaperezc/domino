"use client";

import { theme } from "@/lib/theme";

interface PlayerAvatarProps {
  name: string;
  tileCount?: number;
  isCurrentTurn: boolean;
  position: "top" | "bottom" | "left" | "right";
}

export default function PlayerAvatar({
  name,
  tileCount,
  isCurrentTurn,
  position,
}: PlayerAvatarProps) {
  const isVertical = position === "left" || position === "right";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-200 ${
        isVertical ? "flex-col" : "flex-row"
      } ${isCurrentTurn ? "animate-[glow_1.5s_ease-in-out_infinite_alternate]" : ""}`}
      style={{
        background: theme.surfaceBg,
        border: isCurrentTurn ? `2px solid ${theme.turnActive}` : `1px solid ${theme.surfaceBorder}`,
        boxShadow: isCurrentTurn ? "0 0 15px rgba(34,197,94,0.5)" : "none",
        opacity: isCurrentTurn ? 1 : 0.6,
        transform: isCurrentTurn ? "scale(1.05)" : "scale(1)",
      }}
    >
      {/* Avatar circle */}
      <div
        className="relative flex items-center justify-center rounded-full text-sm font-bold select-none"
        style={{
          width: 36,
          height: 36,
          backgroundColor: isCurrentTurn ? theme.accentPrimary : "rgba(255,255,255,0.1)",
          color: isCurrentTurn ? "#000" : theme.pageTextMuted,
        }}
      >
        {initials}
        {isCurrentTurn && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: theme.turnActive }}
          />
        )}
      </div>

      {/* Name + tile count */}
      <div className={`flex flex-col ${isVertical ? "items-center" : "items-start"}`}>
        <span
          className="text-xs font-semibold"
          style={{ color: isCurrentTurn ? "#fff" : theme.pageTextMuted }}
        >
          {name}
        </span>
        {tileCount !== undefined && (
          <span
            className="text-[10px]"
            style={{ color: isCurrentTurn ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}
          >
            {tileCount} tile{tileCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
