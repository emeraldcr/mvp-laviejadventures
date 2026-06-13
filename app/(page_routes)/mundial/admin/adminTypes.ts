import type { MundialStage } from "@/lib/mundial/fixtures";

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
  closed: boolean;
  predictorCount: number;
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
};

export type AdminData = {
  matches: AdminMatch[];
  leaderboard: LeaderboardEntry[];
  statQuestions: AdminStatQuestion[];
};

export type AdminView = "leaderboard" | "matches" | "stats";
