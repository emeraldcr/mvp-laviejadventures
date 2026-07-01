import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongo";
import { joinRoom, serializeRoom } from "../../../../lib/realtime/race";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { code, playerId, name } = body;
  if (!code || !playerId || !name) return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  const db = await getDb();
  const result = await joinRoom(db, code.toUpperCase().trim(), playerId, name);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, room: serializeRoom(result.room!) });
}
