export type MundialStage = "group" | "round32" | "round16" | "quarterfinal" | "semifinal" | "thirdPlace" | "final";
export type WinnerPick = "home" | "away" | null;
export type ViewMode = "next" | "mine" | "players";

export type MundialMatch = {
  id: string;
  number: number;
  stage: MundialStage;
  stageLabel: string;
  group: string | null;
  date: string;
  kickoffAt: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeSeed: string | null;
  awaySeed: string | null;
  homeFinalScore: number | null;
  awayFinalScore: number | null;
  closed: boolean;
  sortOrder: number;
};

export type Prediction = {
  id: string;
  matchId: string;
  matchNumber: number | null;
  playerName: string;
  homeScore: number;
  awayScore: number;
  winnerPick: WinnerPick;
  locked: boolean;
  lockedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PlayerProgress = {
  key: string;
  playerName: string;
  totalPredictions: number;
  lockedPredictions: number;
  updatedAt: string | null;
};

export type PredictionsResponse = {
  matches: MundialMatch[];
  predictions: Prediction[];
  players: PlayerProgress[];
};

export type Draft = {
  homeScore: number;
  awayScore: number;
  winnerPick: WinnerPick;
  locked: boolean;
  dirty: boolean;
  saved: boolean;
  updatedAt: string | null;
};
