"use client";

import { useParams } from "next/navigation";
import { useCallback } from "react";
import GameBoard from "@/components/board/GameBoard";
import GameOverDialog from "@/components/board/GameOverDialog";
import GameStatus from "@/components/board/GameStatus";
import OpponentHand from "@/components/board/OpponentHand";
import PartnerHand from "@/components/board/PartnerHand";
import PlayerAvatar from "@/components/board/PlayerAvatar";
import PlayerHand from "@/components/board/PlayerHand";
import { Button } from "@/components/ui/button";
import type { SeatPosition, Tile } from "@/lib/engine/types";
import { useOnlineGameController } from "@/lib/engine/useOnlineGameController";
import { useDragDrop } from "@/lib/useDragDrop";

export default function OnlinePlayPage() {
  const params = useParams();
  const gameId = params.id as string;
  const game = useOnlineGameController(gameId);
  const { drag, startDrag, resetDrag } = useDragDrop();

  const handlePlayTile = useCallback(
    (tile: Tile, end: "left" | "right") => {
      game.playTile(tile, end);
      resetDrag();
    },
    [game, resetDrag],
  );

  if (game.loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Loading game...
        </p>
      </div>
    );
  }

  if (!game.state) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-destructive">{game.error ?? "Game not found"}</p>
      </div>
    );
  }

  const getPlayerAtSeat = (seat: SeatPosition) =>
    game.state!.players.find((p) => game.seating[p.id] === seat);

  const topPlayer = getPlayerAtSeat("top")!;
  const leftPlayer = getPlayerAtSeat("left")!;
  const rightPlayer = getPlayerAtSeat("right")!;

  return (
    <div className="flex-1 flex flex-col items-center gap-2 px-3 py-2 overflow-hidden bg-background text-foreground">
      <div className="flex flex-col items-center gap-2 w-full h-full px-2 md:px-8">
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1">
            <GameStatus state={game.state} humanId={game.userId ?? ""} />
          </div>
          {game.saving && (
            <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground animate-pulse">
              Saving...
            </span>
          )}
        </div>

        <GameOverDialog
          state={game.state}
          humanId={game.userId ?? ""}
          onNewRound={game.startNewRound}
          onNewGame={() => {}}
        />

        <PartnerHand
          name={topPlayer.name}
          tileCount={game.state.hands[topPlayer.id]?.length ?? 0}
          isCurrentTurn={game.state.currentTurn === topPlayer.id}
        />

        <div className="flex items-stretch gap-1 md:gap-4 w-full flex-1 min-h-0">
          <div className="flex-shrink-0 flex items-center pl-2">
            <OpponentHand
              name={leftPlayer.name}
              tileCount={game.state.hands[leftPlayer.id]?.length ?? 0}
              isCurrentTurn={game.state.currentTurn === leftPlayer.id}
              position="left"
            />
          </div>

          <div className="flex-1 min-w-0 min-h-0">
            <GameBoard
              chain={game.state.chain}
              draggingTile={drag.tile}
              validMoves={game.validMoves}
              onPlayTile={handlePlayTile}
              onDragReset={resetDrag}
            />
          </div>

          <div className="flex-shrink-0 flex items-center pr-2">
            <OpponentHand
              name={rightPlayer.name}
              tileCount={game.state.hands[rightPlayer.id]?.length ?? 0}
              isCurrentTurn={game.state.currentTurn === rightPlayer.id}
              position="right"
            />
          </div>
        </div>

        <div
          className={`relative z-20 flex items-center mb-2 mt-1 gap-2 md:gap-4 flex-shrink-0 px-2 md:px-4 py-2 transition-all duration-200 bg-card border ${
            game.isMyTurn
              ? "border-primary border-2 animate-[glow_1.5s_ease-in-out_infinite_alternate]"
              : "border-border/30"
          }`}
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
              isCurrentTurn={game.isMyTurn}
              position="bottom"
            />

            {game.isMyTurn && !game.canPlay && game.canDraw && (
              <Button variant="warning" onClick={game.drawTile}>
                Draw from boneyard
              </Button>
            )}
            {game.mustPass && (
              <Button variant="destructive" onClick={game.passTurn}>
                Pass
              </Button>
            )}
          </div>
        </div>

        {game.error && (
          <p className="font-mono text-xs text-destructive mb-2">{game.error}</p>
        )}
      </div>
    </div>
  );
}
