import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LobbyState {
  status: string;
  seats: unknown[];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: gameId } = await params;
  const db = createServiceClient();

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
      const sendCurrent = async () => {
        const [{ data: gameData }, { data: seats }] = await Promise.all([
          db.from("games").select("status").eq("id", gameId).single(),
          db.from("game_seats").select("*").eq("game_id", gameId),
        ]);

        const state: LobbyState = {
          status: gameData?.status ?? "waiting",
          seats: seats ?? [],
        };

        const json = JSON.stringify(state);
        const hash = simpleHash(json);

        if (hash !== lastHash) {
          lastHash = hash;
          controller.enqueue(encoder.encode(`data: ${json}\n\n`));
        }

        return gameData?.status;
      };

      // Send initial state
      await sendCurrent();

      // Poll for changes
      const interval = setInterval(async () => {
        try {
          const status = await sendCurrent();
          // Close if game started or is over
          if (status === "playing" || status === "game_over") {
            // Send one final update then close
            clearInterval(interval);
            controller.close();
          }
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

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

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}
