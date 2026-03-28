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
      <div className="flex items-center gap-4 text-sm bg-card border border-border/30 px-5 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest uppercase text-primary">Your team</span>
          <span className="text-lg font-bold text-foreground">{myScore}</span>
        </div>

        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-foreground/30">
          vs
        </span>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground/60">{oppScore}</span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-foreground/40">Opponents</span>
        </div>
      </div>

      {/* Turn indicator */}
      {state.status === "playing" && (
        <div
          className={`flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase px-3.5 py-2 border ${
            isHumanTurn
              ? "bg-primary/20 border-primary/40 text-primary"
              : "bg-foreground/5 border-foreground/10 text-foreground/40"
          }`}
        >
          {isHumanTurn && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
          <span>
            {isHumanTurn ? "Your turn" : `${currentPlayer?.name}...`}
          </span>
        </div>
      )}

      {/* Boneyard */}
      {state.boneyard.length > 0 && (
        <div className="font-mono text-[10px] tracking-widest uppercase text-foreground/30 bg-foreground/5 border border-foreground/10 px-3 py-2">
          Boneyard: {state.boneyard.length}
        </div>
      )}
    </div>
  );
}
