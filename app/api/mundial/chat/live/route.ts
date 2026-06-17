import { getDb } from "@/lib/helpers/mongodb";
import { listLiveChatMessages, type SerializedLiveChatMessage } from "@/lib/mundial/live-chat";

export const dynamic = "force-dynamic";
export const maxDuration = 55;

const POLL_MS = 900;

function cleanMatchId(value: string | null): string {
  return value ? value.trim().slice(0, 80) : "";
}

type ChatPayload = {
  messages: SerializedLiveChatMessage[];
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const matchId = cleanMatchId(url.searchParams.get("matchId"));
  const encoder = new TextEncoder();
  let closed = false;
  let timerId: ReturnType<typeof setInterval> | null = null;
  let lastSignature = "";

  const stream = new ReadableStream({
    async start(controller) {
      function send(payload: ChatPayload) {
        if (closed) return;
        const signature = JSON.stringify(payload);
        if (signature === lastSignature) return;
        lastSignature = signature;

        try {
          controller.enqueue(encoder.encode(`data: ${signature}\n\n`));
        } catch {
          // controller may already be closed
        }
      }

      async function pushSnapshot() {
        if (!matchId) {
          send({ messages: [] });
          return;
        }
        const db = await getDb();
        send({ messages: await listLiveChatMessages(db, matchId) });
      }

      try {
        await pushSnapshot();
      } catch (err) {
        console.error("[mundial/chat/live] initial error", err);
        send({ messages: [] });
      }

      timerId = setInterval(async () => {
        if (closed) {
          if (timerId) clearInterval(timerId);
          return;
        }

        try {
          await pushSnapshot();
        } catch (err) {
          console.error("[mundial/chat/live] poll error", err);
        }
      }, POLL_MS);

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
