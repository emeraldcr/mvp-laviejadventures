import { NextRequest, NextResponse } from "next/server";
import { bridgeEnabled, phoneAction, phoneActions, readPhone, type PhoneAction, type PhoneView } from "@/lib/phone-bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unavailable() {
  return NextResponse.json({ error: "Local phone bridge is disabled" }, { status: 403 });
}

export async function GET(request: NextRequest) {
  if (!bridgeEnabled()) return unavailable();
  const view = (request.nextUrl.searchParams.get("view") || "report") as PhoneView;
  if (!(["summary", "report", "features"] as const).includes(view)) {
    return NextResponse.json({ error: "Unsupported view" }, { status: 400 });
  }
  try {
    return NextResponse.json({ ok: true, data: await readPhone(view) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Phone unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!bridgeEnabled()) return unavailable();
  try {
    const body = (await request.json()) as { action?: string; value?: string };
    if (!body.action || !phoneActions.includes(body.action as PhoneAction)) {
      return NextResponse.json({ error: "Action is not allowed" }, { status: 400 });
    }
    const result = await phoneAction(body.action as PhoneAction, body.value);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Action failed" }, { status: 400 });
  }
}
