"use client";

import type { GameState } from "@/lib/engine/types";
import { theme } from "@/lib/theme";

interface GameOverDialogProps {
  state: GameState;
  humanId: string;
  onNewRound?: () => void;
  onNewGame?: () => void;
}

export default function GameOverDialog({
  state,
  humanId,
  onNewRound,
  onNewGame,
}: GameOverDialogProps) {
  if (state.status !== "round_over" && state.status !== "game_over") {
    return null;
  }

  const humanPlayer = state.players.find((p) => p.id === humanId)!;
  const humanTeam = humanPlayer.team;
  const isGameOver = state.status === "game_over";
  const didWin = isGameOver
    ? state.winner === humanTeam
    : state.winningTeam === humanTeam;

  const teams = [...new Set(state.players.map((p) => p.team))];

  const roundWinnerPlayer = state.players.find((p) => p.id === state.roundWinner);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        className="rounded-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center gap-6"
        style={{ backgroundColor: theme.panelBg, border: `1px solid ${theme.panelBorder}` }}
      >
        {/* Title */}
        <div className="text-center">
          <h2
            className="text-3xl font-bold mb-1"
            style={{ color: didWin ? theme.accentPrimary : theme.pageText }}
          >
            {isGameOver
              ? didWin ? "You Won!" : "Game Over"
              : didWin ? "Round Won!" : "Round Lost"}
          </h2>
          {roundWinnerPlayer && (
            <p className="text-sm" style={{ color: theme.pageTextMuted }}>
              {roundWinnerPlayer.name} went out
            </p>
          )}
        </div>

        {/* Scores */}
        <div className="w-full flex flex-col gap-3">
          {teams.map((team) => {
            const isMyTeam = team === humanTeam;
            const teamPlayers = state.players.filter((p) => p.team === team);
            const isWinningTeam = team === state.winningTeam;

            return (
              <div
                key={team}
                className="flex items-center justify-between px-4 py-3 rounded-lg"
                style={{
                  backgroundColor: isWinningTeam ? theme.accentMuted : theme.pageBg,
                  border: isWinningTeam ? `1px solid ${theme.accentPrimary}` : `1px solid ${theme.panelBorder}`,
                }}
              >
                <div>
                  <div
                    className="font-medium text-sm"
                    style={{ color: isMyTeam ? theme.pageText : theme.pageTextMuted }}
                  >
                    {isMyTeam ? "Your team" : "Opponents"}
                  </div>
                  <div className="text-xs" style={{ color: theme.pageTextMuted }}>
                    {teamPlayers.map((p) => p.name).join(" & ")}
                  </div>
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: isMyTeam ? theme.pageText : theme.pageTextMuted }}
                >
                  {state.scores[team] ?? 0}
                </div>
              </div>
            );
          })}
        </div>

        {/* Remaining tiles summary */}
        <div className="w-full">
          <p className="text-xs mb-2" style={{ color: theme.pageTextMuted }}>
            Remaining tiles
          </p>
          <div className="flex flex-wrap gap-3">
            {state.players.map((p) => {
              const pips = state.hands[p.id]?.reduce(
                (s, t) => s + t.left + t.right,
                0,
              ) ?? 0;
              return (
                <div key={p.id} className="text-xs" style={{ color: theme.pageTextMuted }}>
                  <span style={{ color: theme.pageText }}>{p.name}</span>: {pips} pips ({state.hands[p.id]?.length ?? 0} tiles)
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!isGameOver && (
            <button
              onClick={onNewRound}
              className="px-6 py-2.5 rounded-lg font-medium text-sm text-white"
              style={{ backgroundColor: theme.btnPrimary }}
            >
              Next Round
            </button>
          )}
          <button
            onClick={onNewGame}
            className="px-6 py-2.5 rounded-lg font-medium text-sm"
            style={{
              backgroundColor: isGameOver ? theme.btnPrimary : theme.panelBorder,
              color: isGameOver ? "white" : theme.pageTextMuted,
            }}
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
