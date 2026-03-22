"use client";

import type { GameState, Player } from "@/lib/engine/types";

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
  const currentPlayer = state.players.find((p) => p.id === state.currentTurn);
  const isHumanTurn = state.currentTurn === humanId;

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-slate-800 rounded-lg text-sm">
      {/* Scores */}
      <div className="flex gap-6">
        {state.players.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                p.id === state.currentTurn ? "bg-green-400" : "bg-slate-600"
              }`}
            />
            <span className={p.id === humanId ? "text-white font-medium" : "text-slate-400"}>
              {p.name}
            </span>
            <span className="text-slate-500">{state.scores[p.id] ?? 0}</span>
          </div>
        ))}
      </div>

      {/* Turn / Status */}
      <div className="text-slate-300">
        {state.status === "playing" && (
          isHumanTurn ? "Your turn" : `${currentPlayer?.name} is thinking...`
        )}
        {state.status === "round_over" && (
          <div className="flex items-center gap-3">
            <span>
              {state.roundWinner === humanId
                ? "You won the round!"
                : `${state.players.find((p) => p.id === state.roundWinner)?.name} won the round`}
            </span>
            <button
              onClick={onNewRound}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white text-xs"
            >
              Next Round
            </button>
          </div>
        )}
        {state.status === "game_over" && (
          <div className="flex items-center gap-3">
            <span>
              {state.winner === humanId
                ? "You won the game!"
                : `${state.players.find((p) => p.id === state.winner)?.name} won the game!`}
            </span>
            <button
              onClick={onNewGame}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-xs"
            >
              New Game
            </button>
          </div>
        )}
      </div>

      {/* Boneyard */}
      <div className="text-slate-400">
        Boneyard: {state.boneyard.length}
      </div>
    </div>
  );
}
