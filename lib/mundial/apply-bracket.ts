import type { Db } from "mongodb";
import { computeBracketUpdates, type MatchForBracket } from "./bracket";
import { notifyLiveMatchChanged } from "./live-match-events";
import { getMundialMatchCollectionForWrite, readMundialMatches } from "./matches-store";

// Reads all matches, computes which bracket slots can now be resolved,
// writes the updates, and fires an SSE notification.
// Safe to call fire-and-forget (errors are caught and logged).
export async function applyBracketPropagation(db: Db): Promise<void> {
  const matches = (await readMundialMatches<MatchForBracket>(db)).map((match) => {
    const projected: MatchForBracket = {
      id: match.id,
      stage: match.stage,
      group: match.group,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeSeed: match.homeSeed,
      awaySeed: match.awaySeed,
      homeFinalScore: match.homeFinalScore,
      awayFinalScore: match.awayFinalScore,
      actualWinner: match.actualWinner,
    };
    return projected;
  });

  const updates = computeBracketUpdates(matches);
  if (!updates.length) return;

  const now = new Date();
  await Promise.all(
    updates.map(async (u) => {
      const collection = await getMundialMatchCollectionForWrite(db, u.matchId);
      await collection.updateOne(
        { id: u.matchId },
        { $set: { [u.field]: u.to, updatedAt: now } },
      );
    })
  );

  notifyLiveMatchChanged();
}
