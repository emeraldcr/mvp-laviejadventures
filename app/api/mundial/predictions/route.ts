import { NextRequest, NextResponse } from "next/server";
import { Db, ObjectId } from "mongodb";

import { getDb } from "@/lib/helpers/mongodb";
import { MUNDIAL_MATCHES, MUNDIAL_TOTAL_MATCHES, type MundialMatch } from "@/lib/mundial/fixtures";

export const dynamic = "force-dynamic";

const MATCHES_COLLECTION = "mundial_matches";
const PREDICTIONS_COLLECTION = "mundial_predictions";
const FIXTURE_VERSION = "2026-06-13";
const LEGACY_MATCH_ID = "mexico-sudafrica-2026-06-11-13";
const MAX_SCORE = 30;

type WinnerPick = "home" | "away" | null;

type MundialMatchDoc = MundialMatch & {
  source: string;
  sourceVersion: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type PredictionDoc = {
  _id: ObjectId;
  matchId: string;
  matchNumber?: number;
  matchLabel?: string;
  matchTime?: string;
  stage?: string;
  playerName: string;
  normalizedName: string;
  homeScore?: number;
  awayScore?: number;
  mexicoScore?: number;
  southAfricaScore?: number;
  winnerPick?: WinnerPick;
  locked?: boolean;
  lockedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type PredictionPayload = {
  matchId: unknown;
  playerName?: unknown;
  homeScore?: unknown;
  awayScore?: unknown;
  winnerPick?: unknown;
  locked?: unknown;
};

class ApiError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

function normalizeName(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeKey(value: string) {
  return value.trim().toUpperCase();
}

function parseScore(value: unknown) {
  const score = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    return null;
  }

  return score;
}

function parseWinnerPick(value: unknown): WinnerPick {
  if (value === "home" || value === "away") return value;
  return null;
}

function toIsoString(value: unknown) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function serializeMatch(doc: MundialMatchDoc | MundialMatch) {
  return {
    id: doc.id,
    number: doc.number,
    stage: doc.stage,
    stageLabel: doc.stageLabel,
    group: doc.group ?? null,
    date: doc.date,
    venue: doc.venue,
    homeTeam: doc.homeTeam,
    awayTeam: doc.awayTeam,
    homeSeed: doc.homeSeed ?? null,
    awaySeed: doc.awaySeed ?? null,
    sortOrder: doc.sortOrder,
  };
}

function predictionScores(doc: PredictionDoc) {
  if (typeof doc.homeScore === "number" && typeof doc.awayScore === "number") {
    return {
      homeScore: doc.homeScore,
      awayScore: doc.awayScore,
    };
  }

  if (
    doc.matchId === LEGACY_MATCH_ID &&
    typeof doc.mexicoScore === "number" &&
    typeof doc.southAfricaScore === "number"
  ) {
    return {
      homeScore: doc.mexicoScore,
      awayScore: doc.southAfricaScore,
    };
  }

  return {
    homeScore: 0,
    awayScore: 0,
  };
}

function serializePrediction(doc: PredictionDoc) {
  const scores = predictionScores(doc);

  return {
    id: doc._id.toString(),
    matchId: doc.matchId,
    matchNumber: doc.matchNumber ?? null,
    playerName: doc.playerName,
    homeScore: scores.homeScore,
    awayScore: scores.awayScore,
    winnerPick: doc.winnerPick ?? null,
    locked: Boolean(doc.locked),
    lockedAt: toIsoString(doc.lockedAt),
    createdAt: toIsoString(doc.createdAt),
    updatedAt: toIsoString(doc.updatedAt),
  };
}

function serializePlayer(player: {
  _id: string;
  playerName?: string;
  totalPredictions?: number;
  lockedPredictions?: number;
  updatedAt?: Date;
}) {
  return {
    key: player._id,
    playerName: player.playerName ?? player._id,
    totalPredictions: player.totalPredictions ?? 0,
    lockedPredictions: player.lockedPredictions ?? 0,
    updatedAt: toIsoString(player.updatedAt),
  };
}

async function ensureMundialData(db: Db) {
  const matches = db.collection<MundialMatchDoc>(MATCHES_COLLECTION);
  const predictions = db.collection<PredictionDoc>(PREDICTIONS_COLLECTION);
  const seededCount = await matches.countDocuments({ sourceVersion: FIXTURE_VERSION });

  await Promise.all([
    matches.createIndex({ id: 1 }, { unique: true }),
    matches.createIndex({ sortOrder: 1 }),
    predictions.createIndex({ matchId: 1, normalizedName: 1 }, { unique: true }),
    predictions.createIndex({ normalizedName: 1, updatedAt: -1 }),
  ]);

  if (seededCount === MUNDIAL_TOTAL_MATCHES) {
    return;
  }

  const now = new Date();

  await matches.bulkWrite(
    MUNDIAL_MATCHES.map((match) => ({
      updateOne: {
        filter: { id: match.id },
        update: {
          $set: {
            ...match,
            source: "fifa-world-cup-2026",
            sourceVersion: FIXTURE_VERSION,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        upsert: true,
      },
    })),
    { ordered: false }
  );
}

async function readMatches(db: Db) {
  await ensureMundialData(db);

  return db
    .collection<MundialMatchDoc>(MATCHES_COLLECTION)
    .find({})
    .sort({ sortOrder: 1 })
    .toArray();
}

async function readPlayers(db: Db) {
  return db
    .collection<PredictionDoc>(PREDICTIONS_COLLECTION)
    .aggregate<{
      _id: string;
      playerName: string;
      totalPredictions: number;
      lockedPredictions: number;
      updatedAt?: Date;
    }>([
      {
        $group: {
          _id: "$normalizedName",
          playerName: { $last: "$playerName" },
          totalPredictions: { $sum: 1 },
          lockedPredictions: {
            $sum: {
              $cond: ["$locked", 1, 0],
            },
          },
          updatedAt: { $max: "$updatedAt" },
        },
      },
      { $sort: { updatedAt: -1, playerName: 1 } },
    ])
    .toArray();
}

async function savePrediction(db: Db, payload: PredictionPayload, fallbackPlayerName: string) {
  const matchesById = new Map(MUNDIAL_MATCHES.map((match) => [match.id, match]));
  const matchId = String(payload.matchId ?? "").trim();
  const match = matchesById.get(matchId);
  const playerName = normalizeName(payload.playerName ?? fallbackPlayerName);
  const normalizedName = normalizeKey(playerName);
  const homeScore = parseScore(payload.homeScore);
  const awayScore = parseScore(payload.awayScore);
  const winnerPick = parseWinnerPick(payload.winnerPick);
  const locked = Boolean(payload.locked);

  if (!match) {
    throw new ApiError("Partido invalido.");
  }

  if (!playerName || homeScore === null || awayScore === null) {
    throw new ApiError("Faltan datos para guardar la prediccion.");
  }

  if (match.stage !== "group" && locked && homeScore === awayScore && !winnerPick) {
    throw new ApiError("Elegis quien pasa antes de bloquear una llave empatada.");
  }

  const predictions = db.collection<PredictionDoc>(PREDICTIONS_COLLECTION);
  const existing = await predictions.findOne({ matchId, normalizedName });
  const currentScores = existing ? predictionScores(existing) : null;
  const changesLockedScore =
    Boolean(existing?.locked) &&
    (currentScores?.homeScore !== homeScore ||
      currentScores?.awayScore !== awayScore ||
      (existing?.winnerPick ?? null) !== winnerPick);

  if (changesLockedScore) {
    throw new ApiError("Ese resultado esta bloqueado. Desbloquealo antes de editar.", 423);
  }

  const now = new Date();
  const saved = await predictions.findOneAndUpdate(
    {
      matchId,
      normalizedName,
    },
    {
      $set: {
        matchId,
        matchNumber: match.number,
        matchLabel: `${match.homeTeam} vs ${match.awayTeam}`,
        stage: match.stage,
        playerName,
        normalizedName,
        homeScore,
        awayScore,
        winnerPick,
        locked,
        lockedAt: locked ? now : null,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
      $unset: {
        mexicoScore: "",
        southAfricaScore: "",
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );

  if (!saved) {
    throw new ApiError("No se pudo guardar la prediccion.", 500);
  }

  return saved;
}

export async function GET(req: NextRequest) {
  try {
    const playerName = normalizeName(req.nextUrl.searchParams.get("playerName"));
    const db = await getDb();
    const matches = await readMatches(db);
    const predictions = db.collection<PredictionDoc>(PREDICTIONS_COLLECTION);
    const predictionFilter = playerName ? { normalizedName: normalizeKey(playerName) } : {};
    const [predictionDocs, players] = await Promise.all([
      predictions.find(predictionFilter).sort({ updatedAt: -1, playerName: 1 }).toArray(),
      readPlayers(db),
    ]);

    return NextResponse.json({
      fixtureVersion: FIXTURE_VERSION,
      matches: matches.map(serializeMatch),
      predictions: predictionDocs.map(serializePrediction),
      players: players.map(serializePlayer),
    });
  } catch (error) {
    console.error("Failed to load mundial predictions", error);
    return NextResponse.json({ error: "No se pudo cargar la quiniela." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDb();
    await ensureMundialData(db);

    const fallbackPlayerName = normalizeName(body.playerName);
    const payloads: PredictionPayload[] = Array.isArray(body.predictions)
      ? body.predictions.map((prediction: PredictionPayload) => ({
          ...prediction,
          playerName: prediction.playerName ?? fallbackPlayerName,
        }))
      : [body];

    if (!payloads.length) {
      throw new ApiError("No hay predicciones para guardar.");
    }

    const saved = [];

    for (const payload of payloads) {
      saved.push(await savePrediction(db, payload, fallbackPlayerName));
    }

    return NextResponse.json(
      {
        predictions: saved.map(serializePrediction),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save mundial prediction", error);

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "No se pudo guardar la prediccion." }, { status: 500 });
  }
}
