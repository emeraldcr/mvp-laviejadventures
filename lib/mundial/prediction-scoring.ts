export type PredictionSide = "home" | "away";
export type PredictionWinnerPick = PredictionSide | null;

export type PredictionScoringMatch = {
  stage: string;
  homeFinalScore: number;
  awayFinalScore: number;
  actualWinner?: PredictionWinnerPick;
};

export type PredictionScoringPick = {
  homeScore: number;
  awayScore: number;
  winnerPick?: PredictionWinnerPick;
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

  if (isExact && isDrawInKnockout && correctWinner) return 4;
  if (isExact && isDrawInKnockout) return 1;
  if (isExact) return 3;
  if (correctOutcome && correctWinner) return 2;
  if (correctOutcome) return 1;
  return 0;
}

export function predictionScoreKind(points: number): "exact" | "outcome" | "miss" {
  if (points >= 3) return "exact";
  if (points >= 1) return "outcome";
  return "miss";
}
