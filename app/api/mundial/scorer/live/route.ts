// SSE stream: scorer state + live match snapshot.
import type { Db } from "mongodb";
import { getDb } from "@/lib/helpers/mongodb";
import {
  ensureState,
  getState,
  serializeState,
  tickState,
  type SerializedScorerState,
  type SerializedScorerLiveMatch,
} from "@/lib/mundial/scorer";
import { subscribeScorerChanges } from "@/lib/mundial/scorer-events";

export const dynamic = "force-dynamic";
export const maxDuration = 55;

const POLL_MS = 1_500;
const HEARTBEAT_MS = 15_000;
const MATCHES_COLLECTION = "mundial_matches";

let activeConnections = 0;
let pollTimerId: ReturnType<typeof setInterval> | null = null;
let refreshPromise: Promise<void> | null = null;
let lastSignature = "";
let lastPayload: SerializedScorerState = serializeState(null);

type GoalEvent = { id: string; type: string; player?: string };
type MatchDoc = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLiveScore?: number | null;
  awayLiveScore?: number | null;
  liveMinute?: number | null;
  liveStatus?: string;
  liveEvents?: GoalEvent[];
};

type LiveClient = {
  send: (payload: SerializedScorerState) => void;
  heartbeat: () => void;
};

const clients = new Set<LiveClient>();

async function fetchLiveMatch(
  db: Db
): Promise<{ match: SerializedScorerLiveMatch | null; doc: MatchDoc | null }> {
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
        liveEvents: 1,
      },
    }
  );
  if (!doc) return { match: null, doc: null };
  return {
    doc,
    match: {
      id: doc.id,
      homeTeam: doc.homeTeam,
      awayTeam: doc.awayTeam,
      homeLiveScore: typeof doc.homeLiveScore === "number" ? doc.homeLiveScore : null,
      awayLiveScore: typeof doc.awayLiveScore === "number" ? doc.awayLiveScore : null,
      liveMinute: typeof doc.liveMinute === "number" ? doc.liveMinute : null,
      liveStatus: doc.liveStatus ?? "scheduled",
    },
  };
}

function broadcast(payload: SerializedScorerState) {
  const sig = JSON.stringify(payload);
  if (sig === lastSignature) return;
  lastSignature = sig;
  lastPayload = payload;
  for (const client of clients) client.send(payload);
}

async function refreshSnapshot() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const db = await getDb();
    const { match, doc: matchDoc } = await fetchLiveMatch(db);
    await tickState(db, matchDoc);
    const state = await getState(db);
    broadcast(serializeState(state, { liveMatch: match, viewerCount: activeConnections }));
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

subscribeScorerChanges(() => {
  void refreshSnapshot().catch((err) => console.error("[scorer/live] notify error", err));
});

function startPoller() {
  if (pollTimerId) return;
  pollTimerId = setInterval(() => {
    void refreshSnapshot().catch((err) => console.error("[scorer/live] poll error", err));
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
    if (client) { clients.delete(client); client = null; }
    stopPollerIfIdle();
    if (heartbeatId) clearInterval(heartbeatId);
    void refreshSnapshot().catch(() => {});
  }

  const stream = new ReadableStream({
    async start(controller) {
      function send(payload: SerializedScorerState) {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: state\ndata: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {}
      }
      function heartbeat() {
        if (closed) return;
        try { controller.enqueue(encoder.encode(": ping\n\n")); } catch {}
      }

      client = { send, heartbeat };
      clients.add(client);
      try { controller.enqueue(encoder.encode("retry: 1000\n\n")); } catch {}
      send(lastPayload);

      try {
        const db = await getDb();
        await ensureState(db);
        await refreshSnapshot();
      } catch (err) {
        console.error("[scorer/live] init error", err);
        send(serializeState(null));
      }

      startPoller();
      heartbeatId = setInterval(heartbeat, HEARTBEAT_MS);
      req.signal.addEventListener("abort", () => {
        cleanup();
        try { controller.close(); } catch {}
      });
    },
    cancel() { cleanup(); },
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
