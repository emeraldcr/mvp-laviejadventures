import type { Collection, CreateIndexesOptions, Db, Document } from "mongodb";

import { MUNDIAL_MATCHES, MUNDIAL_TOTAL_MATCHES, type MundialMatch } from "./fixtures";

export const MUNDIAL_MATCHES_COLLECTION = "mundial_matches";
export const MUNDIAL_PREDICTIONS_COLLECTION = "mundial_predictions";
export const MUNDIAL_FIXTURE_VERSION = "2026-07-02-group-stage-results";

type StoredMundialMatch = MundialMatch & {
  source?: string;
  sourceVersion?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

async function safeCreateIndex<TSchema extends Document>(
  collection: Collection<TSchema>,
  keys: Record<string, 1 | -1>,
  options?: CreateIndexesOptions
) {
  try {
    await collection.createIndex(keys, options ?? {});
  } catch {
    // Index may already exist with different options; non-fatal
  }
}

export async function ensureMundialData(db: Db) {
  const matches = db.collection<StoredMundialMatch>(MUNDIAL_MATCHES_COLLECTION);
  const predictions = db.collection(MUNDIAL_PREDICTIONS_COLLECTION);
  const seededCount = await matches.countDocuments({ sourceVersion: MUNDIAL_FIXTURE_VERSION });

  await Promise.all([
    safeCreateIndex(matches, { id: 1 }, { unique: true }),
    safeCreateIndex(matches, { sortOrder: 1 }),
    safeCreateIndex(predictions, { matchId: 1, normalizedName: 1 }, { unique: true }),
    safeCreateIndex(predictions, { normalizedName: 1, updatedAt: -1 }),
  ]);

  if (seededCount === MUNDIAL_TOTAL_MATCHES) return;

  const now = new Date();

  await matches.bulkWrite(
    MUNDIAL_MATCHES.map((match) => {
      const { homeFinalScore, awayFinalScore, actualWinner, ...fixtureData } = match;
      const scorePatch =
        typeof homeFinalScore === "number" && typeof awayFinalScore === "number"
          ? { homeFinalScore, awayFinalScore, actualWinner: actualWinner ?? null }
          : {};

      return {
        updateOne: {
          filter: { id: match.id },
          update: {
            $set: {
              ...fixtureData,
              ...scorePatch,
              source: "fifa-world-cup-2026",
              sourceVersion: MUNDIAL_FIXTURE_VERSION,
              updatedAt: now,
            },
            $setOnInsert: {
              createdAt: now,
            },
          },
          upsert: true,
        },
      };
    }),
    { ordered: false }
  );
}

export async function readMundialMatches<T extends StoredMundialMatch = StoredMundialMatch>(db: Db) {
  await ensureMundialData(db);
  return db.collection<T>(MUNDIAL_MATCHES_COLLECTION).find({}).sort({ sortOrder: 1 }).toArray();
}
