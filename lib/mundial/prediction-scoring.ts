export type PredictionSide = "home" | "away";
export type PredictionWinnerPick = PredictionSide | null;

export type MatchDecisionMethod = "regular" | "extraTime" | "penalties";

export type PredictionScoringMatch = {
  stage: string;
  homeFinalScore: number;
  awayFinalScore: number;
  homeRegulationScore?: number | null;
  awayRegulationScore?: number | null;
  actualWinner?: PredictionWinnerPick;
  decisionMethod?: MatchDecisionMethod;
};

export type PredictionScoringPick = {
  homeScore: number;
  awayScore: number;
  winnerPick?: PredictionWinnerPick;
  winnerPickMethod?: MatchDecisionMethod | null;
};

export type PredictionScoreKind = "exact" | "outcome" | "bonus" | "miss";

export type PredictionScoreResult = {
  points: number;
  exactScore: boolean;
  correctOutcome: boolean;
  kind: PredictionScoreKind;
};

export function predictionOutcome(homeScore: number, awayScore: number) {
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}

export function computePredictionResult(
  match: PredictionScoringMatch,
  prediction: PredictionScoringPick,
): PredictionScoreResult {
  const scoringHomeScore = match.homeRegulationScore ?? match.homeFinalScore;
  const scoringAwayScore = match.awayRegulationScore ?? match.awayFinalScore;
  const actualOutcome = predictionOutcome(scoringHomeScore, scoringAwayScore);
  const predictedOutcome = predictionOutcome(prediction.homeScore, prediction.awayScore);
  const predictedTiebreak = match.stage !== "group" && prediction.winnerPickMethod != null;
  const exactExtraTimeFinal =
    match.stage !== "group" &&
    match.decisionMethod === "extraTime" &&
    prediction.homeScore === match.homeFinalScore &&
    prediction.awayScore === match.awayFinalScore &&
    predictionOutcome(match.homeFinalScore, match.awayFinalScore) === match.actualWinner;

  if (predictedTiebreak && actualOutcome !== "draw") {
    return { points: 0, exactScore: false, correctOutcome: false, kind: "miss" };
  }

  const correctOutcome = actualOutcome === predictedOutcome;
  const isExact =
    prediction.homeScore === scoringHomeScore &&
    prediction.awayScore === scoringAwayScore;
  const isDrawInKnockout = actualOutcome === "draw" && match.stage !== "group";
  const correctWinner =
    isDrawInKnockout &&
    match.actualWinner != null &&
    prediction.winnerPick === match.actualWinner;
  const correctMethod =
    correctWinner &&
    match.decisionMethod != null &&
    match.decisionMethod === prediction.winnerPickMethod;

  if (isExact && isDrawInKnockout && correctWinner && correctMethod) {
    return { points: 4, exactScore: true, correctOutcome: true, kind: "exact" };
  }
  if (isExact && isDrawInKnockout) {
    return { points: 1, exactScore: true, correctOutcome: true, kind: "exact" };
  }
  if (isExact) {
    return { points: 3, exactScore: true, correctOutcome: true, kind: "exact" };
  }
  if (exactExtraTimeFinal) {
    return { points: 2, exactScore: false, correctOutcome: false, kind: "bonus" };
  }
  if (correctOutcome && correctWinner) {
    if (correctMethod && match.decisionMethod === "penalties") {
      return { points: 3, exactScore: false, correctOutcome: true, kind: "outcome" };
    }
    if (correctMethod && match.decisionMethod === "extraTime") {
      return { points: 2, exactScore: false, correctOutcome: true, kind: "outcome" };
    }
    return { points: 1, exactScore: false, correctOutcome: true, kind: "outcome" };
  }
  if (correctOutcome) return { points: 1, exactScore: false, correctOutcome: true, kind: "outcome" };
  return { points: 0, exactScore: false, correctOutcome: false, kind: "miss" };
}

export function computePredictionPoints(
  match: PredictionScoringMatch,
  prediction: PredictionScoringPick,
): number {
  return computePredictionResult(match, prediction).points;
}

export function predictionScoreKind(points: number): Exclude<PredictionScoreKind, "bonus"> {
  if (points >= 3) return "exact";
  if (points >= 1) return "outcome";
  return "miss";
}
