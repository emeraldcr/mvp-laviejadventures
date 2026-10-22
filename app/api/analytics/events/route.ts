import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/helpers/mongodb";
import { headers } from "next/headers";
import { COLLECTIONS } from "@/lib/constants/db";

type AnalyticsEventName =
  | "page_view"
  | "click"
  | "booking_step"
  | "booking_step_progressed"
  | "booking_step_backtracked"
  | "booking_step_completed"
  | "booking_step_blocked"
  | "booking_step_abandoned"
  | "booking_field_blur"
  | "booking_selection_changed"
  | "booking_submitted"
  | "booking_checkout_started"
  | "payment_order_created"
  | "payment_approved"
  | "payment_error"
  | "booking_completed"
  | "whatsapp_checkout_click"
  | "sinpe_checkout_selected";

type AnalyticsEventInput = {
  event?: AnalyticsEventName;
  path?: string;
  referrer?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  happenedAt?: string;
};

type StoredAnalyticsEvent = {
  event: AnalyticsEventName;
  path?: string | null;
  sessionId?: string | null;
  metadata?: Record<string, unknown>;
  happenedAt?: Date | string | null;
  request?: {
    deviceType?: string | null;
  };
};

const VALID_EVENTS: AnalyticsEventName[] = [
  "page_view",
  "click",
  "booking_step",
  "booking_step_progressed",
  "booking_step_backtracked",
  "booking_step_completed",
  "booking_step_blocked",
  "booking_step_abandoned",
  "booking_field_blur",
  "booking_selection_changed",
  "booking_submitted",
  "booking_checkout_started",
  "payment_order_created",
  "payment_approved",
  "payment_error",
  "booking_completed",
  "whatsapp_checkout_click",
  "sinpe_checkout_selected",
];

function sanitizeValue(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null) return null;

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        sanitizeValue(nestedValue),
      ])
    );
  }

  if (typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  return String(value);
}

async function safeAuthSession() {
  try {
    return await auth();
  } catch {
    return null;
  }
}

function anonymizeIp(rawIp: string | null): string | null {
  if (!rawIp) return null;

  if (rawIp.includes(".")) {
    const parts = rawIp.split(".");
    if (parts.length === 4) {
      parts[3] = "0";
      return parts.join(".");
    }
  }

  if (rawIp.includes(":")) {
    const parts = rawIp.split(":").filter(Boolean);
    return parts.slice(0, 3).join(":") + "::";
  }

  return null;
}

function parseDevice(userAgent: string) {
  const ua = userAgent.toLowerCase();
  const isMobile = /iphone|android|mobile|ipad|ipod/.test(ua);

  let browser = "unknown";
  if (ua.includes("edg/")) browser = "edge";
  else if (ua.includes("chrome/")) browser = "chrome";
  else if (ua.includes("safari/") && !ua.includes("chrome/")) browser = "safari";
  else if (ua.includes("firefox/")) browser = "firefox";

  let os = "unknown";
  if (ua.includes("windows")) os = "windows";
  else if (ua.includes("mac os")) os = "macos";
  else if (ua.includes("android")) os = "android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "ios";
  else if (ua.includes("linux")) os = "linux";

  return {
    browser,
    os,
    deviceType: isMobile ? "mobile" : "desktop",
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyticsEventInput;
    if (!body?.event || !VALID_EVENTS.includes(body.event)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const session = await safeAuthSession();
    const requestHeaders = await headers();

    const forwardedFor = requestHeaders.get("x-forwarded-for");
    const rawIp = forwardedFor?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || null;
    const anonymizedIp = anonymizeIp(rawIp);

    const userAgent = requestHeaders.get("user-agent") || "";
    const device = parseDevice(userAgent);

    const parsedHappenedAt = body.happenedAt ? new Date(body.happenedAt) : null;
    const happenedAt = parsedHappenedAt && !Number.isNaN(parsedHappenedAt.getTime())
      ? parsedHappenedAt
      : new Date();

    const db = await getDb();

    await db.collection(COLLECTIONS.ANALYTICS_EVENTS).insertOne({
      event: body.event,
      path: body.path ?? null,
      referrer: body.referrer ?? null,
      sessionId: body.sessionId ?? null,
      metadata: sanitizeValue(body.metadata ?? {}),
      happenedAt,
      user: {
        userId: (session?.user as { id?: string } | undefined)?.id ?? null,
        email: session?.user?.email ?? null,
        name: session?.user?.name ?? null,
      },
      request: {
        ipAnonymized: anonymizedIp,
        country: requestHeaders.get("x-vercel-ip-country") || null,
        region: requestHeaders.get("x-vercel-ip-country-region") || null,
        city: requestHeaders.get("x-vercel-ip-city") || null,
        ...device,
        userAgent,
      },
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("analytics events api error", error);
    return NextResponse.json({ error: "Failed to store analytics event" }, { status: 500 });
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function addCount(map: Map<string, number>, key: unknown) {
  if (typeof key !== "string" || !key) return;
  map.set(key, (map.get(key) ?? 0) + 1);
}

function topEntries(map: Map<string, number>, limit = 6) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedDays = Number(url.searchParams.get("days") ?? "7");
    const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const db = await getDb();
    const events = await db.collection<StoredAnalyticsEvent>(COLLECTIONS.ANALYTICS_EVENTS)
      .find(
        { happenedAt: { $gte: since } },
        { projection: { event: 1, path: 1, sessionId: 1, metadata: 1, happenedAt: 1, request: 1 } },
      )
      .sort({ happenedAt: -1 })
      .limit(10_000)
      .toArray();

    const eventCounts = new Map<string, number>();
    const pageCounts = new Map<string, number>();
    const deviceCounts = new Map<string, number>();
    const blockerCounts = new Map<string, number>();
    const paymentCounts = new Map<string, number>();
    const stepCounts = new Map<string, number>();
    const sessions = new Set<string>();
    let pageViews = 0;
    let clicks = 0;
    let blocked = 0;
    let abandoned = 0;
    let abandonedDurationTotal = 0;
    let abandonedDurationCount = 0;
    let progressions = 0;
    let backtracks = 0;
    let stepCompletions = 0;
    let checkoutStarted = 0;
    let paymentApproved = 0;
    let paymentErrors = 0;
    let bookingsCompleted = 0;

    for (const item of events) {
      addCount(eventCounts, item.event);
      if (item.sessionId) sessions.add(item.sessionId);
      if (item.path) addCount(pageCounts, item.path);
      if (item.request?.deviceType) addCount(deviceCounts, item.request.deviceType);

      if (item.event === "page_view") pageViews += 1;
      if (item.event === "click") clicks += 1;
      if (item.event === "booking_step") addCount(stepCounts, asRecord(item.metadata).step === undefined ? null : `step_${asRecord(item.metadata).step}`);
      if (item.event === "booking_step_progressed") progressions += 1;
      if (item.event === "booking_step_backtracked") backtracks += 1;
      if (item.event === "booking_step_completed") stepCompletions += 1;
      if (item.event === "booking_step_blocked") {
        blocked += 1;
        const missingKeys = asRecord(item.metadata).missingKeys;
        if (Array.isArray(missingKeys)) missingKeys.forEach((key) => addCount(blockerCounts, key));
      }
      if (item.event === "booking_step_abandoned") {
        abandoned += 1;
        const durationMs = asNumber(asRecord(item.metadata).durationMs);
        if (durationMs !== null) {
          abandonedDurationTotal += durationMs;
          abandonedDurationCount += 1;
        }
      }
      if (item.event === "booking_checkout_started") checkoutStarted += 1;
      if (item.event === "payment_approved") paymentApproved += 1;
      if (item.event === "payment_error") paymentErrors += 1;
      if (item.event === "booking_completed") bookingsCompleted += 1;
      if (item.event === "whatsapp_checkout_click") addCount(paymentCounts, "whatsapp");
      if (item.event === "sinpe_checkout_selected") addCount(paymentCounts, "sinpe");
      if (item.event === "payment_approved") addCount(paymentCounts, "paypal/card");
    }

    const safeRecentEvents = events.slice(0, 12).map((item) => ({
      event: item.event,
      path: item.path ?? null,
      happenedAt: item.happenedAt instanceof Date ? item.happenedAt.toISOString() : item.happenedAt ?? null,
    }));

    return NextResponse.json({
      range: { days, since: since.toISOString(), until: new Date().toISOString() },
      sampledEvents: events.length,
      site: {
        sessions: sessions.size,
        pageViews,
        clicks,
        topPages: topEntries(pageCounts),
        devices: topEntries(deviceCounts),
      },
      reservation: {
        stepViews: eventCounts.get("booking_step") ?? 0,
        progressions,
        backtracks,
        stepCompletions,
        blocked,
        abandoned,
        topSteps: topEntries(stepCounts),
      },
      friction: {
        blocked,
        abandoned,
        averageExitSeconds: abandonedDurationCount
          ? Math.round(abandonedDurationTotal / abandonedDurationCount / 1000)
          : 0,
        topMissingFields: topEntries(blockerCounts),
      },
      checkout: {
        started: checkoutStarted,
        orderCreated: eventCounts.get("payment_order_created") ?? 0,
        approved: paymentApproved,
        errors: paymentErrors,
        completed: bookingsCompleted,
        paymentMethods: topEntries(paymentCounts),
      },
      eventCounts: topEntries(eventCounts, 20),
      recentEvents: safeRecentEvents,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("analytics viewer api error", error);
    return NextResponse.json({ error: "Failed to load analytics viewer" }, { status: 500 });
  }
}
