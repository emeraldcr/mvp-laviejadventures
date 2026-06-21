import type { Db } from "mongodb";
import { computeBracketUpdates, type MatchForBracket } from "./bracket";
import { notifyLiveMatchChanged } from "./live-match-events";

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

// Reads all matches, computes which bracket slots can now be resolved,
// writes the updates, and fires an SSE notification.
// Safe to call fire-and-forget (errors are caught and logged).
export async function applyBracketPropagation(db: Db): Promise<void> {
  const matches = await db
    .collection<MatchForBracket>(MATCHES_COLLECTION)
    .find({}, { projection: PROJECTION })
    .toArray();

  const updates = computeBracketUpdates(matches);
  if (!updates.length) return;

  const now = new Date();
  await db.collection(MATCHES_COLLECTION).bulkWrite(
    updates.map((u) => ({
      updateOne: {
        filter: { id: u.matchId },
        update: { $set: { [u.field]: u.to, updatedAt: now } },
      },
    })),
  );

  notifyLiveMatchChanged();
}
