export type LiveTeamStats = {
  possessionPct: number | null;
  shots: number | null;
  shotsOnTarget: number | null;
  yellowCards: number | null;
  redCards: number | null;
  corners: number | null;
  fouls: number | null;
  saves: number | null;
};

export type LiveMatchStats = {
  home: LiveTeamStats;
  away: LiveTeamStats;
};

export const EMPTY_LIVE_TEAM_STATS: LiveTeamStats = {
  possessionPct: null,
  shots: null,
  shotsOnTarget: null,
  yellowCards: null,
  redCards: null,
  corners: null,
  fouls: null,
  saves: null,
};

export const EMPTY_LIVE_MATCH_STATS: LiveMatchStats = {
  home: EMPTY_LIVE_TEAM_STATS,
  away: EMPTY_LIVE_TEAM_STATS,
};

const STAT_KEYS = Object.keys(EMPTY_LIVE_TEAM_STATS) as Array<keyof LiveTeamStats>;

function finiteNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : null;
}

function readTeamStats(value: unknown): LiveTeamStats {
  const raw = value && typeof value === "object" ? value as Partial<Record<keyof LiveTeamStats, unknown>> : {};
  const stats = { ...EMPTY_LIVE_TEAM_STATS };

  for (const key of STAT_KEYS) {
    const parsed = finiteNumber(raw[key]);
    stats[key] = key === "possessionPct" && parsed !== null ? Math.min(100, parsed) : parsed;
  }

  return stats;
}

export function serializeLiveMatchStats(value: unknown): LiveMatchStats {
  const raw = value && typeof value === "object" ? value as { home?: unknown; away?: unknown } : {};

  return {
    home: readTeamStats(raw.home),
    away: readTeamStats(raw.away),
  };
}

export function hasAnyLiveStats(stats: LiveMatchStats | null | undefined) {
  if (!stats) return false;

  return STAT_KEYS.some((key) => stats.home[key] !== null || stats.away[key] !== null);
}
