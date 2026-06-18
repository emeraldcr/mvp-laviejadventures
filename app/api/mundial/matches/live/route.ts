// app/api/mundial/matches/live/route.ts
// SSE broadcaster: pushes live match state to ALL connected clients simultaneously.
// Single shared poller per process instance — no per-client timers.
import { getDb } from "@/lib/helpers/mongodb";
import {
  EMPTY_LIVE_MATCH_STATS,
  serializeLiveMatchStats,
  type LiveMatchStats,
} from "@/lib/mundial/live-stats";

export const dynamic = "force-dynamic";
export const maxDuration = 55;

const POLL_MS = 1_000;
const HEARTBEAT_MS = 15_000;

// ─── Types ────────────────────────────────────────────────────────────────────

type LiveEvent = {
  id: string;
  type: string;
  team: "home" | "away" | null;
  minute: number | null;
  player: string;
  note: string;
  createdAt: string | null;
};

export type LiveMatchPayload = {
  matchId: string | null;
  homeTeam: string;
  awayTeam: string;
  liveStatus: string;
  homeLiveScore: number | null;
  awayLiveScore: number | null;
  liveMinute: number | null;
  liveNote: string;
  liveEvents: LiveEvent[];
  liveStats: LiveMatchStats;
  liveUpdatedAt: string | null;
  viewerCount: number;
};

type MatchDoc = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLiveScore?: number | null;
  awayLiveScore?: number | null;
  liveMinute?: number | null;
  liveStatus?: string;
  liveNote?: string;
  liveEvents?: unknown[];
  liveStats?: unknown;
  liveUpdatedAt?: string | null;
};

// ─── Module-level broadcaster (shared within a warm process instance) ─────────

let pollTimerId: ReturnType<typeof setInterval> | null = null;
let refreshPromise: Promise<void> | null = null;
let lastSignature = "";
let lastPayload: LiveMatchPayload = emptyPayload(0);
let activeConnections = 0;

type Client = { send: (p: LiveMatchPayload) => void; heartbeat: () => void };
const clients = new Set<Client>();

function emptyPayload(viewerCount: number): LiveMatchPayload {
  return {
    matchId: null,
    homeTeam: "",
    awayTeam: "",
    liveStatus: "scheduled",
    homeLiveScore: null,
    awayLiveScore: null,
    liveMinute: null,
    liveNote: "",
    liveEvents: [],
    liveStats: EMPTY_LIVE_MATCH_STATS,
    liveUpdatedAt: null,
    viewerCount,
  };
}

async function buildPayload(): Promise<LiveMatchPayload> {
  const db = await getDb();
  const doc = await db.collection<MatchDoc>("mundial_matches").findOne(
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
        liveEvents: 1,
        liveStats: 1,
        liveUpdatedAt: 1,
      },
    }
  );

  if (!doc) return emptyPayload(activeConnections);

  const events = Array.isArray(doc.liveEvents)
    ? (doc.liveEvents as LiveEvent[]).filter(
        (e) => e && typeof e.id === "string"
      )
    : [];

  return {
    matchId: doc.id,
    homeTeam: doc.homeTeam,
    awayTeam: doc.awayTeam,
    liveStatus: doc.liveStatus ?? "scheduled",
    homeLiveScore: typeof doc.homeLiveScore === "number" ? doc.homeLiveScore : null,
    awayLiveScore: typeof doc.awayLiveScore === "number" ? doc.awayLiveScore : null,
    liveMinute: typeof doc.liveMinute === "number" ? doc.liveMinute : null,
    liveNote: typeof doc.liveNote === "string" ? doc.liveNote : "",
    liveEvents: events,
    liveStats: serializeLiveMatchStats(doc.liveStats),
    liveUpdatedAt: doc.liveUpdatedAt ?? null,
    viewerCount: activeConnections,
  };
}

function broadcast(payload: LiveMatchPayload) {
  const sig = JSON.stringify(payload);
  if (sig === lastSignature) return;
  lastSignature = sig;
  lastPayload = payload;
  for (const c of clients) c.send(payload);
}

async function refreshSnapshot() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const payload = await buildPayload();
    broadcast(payload);
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

function startPoller() {
  if (pollTimerId) return;
  pollTimerId = setInterval(() => {
    void refreshSnapshot().catch((err) => console.error("[matches/live] poll error", err));
  }, POLL_MS);
}

function stopPollerIfIdle() {
  if (clients.size > 0) return;
  if (pollTimerId) clearInterval(pollTimerId);
  pollTimerId = null;
  lastSignature = "";
}

// ─── GET handler ──────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  let closed = false;
  let heartbeatId: ReturnType<typeof setInterval> | null = null;
  let decremented = false;
  let client: Client | null = null;

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
  }

  const stream = new ReadableStream({
    async start(controller) {
      function send(payload: LiveMatchPayload) {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {}
      }
      function heartbeat() {
        if (closed) return;
        try { controller.enqueue(encoder.encode(": ping\n\n")); } catch {}
      }

      client = { send, heartbeat };
      clients.add(client);

      // Send cached state immediately so the client has something instantly
      send({ ...lastPayload, viewerCount: activeConnections });

      // Fetch fresh snapshot from DB
      try {
        await refreshSnapshot();
      } catch (err) {
        console.error("[matches/live] init error", err);
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
