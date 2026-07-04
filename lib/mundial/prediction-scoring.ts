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

export function predictionOutcome(homeScore: number, awayScore: number) {
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}

export function computePredictionPoints(
  match: PredictionScoringMatch,
  prediction: PredictionScoringPick,
): number {
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

  if (predictedTiebreak && actualOutcome !== "draw") return 0;

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

  if (isExact && isDrawInKnockout && correctWinner && correctMethod) return 4;
  if (isExact && isDrawInKnockout) return 1;
  if (isExact) return 3;
  if (exactExtraTimeFinal) return 2;
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
