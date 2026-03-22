import { createServiceClient } from "./service";
import type { GameState } from "@/lib/engine/types";

/**
 * Broadcast game state to all connected clients via Supabase Realtime.
 * Called from API routes after updating the DB.
 */
export async function broadcastGameState(gameId: string, gameState: GameState) {
  const supabase = createServiceClient();
  const channel = supabase.channel(`game:${gameId}`);

  await channel.send({
    type: "broadcast",
    event: "game_state",
    payload: gameState,
  });

  await supabase.removeChannel(channel);
}

/**
 * Broadcast a lobby event (seat changes, game start) to all connected clients.
 */
export async function broadcastLobbyEvent(gameId: string, event: string, payload: unknown) {
  const supabase = createServiceClient();
  const channel = supabase.channel(`lobby:${gameId}`);

  await channel.send({
    type: "broadcast",
    event,
    payload: payload as Record<string, unknown>,
  });

  await supabase.removeChannel(channel);
}
