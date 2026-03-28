"use client";

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
      className={`flex items-center gap-2.5 px-3 py-2 transition-all duration-200 border bg-card ${
        isVertical ? "flex-col" : "flex-row"
      } ${
        isCurrentTurn
          ? "border-primary shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105 animate-[glow_1.5s_ease-in-out_infinite_alternate]"
          : "border-border/30 opacity-60"
      }`}
    >
      {/* Avatar */}
      <div
        className={`relative flex items-center justify-center w-9 h-9 font-mono text-sm font-bold select-none ${
          isCurrentTurn
            ? "bg-primary text-black"
            : "bg-white/10 text-muted-foreground"
        }`}
      >
        {initials}
        {isCurrentTurn && (
          <span className="absolute inset-0 animate-ping opacity-20 bg-primary" />
        )}
      </div>

      {/* Name + tile count */}
      <div className={`flex flex-col ${isVertical ? "items-center" : "items-start"}`}>
        <span
          className={`font-mono text-[10px] tracking-widest uppercase font-semibold ${
            isCurrentTurn ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {name}
        </span>
        {tileCount !== undefined && (
          <span
            className={`font-mono text-[10px] tracking-wider ${
              isCurrentTurn ? "text-foreground/70" : "text-foreground/30"
            }`}
          >
            {tileCount} tile{tileCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
