"use client";

import GameBoard from "@/components/board/GameBoard";
import GameOverDialog from "@/components/board/GameOverDialog";
import GameStatus from "@/components/board/GameStatus";
import OpponentHand from "@/components/board/OpponentHand";
import PartnerHand from "@/components/board/PartnerHand";
import PlayerAvatar from "@/components/board/PlayerAvatar";
import PlayerHand from "@/components/board/PlayerHand";
import type { SeatPosition, Tile } from "@/lib/engine/types";
import { useGameController } from "@/lib/engine/useGameController";
import { theme } from "@/lib/theme";
import { useDragDrop } from "@/lib/useDragDrop";
import { useCallback } from "react";

export default function LocalGamePage() {
  const game = useGameController();
  const { drag, startDrag, resetDrag } = useDragDrop();

  const handlePlayTile = useCallback(
    (tile: Tile, end: "left" | "right") => {
      game.playTile(tile, end);
      resetDrag();
    },
    [game, resetDrag],
  );

  if (!game.state) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.pageBg, color: theme.pageText }}
      >
        <p style={{ color: theme.pageTextMuted }}>Dealing tiles...</p>
      </div>
    );
  }

  // Get opponents by seat position
  const getPlayerAtSeat = (seat: SeatPosition) =>
    game.state!.players.find((p) => game.seating[p.id] === seat);

  const topPlayer = getPlayerAtSeat("top")!;
  const leftPlayer = getPlayerAtSeat("left")!;
  const rightPlayer = getPlayerAtSeat("right")!;

  return (
    <div
      className="h-screen flex flex-col items-center gap-2 px-3 py-2 overflow-hidden"
      style={{ backgroundColor: theme.pageBg, color: theme.pageText }}
    >
    <div
      className="flex flex-col items-center gap-2 w-full h-full px-8"
      style={{ margin: "0 auto" }}
    >
      {/* Game status bar */}
      <GameStatus
        state={game.state}
        humanId={game.humanId}
      />

      {/* Game over / round over dialog */}
      <GameOverDialog
        state={game.state}
        humanId={game.humanId}
        onNewRound={game.startNewRound}
        onNewGame={game.startNewGame}
      />

      {/* Partner hand (top) */}
      <PartnerHand
        name={topPlayer.name}
        tileCount={game.state.hands[topPlayer.id]?.length ?? 0}
        isCurrentTurn={game.state.currentTurn === topPlayer.id}
      />

      {/* Middle row: left opponent, board, right opponent — fills remaining space */}
      <div className="flex items-stretch gap-4 w-full flex-1 min-h-0">
        {/* Left opponent */}
        <div className="flex-shrink-0 flex items-center pl-2">
          <OpponentHand
            name={leftPlayer.name}
            tileCount={game.state.hands[leftPlayer.id]?.length ?? 0}
            isCurrentTurn={game.state.currentTurn === leftPlayer.id}
            position="left"
          />
        </div>

        {/* Board — grows to fill */}
        <div className="flex-1 min-w-0 min-h-0">
          <GameBoard
            chain={game.state.chain}
            draggingTile={drag.tile}
            validMoves={game.validMoves}
            onPlayTile={handlePlayTile}
            onDragReset={resetDrag}
          />
        </div>

        {/* Right opponent */}
        <div className="flex-shrink-0 flex items-center pr-2">
          <OpponentHand
            name={rightPlayer.name}
            tileCount={game.state.hands[rightPlayer.id]?.length ?? 0}
            isCurrentTurn={game.state.currentTurn === rightPlayer.id}
            position="right"
          />
        </div>
      </div>

      {/* Player hand (bottom) */}
      <div
        className={`relative z-20 flex items-center mb-2 mt-1 gap-4 flex-shrink-0 rounded-2xl px-4 py-2 transition-all duration-200 ${
          game.isHumanTurn ? "animate-[glow_1.5s_ease-in-out_infinite_alternate]" : ""
        }`}
        style={{
          background: theme.surfaceBg,
          border: game.isHumanTurn ? `2px solid ${theme.turnActive}` : `1px solid ${theme.surfaceBorder}`,
        }}
      >
        <PlayerHand
          tiles={game.orderedHand}
          validMoves={game.validMoves}
          onReorder={game.reorderHand}
          onDragStart={startDrag}
          onDragReset={resetDrag}
        />

        <div className="flex flex-col items-center gap-2">
          <PlayerAvatar
            name="You"
            tileCount={game.orderedHand.length}
            isCurrentTurn={game.isHumanTurn}
            position="bottom"
          />

          {game.isHumanTurn && !game.canPlay && game.canDraw && (
            <button
              onClick={game.drawTile}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: theme.btnDraw }}
            >
              Draw from boneyard
            </button>
          )}
          {game.mustPass && (
            <button
              onClick={game.passTurn}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: theme.btnPass }}
            >
              Pass
            </button>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
