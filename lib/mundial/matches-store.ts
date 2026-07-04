import { createHash } from "node:crypto";
import type { Collection, CreateIndexesOptions, Db, Document } from "mongodb";

import { MUNDIAL_MATCHES, MUNDIAL_TOTAL_MATCHES, type MundialMatch, type MundialStage } from "./fixtures";

export const MUNDIAL_MATCHES_COLLECTION = "mundial_matches";
export const MUNDIAL_KNOCKOUT_MATCHES_COLLECTION = "mundial_knockout_matches";
export const MUNDIAL_PREDICTIONS_COLLECTION = "mundial_predictions";

export const CENTRALIZED_KNOCKOUT_STAGES = new Set<MundialStage>([
  "round32",
  "round16",
  "quarterfinal",
]);

// Only the fields that define a fixture's identity/schedule/result. Live and
// admin-only fields (liveStatus, liveScore, ...) are intentionally excluded so
// editing them in Mongo does not trigger a re-seed, and re-seeding never wipes
// them.
function fixtureFingerprint(matches: readonly MundialMatch[]): string {
  const stable = matches
    .map((m) => [
      m.number,
      m.stage,
      m.date,
      m.kickoffAt,
      m.venue,
      m.homeTeam,
      m.awayTeam,
      m.homeSeed ?? "",
      m.awaySeed ?? "",
      m.homeFinalScore ?? "",
      m.awayFinalScore ?? "",
      m.actualWinner ?? "",
    ].join("|"))
    .sort()
    .join("\n");
  return createHash("sha1").update(stable).digest("hex").slice(0, 12);
}

// Versions are derived from the fixture content, so ANY edit to fixtures.ts
// (teams, kickoff times, dates, scores) changes the hash and forces Mongo to
// re-sync from the file on the next read. fixtures.ts is the single source of
// truth — no manual version bump needed.
export const MUNDIAL_FIXTURE_VERSION = `fixtures-${fixtureFingerprint(MUNDIAL_MATCHES)}`;
export const MUNDIAL_KNOCKOUT_FIXTURE_VERSION = `knockouts-${fixtureFingerprint(
  MUNDIAL_MATCHES.filter((match) => CENTRALIZED_KNOCKOUT_STAGES.has(match.stage))
)}`;

type StoredMundialMatch = MundialMatch & {
  source?: string;
  sourceVersion?: string;
  forceClosed?: boolean;
  liveStatus?: "scheduled" | "live" | "halftime" | "fulltime";
  liveMinute?: number | null;
  liveMinuteUpdatedAt?: Date | string | null;
  homeLiveScore?: number | null;
  awayLiveScore?: number | null;
  liveNote?: string;
  liveEvents?: unknown[];
  liveStats?: unknown;
  liveUpdatedAt?: Date | string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type StoredMundialMatchDoc = StoredMundialMatch;

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

export async function ensureCentralizedKnockoutMatches(db: Db) {
  const matches = db.collection<StoredMundialMatch>(MUNDIAL_KNOCKOUT_MATCHES_COLLECTION);
  const centralizedFixtures = MUNDIAL_MATCHES.filter((match) => CENTRALIZED_KNOCKOUT_STAGES.has(match.stage));
  const seededCount = await matches.countDocuments({ sourceVersion: MUNDIAL_KNOCKOUT_FIXTURE_VERSION });

  await Promise.all([
    safeCreateIndex(matches, { id: 1 }, { unique: true }),
    safeCreateIndex(matches, { stage: 1, sortOrder: 1 }),
    safeCreateIndex(matches, { sortOrder: 1 }),
    safeCreateIndex(matches, { liveStatus: 1, liveUpdatedAt: -1 }),
  ]);

  if (seededCount === centralizedFixtures.length) return;

  const now = new Date();

  await matches.bulkWrite(
    centralizedFixtures.map((match) => {
      const { homeFinalScore, awayFinalScore, actualWinner, ...fixtureData } = match;
      const scorePatch =
        typeof homeFinalScore === "number" && typeof awayFinalScore === "number"
          ? { homeFinalScore, awayFinalScore, actualWinner: actualWinner ?? null, forceClosed: true }
          : {};

      return {
        updateOne: {
          filter: { id: match.id },
          update: {
            $set: {
              ...fixtureData,
              ...scorePatch,
              source: "fifa-world-cup-2026-centralized-knockout",
              sourceVersion: MUNDIAL_KNOCKOUT_FIXTURE_VERSION,
              updatedAt: now,
            },
            $setOnInsert: {
              liveStatus: "scheduled",
              liveMinute: null,
              homeLiveScore: null,
              awayLiveScore: null,
              liveNote: "",
              liveEvents: [],
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

export async function readMundialMatches<T = StoredMundialMatch>(db: Db) {
  await ensureMundialData(db);
  await ensureCentralizedKnockoutMatches(db);

  const [baseMatches, centralizedKnockouts] = await Promise.all([
    db.collection<StoredMundialMatch>(MUNDIAL_MATCHES_COLLECTION).find({}).sort({ sortOrder: 1 }).toArray(),
    db.collection<StoredMundialMatch>(MUNDIAL_KNOCKOUT_MATCHES_COLLECTION).find({}).sort({ sortOrder: 1 }).toArray(),
  ]);

  const centralizedById = new Map(centralizedKnockouts.map((match) => [match.id, match]));
  const merged = baseMatches
    .filter((match) => !CENTRALIZED_KNOCKOUT_STAGES.has(match.stage) || !centralizedById.has(match.id))
    .concat(centralizedKnockouts)
    .sort((a, b) => (a.sortOrder ?? a.number) - (b.sortOrder ?? b.number));

  return merged as unknown as T[];
}

export async function getMundialMatchCollectionForWrite(db: Db, matchId: string) {
  await ensureCentralizedKnockoutMatches(db);

  const centralized = await db
    .collection<StoredMundialMatch>(MUNDIAL_KNOCKOUT_MATCHES_COLLECTION)
    .findOne({ id: matchId }, { projection: { id: 1 } });

  return centralized
    ? db.collection(MUNDIAL_KNOCKOUT_MATCHES_COLLECTION)
    : db.collection(MUNDIAL_MATCHES_COLLECTION);
}

export async function readLiveMundialMatch(db: Db) {
  await ensureCentralizedKnockoutMatches(db);

  const projection = {
    _id: 0,
    id: 1,
    sortOrder: 1,
    homeTeam: 1,
    awayTeam: 1,
    homeFinalScore: 1,
    awayFinalScore: 1,
    homeLiveScore: 1,
    awayLiveScore: 1,
    liveMinute: 1,
    liveMinuteUpdatedAt: 1,
    liveStatus: 1,
    liveNote: 1,
    liveEvents: 1,
    liveStats: 1,
    liveUpdatedAt: 1,
  };

  const collections = [
    db.collection<StoredMundialMatch>(MUNDIAL_KNOCKOUT_MATCHES_COLLECTION),
    db.collection<StoredMundialMatch>(MUNDIAL_MATCHES_COLLECTION),
  ];

  const liveDocs = await Promise.all(
    collections.map((collection) =>
      collection.findOne(
        { liveStatus: { $in: ["live", "halftime"] } },
        { sort: { liveUpdatedAt: -1, sortOrder: -1 }, projection }
      )
    )
  );

  const liveDoc = liveDocs
    .filter(Boolean)
    .sort((a, b) => liveUpdatedTime(b) - liveUpdatedTime(a))[0];

  if (liveDoc) return liveDoc;

  const fulltimeCutoff = new Date(Date.now() - 2 * 60_000);
  const fulltimeDocs = await Promise.all(
    collections.map((collection) =>
      collection.findOne(
        { liveStatus: "fulltime", liveUpdatedAt: { $gte: fulltimeCutoff } },
        { sort: { liveUpdatedAt: -1, sortOrder: -1 }, projection }
      )
    )
  );

  return fulltimeDocs
    .filter(Boolean)
    .sort((a, b) => liveUpdatedTime(b) - liveUpdatedTime(a))[0] ?? null;
}

function liveUpdatedTime(match: StoredMundialMatch | null) {
  if (!match?.liveUpdatedAt) return 0;
  const time = new Date(match.liveUpdatedAt).getTime();
  return Number.isFinite(time) ? time : 0;
}
