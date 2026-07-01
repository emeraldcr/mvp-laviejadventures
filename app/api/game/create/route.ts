import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/mongo";
import { createGame, serializeGame } from "../../../../lib/realtime/game";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const totalSegments = typeof body.totalSegments === "number" ? body.totalSegments : 10;
  const db = await getDb();
  const id = await createGame(db, totalSegments);
  const state = await db.collection("ghost_game_state").findOne({ _id: id } as any);
  return NextResponse.json({ ok: true, id, state: serializeGame(state) });
}
