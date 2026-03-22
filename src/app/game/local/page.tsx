"use client";

import { useCallback } from "react";
import { useGameController } from "@/lib/engine/useGameController";
import { useDragDrop } from "@/lib/useDragDrop";
import GameBoard from "@/components/board/GameBoard";
import PlayerHand from "@/components/board/PlayerHand";
import GameStatus from "@/components/board/GameStatus";
import type { Tile } from "@/lib/engine/types";

export default function LocalGamePage() {
  const game = useGameController();
  const { drag, startDrag, resetDrag } = useDragDrop();

  const handlePlayTile = useCallback(
    (tile: Tile, end: "left" | "right") => {
      game.playTile(tile, end);
      resetDrag();
    },
    [game.playTile, resetDrag],
  );

  if (!game.state) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400">Dealing tiles...</p>
      </div>
    );
  }

  const opponentTileCount =
    game.state.hands["ai"]?.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center gap-4 px-4 py-4">
      <h1 className="text-xl font-bold tracking-tight">Domino</h1>

      {/* Opponent info */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>Computer</span>
        <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">
          {opponentTileCount} tiles
        </span>
      </div>

      {/* Game status bar */}
      <GameStatus
        state={game.state}
        humanId={game.humanId}
        onNewRound={game.startNewRound}
        onNewGame={game.startNewGame}
      />

      {/* Board */}
      <div className="w-full">
        <GameBoard
          chain={game.state.chain}
          draggingTile={drag.tile}
          validMoves={game.validMoves}
          onPlayTile={handlePlayTile}
          onDragReset={resetDrag}
        />
      </div>

      {/* Player hand */}
      <div className="flex flex-col items-center gap-2">
        <PlayerHand
          tiles={game.orderedHand}
          validMoves={game.validMoves}
          onReorder={game.reorderHand}
          onDragStart={startDrag}
          onDragReset={resetDrag}
          isDragging={drag.tile !== null}
        />

        {/* Action buttons */}
        <div className="flex gap-2">
          {game.isHumanTurn && !game.canPlay && game.canDraw && (
            <button
              onClick={game.drawTile}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-medium"
            >
              Draw from boneyard
            </button>
          )}
          {game.mustPass && (
            <button
              onClick={game.passTurn}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium"
            >
              Pass
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
