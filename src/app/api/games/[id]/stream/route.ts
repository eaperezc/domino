import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLL_MS = 1000;
// The ALB kills idle connections after 60s; comments keep quiet games alive.
const HEARTBEAT_MS = 25_000;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: gameId } = await params;

  const game = await db.game.findUnique({ where: { id: gameId }, select: { id: true } });
  if (!game) {
    return new Response("Game not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let lastHash = "";

  const stream = new ReadableStream({
    async start(controller) {
      const send = (text: string) => {
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          // stream already closed
        }
      };

      const sendCurrent = async (): Promise<string | undefined> => {
        const current = await db.game.findUnique({
          where: { id: gameId },
          select: { gameState: true, status: true },
        });
        if (!current?.gameState) return current?.status;
        const json = JSON.stringify(current.gameState);
        const hash = simpleHash(json);
        if (hash !== lastHash) {
          lastHash = hash;
          send(`data: ${json}\n\n`);
        }
        return current.status;
      };

      await sendCurrent();

      const interval = setInterval(async () => {
        try {
          const status = await sendCurrent();
          if (status === "game_over") {
            cleanup();
            controller.close();
          }
        } catch {
          cleanup();
          controller.close();
        }
      }, POLL_MS);

      const heartbeat = setInterval(() => send(": ping\n\n"), HEARTBEAT_MS);

      const cleanup = () => {
        clearInterval(interval);
        clearInterval(heartbeat);
      };

      _request.signal.addEventListener("abort", () => {
        cleanup();
        try {
          controller.close();
        } catch {}
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
