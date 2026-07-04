import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getDb } from "@/lib/helpers/mongodb";
import type { MundialMatch, MundialStage } from "@/lib/mundial/fixtures";
import { readMundialMatches } from "@/lib/mundial/matches-store";
import { computePredictionPoints } from "@/lib/mundial/prediction-scoring";

export const dynamic = "force-dynamic";

const PREDICTIONS_COLLECTION = "mundial_predictions";

type WinnerPick = "home" | "away" | null;

type MundialMatchDoc = MundialMatch & {
  forceClosed?: boolean;
  actualWinner?: WinnerPick;
  homeFinalScore?: number;
  awayFinalScore?: number;
};

type PredictionDoc = {
  _id: ObjectId;
  matchId: string;
  playerName: string;
  normalizedName: string;
  homeScore?: number;
  awayScore?: number;
  mexicoScore?: number;
  southAfricaScore?: number;
  winnerPick?: WinnerPick;
  winnerPickMethod?: "extraTime" | "penalties" | null;
  updatedAt?: Date;
};

function kickoffTime(match: MundialMatchDoc) {
  const t = new Date(match.kickoffAt).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

function isMatchClosed(match: MundialMatchDoc, now: Date) {
  if (match.forceClosed) return true;
  return kickoffTime(match) <= now.getTime();
}

function predictionScores(doc: PredictionDoc) {
  if (typeof doc.homeScore === "number" && typeof doc.awayScore === "number") {
    return { homeScore: doc.homeScore, awayScore: doc.awayScore };
  }
  if (typeof doc.mexicoScore === "number" && typeof doc.southAfricaScore === "number") {
    return { homeScore: doc.mexicoScore, awayScore: doc.southAfricaScore };
  }
  return { homeScore: 0, awayScore: 0 };
}

function computePoints(
  match: { stage: MundialStage; homeFinalScore: number; awayFinalScore: number; actualWinner?: WinnerPick },
  prediction: { homeScore: number; awayScore: number; winnerPick?: WinnerPick; winnerPickMethod?: "extraTime" | "penalties" | null }
): number {
  return computePredictionPoints(match, prediction);
}

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const now = new Date();

    const [matches, predictions] = await Promise.all([
      readMundialMatches<MundialMatchDoc>(db),
      db.collection<PredictionDoc>(PREDICTIONS_COLLECTION).find({ normalizedName: name }).toArray(),
    ]);

    const matchesById = new Map(matches.map((m) => [m.id, m]));

    const details = predictions
      .map((pred) => {
        const match = matchesById.get(pred.matchId);
        if (!match) return null;

        const scores = predictionScores(pred);
        const closed = isMatchClosed(match, now);

        let points: number | null = null;
        let isExact = false;
        let correctOutcome = false;

        if (
          typeof match.homeFinalScore === "number" &&
          typeof match.awayFinalScore === "number"
        ) {
          points = computePoints(
            {
              stage: match.stage,
              homeFinalScore: match.homeFinalScore,
              awayFinalScore: match.awayFinalScore,
              actualWinner: match.actualWinner,
            },
            { homeScore: scores.homeScore, awayScore: scores.awayScore, winnerPick: pred.winnerPick, winnerPickMethod: pred.winnerPickMethod ?? null }
          );
          isExact = points >= 3;
          correctOutcome = points >= 1;
        }

        return {
          matchId: match.id,
          matchNumber: match.number,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          kickoffAt: match.kickoffAt,
          stage: match.stage,
          stageLabel: match.stageLabel,
          homeFinalScore: typeof match.homeFinalScore === "number" ? match.homeFinalScore : null,
          awayFinalScore: typeof match.awayFinalScore === "number" ? match.awayFinalScore : null,
          predictedHome: scores.homeScore,
          predictedAway: scores.awayScore,
          winnerPick: pred.winnerPick ?? null,
          points,
          isExact,
          correctOutcome,
          closed,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.matchNumber - b!.matchNumber);

    const playerName = predictions[0]?.playerName ?? name;

    return NextResponse.json({ playerName, predictions: details });
  } catch (error) {
    console.error("Failed to load player detail", error);
    return NextResponse.json({ error: "No se pudo cargar el detalle del jugador." }, { status: 500 });
  }
}
