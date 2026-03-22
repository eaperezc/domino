"use client";

import type { GameState } from "@/lib/engine/types";

interface GameStatusProps {
  state: GameState;
  humanId: string;
}

export default function GameStatus({
  state,
  humanId,
}: GameStatusProps) {
  const humanPlayer = state.players.find((p) => p.id === humanId)!;
  const humanTeam = humanPlayer.team;
  const teams = [...new Set(state.players.map((p) => p.team))];
  const isHumanTurn = state.currentTurn === humanId && state.status === "playing";
  const currentPlayer = state.players.find((p) => p.id === state.currentTurn);

  const myTeam = teams.find((t) => t === humanTeam)!;
  const oppTeam = teams.find((t) => t !== humanTeam)!;
  const myScore = state.scores[myTeam] ?? 0;
  const oppScore = state.scores[oppTeam] ?? 0;

  return (
    <div className="flex items-center justify-center gap-3 flex-shrink-0">
      {/* Score HUD */}
      <div
        className="flex items-center gap-4 text-sm"
        style={{
          background: "rgba(0,0,0,0.6)",
          borderRadius: 999,
          padding: "8px 20px",
        }}
      >
        {/* Your team */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-emerald-400">Your team</span>
          <span className="text-lg font-bold text-white">{myScore}</span>
        </div>

        {/* VS divider */}
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
          vs
        </span>

        {/* Opponents */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white/60">{oppScore}</span>
          <span className="text-[11px] font-medium text-white/40">Opponents</span>
        </div>
      </div>

      {/* Turn indicator pill */}
      {state.status === "playing" && (
        <div
          className="flex items-center gap-2 text-xs font-medium"
          style={{
            background: isHumanTurn ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
            borderRadius: 999,
            padding: "6px 14px",
            border: isHumanTurn ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.08)",
            color: isHumanTurn ? "#4ade80" : "rgba(255,255,255,0.4)",
          }}
        >
          {isHumanTurn && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          )}
          <span>
            {isHumanTurn ? "Your turn" : `${currentPlayer?.name}...`}
          </span>
        </div>
      )}

      {/* Boneyard — only show when there are tiles */}
      {state.boneyard.length > 0 && (
        <div
          className="text-[11px] text-white/30"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 999,
            padding: "6px 12px",
          }}
        >
          Boneyard: {state.boneyard.length}
        </div>
      )}
    </div>
  );
}
