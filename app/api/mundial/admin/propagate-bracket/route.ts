import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/helpers/mongodb";
import { computeBracketUpdates, type MatchForBracket } from "@/lib/mundial/bracket";
import { notifyLiveMatchChanged } from "@/lib/mundial/live-match-events";

export const dynamic = "force-dynamic";

const MATCHES_COLLECTION = "mundial_matches";

const PROJECTION = {
  _id: 0,
  id: 1,
  stage: 1,
  group: 1,
  homeTeam: 1,
  awayTeam: 1,
  homeSeed: 1,
  awaySeed: 1,
  homeFinalScore: 1,
  awayFinalScore: 1,
  actualWinner: 1,
};

async function fetchMatches() {
  const db = await getDb();
  return {
    db,
    matches: await db
      .collection<MatchForBracket>(MATCHES_COLLECTION)
      .find({}, { projection: PROJECTION })
      .toArray(),
  };
}

// GET → dry run: shows pending updates without writing to DB
export async function GET() {
  try {
    const { matches } = await fetchMatches();
    const updates = computeBracketUpdates(matches);
    return NextResponse.json({ dryRun: true, pendingUpdates: updates.length, changes: updates });
  } catch (err) {
    console.error("propagate-bracket dry-run error:", err);
    return NextResponse.json({ ok: false, error: "Error al leer el bracket." }, { status: 500 });
  }
}

// POST → compute and apply bracket propagation, then notify live subscribers
export async function POST(req: NextRequest) {
  const notify = new URL(req.url).searchParams.get("notify") !== "false";

  try {
    const { db, matches } = await fetchMatches();
    const updates = computeBracketUpdates(matches);

    if (!updates.length) {
      return NextResponse.json({ ok: true, updated: 0, changes: [] });
    }

    const now = new Date();
    await db.collection(MATCHES_COLLECTION).bulkWrite(
      updates.map((u) => ({
        updateOne: {
          filter: { id: u.matchId },
          update: { $set: { [u.field]: u.to, updatedAt: now } },
        },
      })),
    );

    if (notify) notifyLiveMatchChanged();

    return NextResponse.json({ ok: true, updated: updates.length, changes: updates });
  } catch (err) {
    console.error("propagate-bracket error:", err);
    return NextResponse.json(
      { ok: false, error: "Error al propagar el bracket." },
      { status: 500 },
    );
  }
}
