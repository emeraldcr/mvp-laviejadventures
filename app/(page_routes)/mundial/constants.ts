import type { Draft, ViewMode } from "./types";

export const API_URL = "/api/mundial/predictions";
export const REQUEST_TIMEOUT_MS = 12000;
export const TOTAL_MATCHES = 104;
export const STORAGE_KEY = "mundial-player-name";
export const TRUSTED_PLAYER_KEY = "mundial-trusted-player-key";
export const SESSION_KEY = "mundial-session";
export const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
export const EMPTY_DRAFTS: Record<string, Draft> = {};
export const VIEW_OPTIONS: Array<{ id: ViewMode; label: string }> = [
  { id: "next", label: "Ahora" },
  { id: "mine", label: "Mis picks" },
  { id: "players", label: "Jugadores" },
];
