import type { BettingFavorite } from "@/lib/mundial/betting";

export type MundialStage = "group" | "round32" | "round16" | "quarterfinal" | "semifinal" | "thirdPlace" | "final";
export type WinnerPick = "home" | "away" | null;
export type ViewMode = "next" | "mine" | "players";
export type LiveMatchStatus = "scheduled" | "live" | "halftime" | "fulltime";
export type LiveEventType = "goal" | "penalty" | "yellow" | "red" | "var" | "substitution" | "note";
export type LiveEventTeam = "home" | "away" | null;

export type LiveMatchEvent = {
  id: string;
  type: LiveEventType;
  team: LiveEventTeam;
  minute: number | null;
  player: string;
  note: string;
  createdAt: string | null;
};

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
  liveStatus: LiveMatchStatus;
  liveMinute: number | null;
  homeLiveScore: number | null;
  awayLiveScore: number | null;
  liveNote: string;
  liveEvents: LiveMatchEvent[];
  liveUpdatedAt: string | null;
  bettingFavorite: BettingFavorite | null;
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

export type LeaderboardEntry = {
  playerName: string;
  normalizedName: string;
  totalPoints: number;
  totalPredictions: number;
  scoredPredictions: number;
  exactScores: number;
  correctOutcomes: number;
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
