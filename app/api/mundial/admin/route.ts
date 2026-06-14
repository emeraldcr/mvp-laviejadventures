import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getDb } from "@/lib/helpers/mongodb";
import type { MundialMatch, MundialStage } from "@/lib/mundial/fixtures";

export const dynamic = "force-dynamic";

const MATCHES_COLLECTION = "mundial_matches";
const PREDICTIONS_COLLECTION = "mundial_predictions";
const STAT_QUESTIONS_COLLECTION = "mundial_stat_questions";
const STAT_BETS_COLLECTION = "mundial_stat_bets";

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
  stage?: string;
  updatedAt?: Date;
};

type StatQuestionDoc = {
  _id: ObjectId;
  id: string;
  matchId: string;
  matchNumber: number;
  matchLabel: string;
  text: string;
  options: Array<{ id: string; label: string }>;
  correctOptionId: string | null;
  pointValue: number;
  resolvedAt: Date | null;
  createdAt: Date;
};

type StatBetDoc = {
  questionId: string;
  normalizedName: string;
  optionId: string;
};

function kickoffTime(match: MundialMatchDoc | MundialMatch) {
  const t = new Date(match.kickoffAt).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

function isMatchClosed(match: MundialMatchDoc | MundialMatch, now: Date) {
  if ((match as MundialMatchDoc).forceClosed) return true;
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
  prediction: { homeScore: number; awayScore: number; winnerPick?: WinnerPick }
): number {
  const { homeFinalScore, awayFinalScore, actualWinner, stage } = match;
  const { homeScore, awayScore, winnerPick } = prediction;

  const isExact = homeScore === homeFinalScore && awayScore === awayFinalScore;
  const actualOutcome =
    homeFinalScore > awayFinalScore ? "home" : awayFinalScore > homeFinalScore ? "away" : "draw";
  const predictedOutcome =
    homeScore > awayScore ? "home" : awayScore > homeScore ? "away" : "draw";
  const correctOutcome = actualOutcome === predictedOutcome;
  const isDrawInKnockout = actualOutcome === "draw" && stage !== "group";
  const correctWinner = isDrawInKnockout && actualWinner != null && winnerPick === actualWinner;

  if (isExact && correctWinner) return 4;
  if (isExact) return 3;
  if (correctOutcome && correctWinner) return 2;
  if (correctOutcome) return 1;
  return 0;
}

export async function GET() {
  try {
    const db = await getDb();
    const now = new Date();

    const [matches, predictions, statQuestions, statBets] = await Promise.all([
      db.collection<MundialMatchDoc>(MATCHES_COLLECTION).find({}).sort({ sortOrder: 1 }).toArray(),
      db.collection<PredictionDoc>(PREDICTIONS_COLLECTION).find({}).toArray(),
      db.collection<StatQuestionDoc>(STAT_QUESTIONS_COLLECTION).find({}).sort({ createdAt: 1 }).toArray(),
      db.collection<StatBetDoc>(STAT_BETS_COLLECTION).find({}).toArray(),
    ]);

    const matchesById = new Map(matches.map((m) => [m.id, m]));

    type MatchStat = {
      total: number;
      exactCount: number;
      correctOutcomeCount: number;
      homeWinPicks: number;
      drawPicks: number;
      awayWinPicks: number;
    };

    // Compute leaderboard + per-match prediction stats in one pass
    const playerMap = new Map<
      string,
      {
        playerName: string;
        normalizedName: string;
        predictionPoints: number;
        statPoints: number;
        totalPoints: number;
        totalPredictions: number;
        scoredPredictions: number;
        exactScores: number;
        correctOutcomes: number;
      }
    >();

    const matchStatMap = new Map<string, MatchStat>();

    for (const prediction of predictions) {
      const match = matchesById.get(prediction.matchId);
      const key = prediction.normalizedName;

      if (!playerMap.has(key)) {
        playerMap.set(key, {
          playerName: prediction.playerName,
          normalizedName: key,
          predictionPoints: 0,
          statPoints: 0,
          totalPoints: 0,
          totalPredictions: 0,
          scoredPredictions: 0,
          exactScores: 0,
          correctOutcomes: 0,
        });
      }

      const entry = playerMap.get(key)!;
      entry.totalPredictions++;

      // Per-match stats
      if (!matchStatMap.has(prediction.matchId)) {
        matchStatMap.set(prediction.matchId, {
          total: 0,
          exactCount: 0,
          correctOutcomeCount: 0,
          homeWinPicks: 0,
          drawPicks: 0,
          awayWinPicks: 0,
        });
      }
      const ms = matchStatMap.get(prediction.matchId)!;
      ms.total++;

      const scores = predictionScores(prediction);
      if (scores.homeScore > scores.awayScore) ms.homeWinPicks++;
      else if (scores.homeScore < scores.awayScore) ms.awayWinPicks++;
      else ms.drawPicks++;

      if (
        match &&
        typeof match.homeFinalScore === "number" &&
        typeof match.awayFinalScore === "number"
      ) {
        const pts = computePoints(
          {
            stage: match.stage,
            homeFinalScore: match.homeFinalScore,
            awayFinalScore: match.awayFinalScore,
            actualWinner: match.actualWinner,
          },
          { homeScore: scores.homeScore, awayScore: scores.awayScore, winnerPick: prediction.winnerPick }
        );
        entry.scoredPredictions++;
        entry.predictionPoints += pts;
        if (pts >= 3) { entry.exactScores++; ms.exactCount++; }
        if (pts >= 1) { entry.correctOutcomes++; ms.correctOutcomeCount++; }
      }
    }

    // Add stat bet points
    for (const bet of statBets) {
      const question = statQuestions.find((q) => q.id === bet.questionId);
      if (!question?.correctOptionId || bet.optionId !== question.correctOptionId) continue;
      const entry = playerMap.get(bet.normalizedName);
      if (entry) entry.statPoints += question.pointValue ?? 1;
    }

    for (const entry of playerMap.values()) {
      entry.totalPoints = entry.predictionPoints + entry.statPoints;
    }

    const leaderboard = [...playerMap.values()].sort(
      (a, b) => b.totalPoints - a.totalPoints || a.playerName.localeCompare(b.playerName)
    );

    // Format matches for admin view
    const emptyMatchStat: MatchStat = {
      total: 0, exactCount: 0, correctOutcomeCount: 0,
      homeWinPicks: 0, drawPicks: 0, awayWinPicks: 0,
    };
    const adminMatches = matches.map((match) => {
      const ms = matchStatMap.get(match.id) ?? emptyMatchStat;
      return {
        id: match.id,
        number: match.number,
        stage: match.stage,
        stageLabel: match.stageLabel,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        kickoffAt: match.kickoffAt,
        venue: match.venue,
        group: match.group ?? null,
        homeFinalScore: typeof match.homeFinalScore === "number" ? match.homeFinalScore : null,
        awayFinalScore: typeof match.awayFinalScore === "number" ? match.awayFinalScore : null,
        forceClosed: match.forceClosed ?? false,
        actualWinner: match.actualWinner ?? null,
        closed: isMatchClosed(match, now),
        predictorCount: ms.total,
        exactCount: ms.exactCount,
        correctOutcomeCount: ms.correctOutcomeCount,
        homeWinPicks: ms.homeWinPicks,
        drawPicks: ms.drawPicks,
        awayWinPicks: ms.awayWinPicks,
      };
    });

    // Format stat questions
    const adminStatQuestions = statQuestions.map((q) => ({
      id: q.id,
      matchId: q.matchId,
      matchNumber: q.matchNumber,
      matchLabel: q.matchLabel,
      text: q.text,
      options: q.options,
      correctOptionId: q.correctOptionId ?? null,
      resolved: Boolean(q.correctOptionId),
      pointValue: q.pointValue ?? 1,
      totalBets: statBets.filter((b) => b.questionId === q.id).length,
    }));

    return NextResponse.json({ matches: adminMatches, leaderboard, statQuestions: adminStatQuestions });
  } catch (error) {
    console.error("Failed to load admin data", error);
    return NextResponse.json({ error: "No se pudo cargar el panel de admin." }, { status: 500 });
  }
}
