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
      className={`flex items-center gap-2 ${isVertical ? "flex-col" : "flex-row"}`}
    >
      {/* Avatar circle */}
      <div
        className="relative flex items-center justify-center rounded-full text-sm font-bold select-none"
        style={{
          width: 40,
          height: 40,
          backgroundColor: isCurrentTurn ? theme.accentPrimary : theme.panelBg,
          color: isCurrentTurn ? theme.pageBg : theme.pageTextMuted,
          border: `2px solid ${isCurrentTurn ? theme.turnActive : theme.panelBorder}`,
        }}
      >
        {initials}
        {/* Turn pulse */}
        {isCurrentTurn && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: theme.turnActive }}
          />
        )}
      </div>

      {/* Name + tile count */}
      <div className={`flex flex-col ${isVertical ? "items-center" : "items-start"}`}>
        <span
          className="text-xs font-medium"
          style={{ color: isCurrentTurn ? theme.pageText : theme.pageTextMuted }}
        >
          {name}
        </span>
        {tileCount !== undefined && (
          <span
            className="text-xs"
            style={{ color: theme.pageTextMuted }}
          >
            {tileCount} tile{tileCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
