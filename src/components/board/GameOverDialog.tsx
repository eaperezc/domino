"use client";

import type { GameState } from "@/lib/engine/types";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

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
      <Panel className="max-w-md w-full mx-4 flex flex-col items-center gap-6 p-8">
        {/* Title */}
        <div className="text-center">
          <h2
            className={`text-3xl font-extrabold tracking-tight mb-1 ${
              didWin ? "text-primary" : "text-foreground"
            }`}
          >
            {isGameOver
              ? didWin ? "You Won!" : "Game Over"
              : didWin ? "Round Won!" : "Round Lost"}
          </h2>
          {roundWinnerPlayer && (
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
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
                className={`flex items-center justify-between px-4 py-3 border ${
                  isWinningTeam
                    ? "bg-primary/10 border-primary"
                    : "bg-background border-border"
                }`}
              >
                <div>
                  <div
                    className={`font-medium text-sm ${
                      isMyTeam ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {isMyTeam ? "Your team" : "Opponents"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {teamPlayers.map((p) => p.name).join(" & ")}
                  </div>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isMyTeam ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {state.scores[team] ?? 0}
                </div>
              </div>
            );
          })}
        </div>

        {/* Remaining tiles summary */}
        <div className="w-full">
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
            Remaining tiles
          </p>
          <div className="flex flex-wrap gap-3">
            {state.players.map((p) => {
              const pips = state.hands[p.id]?.reduce(
                (s, t) => s + t.left + t.right,
                0,
              ) ?? 0;
              return (
                <div key={p.id} className="text-xs text-muted-foreground">
                  <span className="text-foreground">{p.name}</span>: {pips} pips ({state.hands[p.id]?.length ?? 0} tiles)
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!isGameOver && (
            <Button onClick={onNewRound}>
              Next Round
            </Button>
          )}
          <Button
            onClick={onNewGame}
            variant={isGameOver ? "default" : "secondary"}
          >
            New Game
          </Button>
        </div>
      </Panel>
    </div>
  );
}
