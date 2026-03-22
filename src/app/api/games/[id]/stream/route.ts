import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: gameId } = await params;
  const db = createServiceClient();

  // Verify game exists
  const { data: game } = await db
    .from("games")
    .select("id")
    .eq("id", gameId)
    .single();

  if (!game) {
    return new Response("Game not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let lastHash = "";

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial state immediately
      const { data } = await db
        .from("games")
        .select("game_state, status")
        .eq("id", gameId)
        .single();

      if (data?.game_state) {
        const json = JSON.stringify(data.game_state);
        lastHash = simpleHash(json);
        controller.enqueue(encoder.encode(`data: ${json}\n\n`));
      }

      // Poll for changes
      const interval = setInterval(async () => {
        try {
          const { data: current } = await db
            .from("games")
            .select("game_state, status")
            .eq("id", gameId)
            .single();

          if (!current?.game_state) return;

          const json = JSON.stringify(current.game_state);
          const hash = simpleHash(json);

          if (hash !== lastHash) {
            lastHash = hash;
            controller.enqueue(encoder.encode(`data: ${json}\n\n`));
          }

          // Close stream if game is over
          if (current.status === "game_over") {
            clearInterval(interval);
            controller.close();
          }
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

      // Clean up if client disconnects
      _request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

/** Fast non-crypto hash for change detection */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}
