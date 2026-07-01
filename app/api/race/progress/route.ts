import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongo";
import { updateProgress } from "../../../../lib/realtime/race";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { code, playerId, pct } = body;
  if (!code || !playerId || typeof pct !== "number") {
    return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  }
  const db = await getDb();
  await updateProgress(db, code.toUpperCase(), playerId, pct);
  return NextResponse.json({ ok: true });
}
