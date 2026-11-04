import { NextRequest, NextResponse } from "next/server";
import { allowRequest } from "@/lib/security/rate-limit";
import { safeJson } from "@/lib/security/validation";

const MAX_BODY = 32 * 1024;

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const writes = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  const nextAuth = path.startsWith("/api/auth/") && !["/api/auth/register", "/api/auth/recover-password", "/api/auth/reset-password"].includes(path);
  const expensive = path === "/api/ai/hero-slogan" || path === "/api/tiempo/mensaje";
  const reject = (status: number, error: string) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "60" } : {}) } });

  // Auth.js handles its own OAuth/CSRF protocol. Never interrupt provider callbacks.
  if (writes && !nextAuth) {
    const origin = request.headers.get("origin");
    const configured = process.env.APP_BASE_URL || process.env.AUTH_URL || request.url;
    const trustedOrigins = new Set([new URL(configured).origin]);
    if (process.env.VERCEL_URL) trustedOrigins.add(`https://${process.env.VERCEL_URL}`);
    if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && !trustedOrigins.has(origin))) {
      return reject(403, "Cross-origin request denied");
    }
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return reject(415, "JSON content type required");
    if (Number(request.headers.get("content-length")) > MAX_BODY) return reject(413, "Request body too large");
    // Check streamed bytes too; Content-Length is not an authorization boundary.
    const reader = request.clone().body?.getReader();
    if (!reader) return reject(400, "Request body required");
    let size = 0;
    let text = "";
    const decoder = new TextDecoder();
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > MAX_BODY) { void reader.cancel(); return reject(413, "Request body too large"); }
        text += decoder.decode(chunk.value, { stream: true });
      }
      text += decoder.decode();
      const body: unknown = JSON.parse(text);
      if (!body || typeof body !== "object" || Array.isArray(body) || !safeJson(body)) return reject(400, "Invalid request body");
    } catch { return reject(400, "Invalid JSON body"); }
  }
  if ((writes && (!nextAuth || path === "/api/auth/callback/credentials")) || expensive || path === "/api/reservation/draft") {
    try {
      // Only use Vercel's overwritten forwarding header on Vercel. Other hosts
      // deliberately share one bucket until a trusted ingress is configured.
      const ip = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown" : "shared";
      const limit = expensive ? 10 : path.startsWith("/api/auth/") ? 10 : path === "/api/analytics/events" ? 120 : 60;
      if (!await allowRequest(`${path}:${ip}`, limit)) return reject(429, "Too many requests. Please try again shortly.");
      if (expensive && !await allowRequest("ai:global", 100, 3_600_000)) return reject(429, "AI request budget reached");
    } catch { return reject(503, "Service temporarily unavailable"); }
  }
  const response = NextResponse.next();
  if (path.startsWith("/api/auth/") || path.startsWith("/api/user/") || path.startsWith("/api/bookings") || path.startsWith("/api/paypal/") || path.startsWith("/api/reservation/draft")) response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = { matcher: "/api/:path*" };
