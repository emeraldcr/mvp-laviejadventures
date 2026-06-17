// app/api/mundial/penalitos/live/route.ts
// SSE endpoint for penalitos game state + live match snapshot.
// One shared poller per server process feeds all connected clients.
import type { Db } from "mongodb";
import { getDb } from "@/lib/helpers/mongodb";
import {
  ensureState,
  getState,
  serializeState,
  tickState,
  type SerializedLiveMatch,
  type SerializedPenalitosState,
} from "@/lib/mundial/penalitos";

export const dynamic = "force-dynamic";
export const maxDuration = 55; // Vercel streaming limit

const POLL_MS = 350;
const HEARTBEAT_MS = 15_000;
const MATCHES_COLLECTION = "mundial_matches";

// Per-process connection counter: approximate on multi-instance deployments.
let activeConnections = 0;
let pollTimerId: ReturnType<typeof setInterval> | null = null;
let refreshPromise: Promise<void> | null = null;
let lastSignature = "";
let lastPayload: SerializedPenalitosState = serializeState(null, {
  liveMatch: null,
  viewerCount: 0,
});

type MatchDoc = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLiveScore?: number | null;
  awayLiveScore?: number | null;
  liveMinute?: number | null;
  liveStatus?: string;
  liveNote?: string;
};

type LiveClient = {
  send: (payload: SerializedPenalitosState) => void;
  heartbeat: () => void;
};

const clients = new Set<LiveClient>();

async function fetchLiveMatch(db: Db): Promise<SerializedLiveMatch | null> {
  const doc = await db.collection<MatchDoc>(MATCHES_COLLECTION).findOne(
    { liveStatus: { $in: ["live", "halftime"] } },
    {
      projection: {
        _id: 0,
        id: 1,
        homeTeam: 1,
        awayTeam: 1,
        homeLiveScore: 1,
        awayLiveScore: 1,
        liveMinute: 1,
        liveStatus: 1,
        liveNote: 1,
      },
    }
  );
  if (!doc) return null;
  const status = doc.liveStatus;
  return {
    id: doc.id,
    homeTeam: doc.homeTeam,
    awayTeam: doc.awayTeam,
    homeLiveScore: typeof doc.homeLiveScore === "number" ? doc.homeLiveScore : null,
    awayLiveScore: typeof doc.awayLiveScore === "number" ? doc.awayLiveScore : null,
    liveMinute: typeof doc.liveMinute === "number" ? doc.liveMinute : null,
    liveStatus: status === "live" || status === "halftime" || status === "fulltime" ? status : "scheduled",
    liveNote: doc.liveNote ?? "",
  };
}

function broadcast(payload: SerializedPenalitosState) {
  const signature = JSON.stringify(payload);
  if (signature === lastSignature) return;
  lastSignature = signature;
  lastPayload = payload;
  for (const client of clients) client.send(payload);
}

async function refreshSnapshot() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const db = await getDb();
    await tickState(db);
    const [state, liveMatch] = await Promise.all([getState(db), fetchLiveMatch(db)]);
    broadcast(serializeState(state, { liveMatch, viewerCount: activeConnections }));
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

function startPoller() {
  if (pollTimerId) return;
  pollTimerId = setInterval(() => {
    void refreshSnapshot().catch((err) => {
      console.error("[penalitos/live] poll error", err);
    });
  }, POLL_MS);
}

function stopPollerIfIdle() {
  if (clients.size > 0) return;
  if (pollTimerId) clearInterval(pollTimerId);
  pollTimerId = null;
  lastSignature = "";
}

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let closed = false;
  let heartbeatId: ReturnType<typeof setInterval> | null = null;
  let decremented = false;
  let client: LiveClient | null = null;

  activeConnections++;

  function decrement() {
    if (decremented) return;
    decremented = true;
    activeConnections = Math.max(0, activeConnections - 1);
  }

  function cleanup() {
    closed = true;
    decrement();
    if (client) {
      clients.delete(client);
      client = null;
    }
    stopPollerIfIdle();
    if (heartbeatId) clearInterval(heartbeatId);
    void refreshSnapshot().catch(() => {});
  }

  const stream = new ReadableStream({
    async start(controller) {
      function send(payload: SerializedPenalitosState) {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          // controller may already be closed
        }
      }

      function heartbeat() {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          // controller may already be closed
        }
      }

      client = { send, heartbeat };
      clients.add(client);
      send(lastPayload);

      try {
        const db = await getDb();
        await ensureState(db);
        await refreshSnapshot();
      } catch (err) {
        console.error("[penalitos/live] initial fetch error", err);
        send(serializeState(null, { liveMatch: null, viewerCount: activeConnections }));
      }

      startPoller();
      heartbeatId = setInterval(heartbeat, HEARTBEAT_MS);

      req.signal.addEventListener("abort", () => {
        cleanup();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },

    cancel() {
      cleanup();
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
