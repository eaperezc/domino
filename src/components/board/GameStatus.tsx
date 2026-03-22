"use client";

import type { GameState } from "@/lib/engine/types";
import { theme } from "@/lib/theme";

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

  return (
    <div
      className="flex items-center justify-between px-6 py-3 rounded-lg text-sm w-full max-w-4xl"
      style={{ backgroundColor: theme.panelBg }}
    >
      {/* Team scores */}
      <div className="flex gap-6">
        {teams.map((team) => {
          const isMyTeam = team === humanTeam;
          const teamPlayers = state.players.filter((p) => p.team === team);
          return (
            <div key={team} className="flex items-center gap-2">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{
                  backgroundColor: isMyTeam ? theme.accentMuted : theme.panelBorder,
                  color: isMyTeam ? theme.accentPrimary : theme.pageTextMuted,
                }}
              >
                {isMyTeam ? "Your team" : "Opponents"}
              </span>
              <span
                className="font-bold"
                style={{ color: isMyTeam ? theme.pageText : theme.pageTextMuted }}
              >
                {state.scores[team] ?? 0}
              </span>
              <span className="text-xs" style={{ color: theme.pageTextMuted }}>
                ({teamPlayers.map((p) => p.name).join(" & ")})
              </span>
            </div>
          );
        })}
      </div>

      {/* Turn indicator */}
      {state.status === "playing" && (
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full font-medium"
          style={{
            backgroundColor: isHumanTurn ? theme.accentPrimary : theme.panelBorder,
            color: isHumanTurn ? "#000" : theme.pageTextMuted,
          }}
        >
          {isHumanTurn && (
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
          )}
          <span>
            {isHumanTurn ? "Your turn" : `${currentPlayer?.name} is thinking...`}
          </span>
        </div>
      )}

      {/* Boneyard — only show when there are tiles */}
      {state.boneyard.length > 0 && (
        <div style={{ color: theme.pageTextMuted }}>
          Boneyard: {state.boneyard.length}
        </div>
      )}
    </div>
  );
}
