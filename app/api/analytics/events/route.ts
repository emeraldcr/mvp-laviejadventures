import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { headers } from "next/headers";

type AnalyticsEventName = "page_view" | "click" | "booking_step" | "booking_submitted";

type AnalyticsEventInput = {
  event?: AnalyticsEventName;
  path?: string;
  referrer?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  happenedAt?: string;
};

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
    if (!body?.event) {
      return NextResponse.json({ error: "Missing event" }, { status: 400 });
    }

    const session = await auth();
    const requestHeaders = await headers();

    const forwardedFor = requestHeaders.get("x-forwarded-for");
    const rawIp = forwardedFor?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || null;
    const anonymizedIp = anonymizeIp(rawIp);

    const userAgent = requestHeaders.get("user-agent") || "";
    const device = parseDevice(userAgent);

    const db = await getDb();

    await db.collection("analytics_events").insertOne({
      event: body.event,
      path: body.path ?? null,
      referrer: body.referrer ?? null,
      sessionId: body.sessionId ?? null,
      metadata: body.metadata ?? {},
      happenedAt: body.happenedAt ? new Date(body.happenedAt) : new Date(),
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
