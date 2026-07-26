export type Sport = "football" | "basketball" | "other";

export type MatchStatus =
  | "scheduled"
  | "live"
  | "halftime"
  | "finished"
  | "postponed"
  | "cancelled";

/** UI alias kept for compatibility */
export type LiveStatus = MatchStatus;

export type SyncMode = "manual" | "provider";
export type SyncHealth = "healthy" | "stale" | "error" | "never_synced";

export type Competition = {
  id: string;
  sport: Sport;
  name: string;
  enabled: boolean;
  syncMode: SyncMode;
  provider?: string;
  providerCompetitionId?: string;
  lastSyncedAt?: Date | string | null;
  syncHealth: SyncHealth;
};

export type Match = {
  id: string;
  competitionId: string;
  sourceId: string;
  league: string;
  sport: Sport;
  number: number;
  homeTeam: string;
  awayTeam: string;
  startsAt: string;
  kickoffAt: string;
  venue: string;
  timezone: "UTC";
  status: MatchStatus;
  liveStatus: MatchStatus;
  period?: string | null;
  clock?: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeLiveScore: number | null;
  awayLiveScore: number | null;
  liveMinute: number | null;
  liveNote: string;
  forceClosed: boolean;
  predictionClosesAt: string;
  resultVersion: number;
  provider?: string | null;
  providerMatchId?: string | null;
  sortOrder: number;
};

export type Prediction = {
  id: string;
  matchId: string;
  userId: string;
  playerName: string;
  homeScore: number;
  awayScore: number;
  locked: boolean;
  lockedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  scoring?: {
    points: number;
    exact: boolean;
    correctOutcome: boolean;
    ruleVersion: string;
  } | null;
};

export type LeaderboardEntry = {
  userId: string;
  playerName: string;
  totalPoints: number;
  totalPredictions: number;
  exactScores: number;
  correctOutcomes: number;
  hitRate: number;
};

export type Draft = {
  homeScore: number;
  awayScore: number;
  dirty: boolean;
  saved: boolean;
  updatedAt: string | null;
};

export type WinnerSide = "home" | "away" | "draw" | null;
