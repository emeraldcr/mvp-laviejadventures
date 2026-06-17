// app/api/mundial/penalitos/live/route.ts
// SSE endpoint — streams penalitos game state to all connected clients.
// Polls MongoDB every 600ms and advances the game state machine via tickState().
import { getDb } from "@/lib/helpers/mongodb";
import {
  ensureState,
  getState,
  serializeState,
  tickState,
  type SerializedPenalitosState,
} from "@/lib/mundial/penalitos";

export const dynamic = "force-dynamic";
export const maxDuration = 55; // Vercel streaming limit

const POLL_MS = 600;

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let closed = false;
  let timerId: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      function send(payload: SerializedPenalitosState) {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {
          // controller may already be closed
        }
      }

      // Send initial snapshot immediately
      try {
        const db = await getDb();
        const state = await ensureState(db);
        send(serializeState(state));
      } catch (err) {
        console.error("[penalitos/live] initial fetch error", err);
        send({ game: null, queue: [], scores: {} });
      }

      // Poll + tick on each interval
      timerId = setInterval(async () => {
        if (closed) {
          if (timerId) clearInterval(timerId);
          return;
        }
        try {
          const db = await getDb();
          await tickState(db);
          const state = await getState(db);
          send(serializeState(state));
        } catch (err) {
          console.error("[penalitos/live] poll error", err);
        }
      }, POLL_MS);

      // Clean up when client disconnects
      req.signal.addEventListener("abort", () => {
        closed = true;
        if (timerId) clearInterval(timerId);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },

    cancel() {
      closed = true;
      if (timerId) clearInterval(timerId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
