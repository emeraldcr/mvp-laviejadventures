import type { MundialStage } from "@/lib/mundial/fixtures";

export type LiveMatchStatus = "scheduled" | "live" | "halftime" | "fulltime";
export type LiveEventType = "goal" | "penalty" | "yellow" | "red" | "var" | "substitution" | "note";
export type LiveEventTeam = "home" | "away" | null;

export type AdminLiveMatchEvent = {
  id: string;
  type: LiveEventType;
  team: LiveEventTeam;
  minute: number | null;
  player: string;
  note: string;
  createdAt: string | null;
};

export type AdminMatch = {
  id: string;
  number: number;
  stage: MundialStage;
  stageLabel: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  venue: string;
  group: string | null;
  homeFinalScore: number | null;
  awayFinalScore: number | null;
  forceClosed: boolean;
  actualWinner: "home" | "away" | null;
  liveStatus: LiveMatchStatus;
  liveMinute: number | null;
  homeLiveScore: number | null;
  awayLiveScore: number | null;
  liveNote: string;
  liveEvents: AdminLiveMatchEvent[];
  liveUpdatedAt: string | null;
  closed: boolean;
  predictorCount: number;
  exactCount: number;
  correctOutcomeCount: number;
  homeWinPicks: number;
  drawPicks: number;
  awayWinPicks: number;
};

export type LeaderboardEntry = {
  playerName: string;
  normalizedName: string;
  predictionPoints: number;
  statPoints: number;
  totalPoints: number;
  totalPredictions: number;
  scoredPredictions: number;
  exactScores: number;
  correctOutcomes: number;
};

export type StatOption = { id: string; label: string };

export type BetOptionAnalytics = {
  optionId: string;
  label: string;
  count: number;
  pct: number;
  players: string[];
};

export type AdminStatQuestion = {
  id: string;
  matchId: string;
  matchNumber: number;
  matchLabel: string;
  text: string;
  options: StatOption[];
  correctOptionId: string | null;
  resolved: boolean;
  pointValue: number;
  totalBets: number;
  betsByOption: BetOptionAnalytics[];
};

export type AdminAnalyticsEventName = "login" | "pick_saved" | "stat_bet_saved";

export type AdminAnalyticsEvent = {
  id: string;
  event: AdminAnalyticsEventName;
  playerName: string;
  normalizedName: string;
  happenedAt: string | null;
  createdAt: string | null;
  metadata: Record<string, unknown>;
  request: {
    ipAnonymized: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    userAgent: string;
  };
};

export type AdminAnalyticsSummary = {
  totalEvents: number;
  logins: number;
  picksSaved: number;
  statBetsSaved: number;
  uniquePlayers: number;
};

export type AdminData = {
  matches: AdminMatch[];
  leaderboard: LeaderboardEntry[];
  statQuestions: AdminStatQuestion[];
  analytics: {
    summary: AdminAnalyticsSummary;
    events: AdminAnalyticsEvent[];
  };
};

export type AdminView = "leaderboard" | "matches" | "stats" | "analytics";
