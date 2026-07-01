import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongo";
import { finishPlayer, serializeRoom } from "../../../../lib/realtime/race";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { code, playerId } = body;
  if (!code || !playerId) return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  const db = await getDb();
  const room = await finishPlayer(db, code.toUpperCase(), playerId);
  return NextResponse.json({ ok: true, room: serializeRoom(room) });
}
