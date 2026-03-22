"use client";

import type { GameState } from "@/lib/engine/types";
import { theme } from "@/lib/theme";

interface GameStatusProps {
  state: GameState;
  humanId: string;
  onNewRound?: () => void;
  onNewGame?: () => void;
}

export default function GameStatus({
  state,
  humanId,
  onNewRound,
  onNewGame,
}: GameStatusProps) {
  const humanPlayer = state.players.find((p) => p.id === humanId)!;
  const humanTeam = humanPlayer.team;
  const teams = [...new Set(state.players.map((p) => p.team))];
  const isHumanTurn = state.currentTurn === humanId;
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

      {/* Turn / Status */}
      <div style={{ color: theme.pageTextMuted }}>
        {state.status === "playing" && (
          <span>
            {isHumanTurn
              ? "Your turn"
              : `${currentPlayer?.name} is thinking...`}
          </span>
        )}
        {state.status === "round_over" && (
          <div className="flex items-center gap-3">
            <span>
              {state.winningTeam === humanTeam
                ? "Your team won the round!"
                : "Opponents won the round"}
            </span>
            <button
              onClick={onNewRound}
              className="px-3 py-1 rounded text-white text-xs"
              style={{ backgroundColor: theme.btnPrimary }}
            >
              Next Round
            </button>
          </div>
        )}
        {state.status === "game_over" && (
          <div className="flex items-center gap-3">
            <span>
              {state.winner === humanTeam
                ? "Your team won the game!"
                : "Opponents won the game!"}
            </span>
            <button
              onClick={onNewGame}
              className="px-3 py-1 rounded text-white text-xs"
              style={{ backgroundColor: theme.accentPrimary }}
            >
              New Game
            </button>
          </div>
        )}
      </div>

      {/* Boneyard */}
      <div style={{ color: theme.pageTextMuted }}>
        Boneyard: {state.boneyard.length}
      </div>
    </div>
  );
}
