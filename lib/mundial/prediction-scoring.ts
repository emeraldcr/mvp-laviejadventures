export type PredictionSide = "home" | "away";
export type PredictionWinnerPick = PredictionSide | null;

export type MatchDecisionMethod = "regular" | "extraTime" | "penalties";

export type PredictionScoringMatch = {
  stage: string;
  homeFinalScore: number;
  awayFinalScore: number;
  actualWinner?: PredictionWinnerPick;
  decisionMethod?: MatchDecisionMethod;
};

export type PredictionScoringPick = {
  homeScore: number;
  awayScore: number;
  winnerPick?: PredictionWinnerPick;
  winnerPickMethod?: MatchDecisionMethod;
};

export function predictionOutcome(homeScore: number, awayScore: number) {
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}

export function computePredictionPoints(
  match: PredictionScoringMatch,
  prediction: PredictionScoringPick,
): number {
  const actualOutcome = predictionOutcome(match.homeFinalScore, match.awayFinalScore);
  const predictedOutcome = predictionOutcome(prediction.homeScore, prediction.awayScore);
  const correctOutcome = actualOutcome === predictedOutcome;
  const isExact =
    prediction.homeScore === match.homeFinalScore &&
    prediction.awayScore === match.awayFinalScore;
  const isDrawInKnockout = actualOutcome === "draw" && match.stage !== "group";
  const correctWinner =
    isDrawInKnockout &&
    match.actualWinner != null &&
    prediction.winnerPick === match.actualWinner;
  const correctMethod =
    correctWinner &&
    match.decisionMethod != null &&
    match.decisionMethod === prediction.winnerPickMethod;

  if (isExact && isDrawInKnockout && correctWinner && correctMethod) return 4;
  if (isExact && isDrawInKnockout) return 1;
  if (isExact) return 3;
  if (correctOutcome && correctWinner) {
    if (correctMethod && match.decisionMethod === "penalties") return 3;
    if (correctMethod && match.decisionMethod === "extraTime") return 2;
    return 1;
  }
  if (correctOutcome) return 1;
  return 0;
}

export function predictionScoreKind(points: number): "exact" | "outcome" | "miss" {
  if (points >= 3) return "exact";
  if (points >= 1) return "outcome";
  return "miss";
}
