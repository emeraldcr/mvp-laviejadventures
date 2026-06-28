import { REQUEST_TIMEOUT_MS } from "./constants";
import { normalizeTeamName, resolveTeamFlag } from "./flags";
import type { Draft, LiveMatchStatus, MundialMatch } from "./types";

const HALF_MINUTES = 45;
const STANDARD_HALFTIME_MINUTES = 15;
const FINAL_HALFTIME_MINUTES = 27; // midpoint of the expected 24-30 minute final halftime window
const HYDRATION_BREAK_MINUTES = 3;
const AVERAGE_STOPPAGE_TOTAL_MINUTES = 6;
const AVERAGE_STOPPAGE_PER_HALF_MINUTES = AVERAGE_STOPPAGE_TOTAL_MINUTES / 2;
const HALF_REAL_DURATION_MINUTES = HALF_MINUTES + HYDRATION_BREAK_MINUTES + AVERAGE_STOPPAGE_PER_HALF_MINUTES;

export const LIVE_TIMING = {
  halfMinutes: HALF_MINUTES,
  standardHalftimeMinutes: STANDARD_HALFTIME_MINUTES,
  finalHalftimeMinutes: FINAL_HALFTIME_MINUTES,
  hydrationBreakMinutes: HYDRATION_BREAK_MINUTES,
  firstHydrationMinute: 22,
  secondHydrationMinute: 67,
  averageStoppageTotalMinutes: AVERAGE_STOPPAGE_TOTAL_MINUTES,
  averageStoppagePerHalfMinutes: AVERAGE_STOPPAGE_PER_HALF_MINUTES,
};

function halftimeMinutes(match: MundialMatch) {
  return match.stage === "final" ? FINAL_HALFTIME_MINUTES : STANDARD_HALFTIME_MINUTES;
}

function autoLiveMaxMinutes(match: MundialMatch) {
  return (HALF_REAL_DURATION_MINUTES * 2) + halftimeMinutes(match);
}

export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeKey(value: string) {
  return normalizeName(value).toUpperCase();
}

export function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(30, Math.max(0, Math.trunc(value)));
}

export function emptyDraft(): Draft {
  return {
    homeScore: 0,
    awayScore: 0,
    winnerPick: null,
    locked: false,
    dirty: false,
    saved: false,
    updatedAt: null,
  };
}

export function kickoffMs(match: MundialMatch) {
  const kickoff = new Date(match.kickoffAt).getTime();
  return Number.isNaN(kickoff) ? Number.POSITIVE_INFINITY : kickoff;
}

function formatCRDate(ms: number) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ms);
}

function formatCRHour(ms: number) {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Costa_Rica",
      hour: "2-digit",
      hour12: false,
    }).format(ms)
  );
}

export function isSameDayInCR(leftMs: number, rightMs: number) {
  if (!Number.isFinite(leftMs) || !Number.isFinite(rightMs)) return false;

  return formatCRDate(leftMs) === formatCRDate(rightMs);
}

export function isSameMatchDayInCR(leftMs: number, rightMs: number) {
  if (!Number.isFinite(leftMs) || !Number.isFinite(rightMs)) return false;

  if (formatCRDate(leftMs) === formatCRDate(rightMs)) return true;

  const leftDate = formatCRDate(leftMs);
  const rightDate = formatCRDate(rightMs);
  const [leftYear, leftMonth, leftDay] = leftDate.split("-").map(Number);
  const [rightYear, rightMonth, rightDay] = rightDate.split("-").map(Number);
  const leftDayUtc = Date.UTC(leftYear, leftMonth - 1, leftDay);
  const rightDayUtc = Date.UTC(rightYear, rightMonth - 1, rightDay);

  if (rightDayUtc - leftDayUtc !== 24 * 60 * 60 * 1000) return false;

  const rightHour = formatCRHour(rightMs);
  const leftHour = formatCRHour(leftMs);
  return rightHour < 3 && leftHour >= 20;
}

export function isMatchClosed(match: MundialMatch, nowMs: number) {
  return match.closed || (nowMs > 0 && kickoffMs(match) <= nowMs);
}

export function hasFinalScore(match: MundialMatch) {
  return typeof match.homeFinalScore === "number" && typeof match.awayFinalScore === "number";
}

export function isMatchLive(match: MundialMatch) {
  return match.liveStatus === "live" || match.liveStatus === "halftime";
}

// Returns true when kickoff has passed but the admin hasn't set liveStatus yet.
export function isMatchAutoLive(match: MundialMatch, nowMs: number): boolean {
  if (!nowMs || match.liveStatus !== "scheduled") return false;
  const elapsed = nowMs - kickoffMs(match);
  return elapsed >= 0 && elapsed < autoLiveMaxMinutes(match) * 60_000;
}

// Estimated match minute based on elapsed time since kickoff.
// Includes fixed hydration windows and average stoppage time in the real match duration.
export function autoLiveMinute(match: MundialMatch, nowMs: number): number | null {
  const ko = kickoffMs(match);
  if (!nowMs || nowMs < ko) return null;
  const elapsed = Math.floor((nowMs - ko) / 60_000);
  const firstHalfEnd = HALF_REAL_DURATION_MINUTES;
  const secondHalfStart = firstHalfEnd + halftimeMinutes(match);
  const fullTime = secondHalfStart + HALF_REAL_DURATION_MINUTES;

  if (elapsed >= fullTime) return null;
  if (elapsed < firstHalfEnd) return Math.min(elapsed, HALF_MINUTES + AVERAGE_STOPPAGE_PER_HALF_MINUTES);
  if (elapsed < secondHalfStart) return HALF_MINUTES; // halftime break window

  const secondHalfElapsed = elapsed - secondHalfStart;
  return Math.min(HALF_MINUTES + secondHalfElapsed, (HALF_MINUTES * 2) + AVERAGE_STOPPAGE_PER_HALF_MINUTES);
}

// Derived live status from elapsed time when the DB still says "scheduled".
export function autoLiveStatus(match: MundialMatch, nowMs: number): LiveMatchStatus {
  if (!isMatchAutoLive(match, nowMs)) return match.liveStatus;
  const elapsed = Math.floor((nowMs - kickoffMs(match)) / 60_000);
  const firstHalfEnd = HALF_REAL_DURATION_MINUTES;
  const secondHalfStart = firstHalfEnd + halftimeMinutes(match);
  return elapsed >= firstHalfEnd && elapsed < secondHalfStart ? "halftime" : "live";
}

export function liveStatusLabel(match: MundialMatch) {
  if (match.liveStatus === "live") {
    return match.liveMinute !== null ? `${match.liveMinute}'` : "En vivo";
  }
  if (match.liveStatus === "halftime") return "Descanso";
  if (match.liveStatus === "fulltime") return "Finalizado";
  return "Programado";
}

export function liveScoreText(match: MundialMatch) {
  if (match.homeLiveScore === null || match.awayLiveScore === null) return "Marcador live pendiente";
  return `${match.homeTeam} ${match.homeLiveScore} - ${match.awayLiveScore} ${match.awayTeam}`;
}

export function finalScoreText(match: MundialMatch) {
  if (!hasFinalScore(match)) return "Resultado pendiente";
  return `${match.homeTeam} ${match.homeFinalScore} - ${match.awayFinalScore} ${match.awayTeam}`;
}

export function formatKickoff(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Hora por confirmar";

  return new Intl.DateTimeFormat("es-CR", {
    timeZone: "America/Costa_Rica",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatUpdatedAt(value: string | null) {
  if (!value) return "Sin guardar";

  return new Intl.DateTimeFormat("es-CR", {
    timeZone: "America/Costa_Rica",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatCountdown(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return "Cerrado";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function predictionResult(match: MundialMatch, draft: Draft) {
  if (draft.homeScore > draft.awayScore) return `Gana ${match.homeTeam}`;
  if (draft.awayScore > draft.homeScore) return `Gana ${match.awayTeam}`;
  if (match.stage === "group") return "Empate";
  if (draft.winnerPick === "home") return `Pasa ${match.homeTeam}`;
  if (draft.winnerPick === "away") return `Pasa ${match.awayTeam}`;
  return "Falta pase";
}

export function livePickStatus(match: MundialMatch, draft: Draft) {
  if (!draft.saved || !isMatchLive(match)) return null;
  if (match.homeLiveScore === null || match.awayLiveScore === null) return null;

  const pickText = `${draft.homeScore}-${draft.awayScore}`;
  const liveText = `${match.homeLiveScore}-${match.awayLiveScore}`;

  if (match.homeLiveScore > draft.homeScore || match.awayLiveScore > draft.awayScore) {
    return {
      tone: "lost" as const,
      title: "Exacto quemado",
      message: `Tu ${pickText} ya no puede pasar: van ${liveText}.`,
    };
  }

  if (match.homeLiveScore === draft.homeScore && match.awayLiveScore === draft.awayScore) {
    return {
      tone: "alive" as const,
      title: "Vas exacto",
      message: `Tu ${pickText} sigue vivo. Que nadie toque ese marcador.`,
    };
  }

  return null;
}

export function getWinnerPickOptions(match: MundialMatch) {
  return [
    { value: "", label: "Pasa por penales" },
    { value: "home", label: match.homeTeam },
    { value: "away", label: match.awayTeam },
  ];
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Builds a function that resolves knockout-stage placeholder team names like
 * "1ro Grupo C" or "2do Grupo A" into actual team names derived from
 * completed group-stage standings.
 *
 * For multi-group 3rd-place slots like "3ro Grupo A/B/C/D/F" it picks the
 * best-ranked qualifying 3rd-place team from those groups (top-8 thirds).
 *
 * Returns the original string unchanged when it can't be resolved yet.
 */
export function buildTeamResolver(allMatches: MundialMatch[]): (teamName: string) => string {
  type Entry = { team: string; points: number; goalDiff: number; goalsFor: number; played: number };
  const groupMap = new Map<string, Map<string, Entry>>();

  for (const match of allMatches) {
    if (match.stage !== "group" || !match.group) continue;
    if (match.homeFinalScore === null || match.awayFinalScore === null) continue;

    if (!groupMap.has(match.group)) groupMap.set(match.group, new Map());
    const g = groupMap.get(match.group)!;

    for (const [team, gf, ga] of [
      [match.homeTeam, match.homeFinalScore, match.awayFinalScore],
      [match.awayTeam, match.awayFinalScore, match.homeFinalScore],
    ] as [string, number, number][]) {
      if (!g.has(team)) g.set(team, { team, points: 0, goalDiff: 0, goalsFor: 0, played: 0 });
      const e = g.get(team)!;
      e.played++;
      e.goalsFor += gf;
      e.goalDiff += gf - ga;
      if (gf > ga) e.points += 3; else if (gf === ga) e.points += 1;
    }
  }

  // Only include groups where every team has played 3 matches (complete groups)
  const groupStandings = new Map<string, Entry[]>();
  for (const [group, teamMap] of groupMap) {
    const sorted = [...teamMap.values()].sort(
      (a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor || a.team.localeCompare(b.team)
    );
    if (sorted.every((t) => t.played === 3)) groupStandings.set(group, sorted);
  }

  // Rank all 3rd-place teams; top 8 advance in WC 2026 format
  const allThirds = [...groupStandings.values()].map((s) => s[2]).filter((t): t is Entry => Boolean(t));
  const rankedThirds = [...allThirds].sort(
    (a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor
  );
  const top8Thirds = new Set(rankedThirds.slice(0, 8).map((t) => t.team));

  // Build position lookup: "pos:GROUP" → team name
  const posLookup = new Map<string, string>();
  for (const [group, sorted] of groupStandings) {
    sorted.forEach((entry, i) => posLookup.set(`${i + 1}:${group.toUpperCase()}`, entry.team));
  }

  // Pre-compute 3rd-place slot assignments in match-number order so each
  // qualifying 3rd team is assigned to exactly one slot (no duplicates).
  const seedToTeam = new Map<string, string>(); // "A/B/C/D/F" → team name
  const assignedThirds = new Set<string>();

  const knockoutsSorted = allMatches
    .filter((m) => m.stage !== "group")
    .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

  for (const match of knockoutsSorted) {
    for (const seed of [match.homeSeed, match.awaySeed]) {
      if (!seed || !seed.startsWith("3")) continue;
      const groups = seed.slice(1).split("/").map((g) => g.toUpperCase());
      const seedKey = groups.join("/");
      if (seedToTeam.has(seedKey)) continue;

      for (const t of rankedThirds) {
        const tGroup = [...groupStandings.keys()].find(
          (g) => groupStandings.get(g)?.[2]?.team === t.team
        );
        if (
          tGroup &&
          groups.includes(tGroup.toUpperCase()) &&
          top8Thirds.has(t.team) &&
          !assignedThirds.has(t.team)
        ) {
          seedToTeam.set(seedKey, t.team);
          assignedThirds.add(t.team);
          break;
        }
      }
    }
  }

  return function resolve(teamName: string): string {
    const m = teamName.trim().match(/^(\d+)(?:ro|do|to|er|°)?\s+[Gg]rupo\s+([A-Za-z](?:\/[A-Za-z])*)/i);
    if (!m) return teamName;

    const pos = Number(m[1]);
    const groups = m[2].toUpperCase().split("/");

    // Single-group seed: "1ro Grupo C" → 1st place of Group C
    if (groups.length === 1) return posLookup.get(`${pos}:${groups[0]}`) ?? teamName;

    // Multi-group 3rd-place slot: use pre-computed unique assignment
    if (pos === 3) {
      const seedKey = groups.join("/");
      return seedToTeam.get(seedKey) ?? teamName;
    }

    return teamName;
  };
}

export { normalizeTeamName };

export function getCountryFlag(teamName: string): string {
  return resolveTeamFlag(teamName).emoji;
}

const TEAM_CODES: Record<string, string> = {
  argentina: "ARG",
  brasil: "BRA",
  brazil: "BRA",
  mexico: "MEX",
  "estados unidos": "USA",
  usa: "USA",
  "united states": "USA",
  canada: "CAN",
  uruguay: "URU",
  colombia: "COL",
  chile: "CHI",
  ecuador: "ECU",
  peru: "PER",
  paraguay: "PAR",
  venezuela: "VEN",
  bolivia: "BOL",
  "costa rica": "CRC",
  panama: "PAN",
  honduras: "HON",
  jamaica: "JAM",
  "el salvador": "SLV",
  guatemala: "GUA",
  haiti: "HAI",
  "trinidad y tobago": "TTO",
  "trinidad and tobago": "TTO",
  curazao: "CUW",
  curacao: "CUW",
  "cabo verde": "CPV",
  "cape verde": "CPV",
  alemania: "GER",
  germany: "GER",
  francia: "FRA",
  france: "FRA",
  espana: "ESP",
  spain: "ESP",
  portugal: "POR",
  "paises bajos": "NED",
  netherlands: "NED",
  holanda: "NED",
  belgica: "BEL",
  belgium: "BEL",
  italia: "ITA",
  italy: "ITA",
  croacia: "CRO",
  croatia: "CRO",
  serbia: "SRB",
  polonia: "POL",
  poland: "POL",
  suiza: "SUI",
  switzerland: "SUI",
  dinamarca: "DEN",
  denmark: "DEN",
  suecia: "SWE",
  sweden: "SWE",
  ucrania: "UKR",
  ukraine: "UKR",
  turquia: "TUR",
  turkey: "TUR",
  turkiye: "TUR",
  austria: "AUT",
  noruega: "NOR",
  norway: "NOR",
  "bosnia y herzegovina": "BIH",
  "bosnia and herzegovina": "BIH",
  hungria: "HUN",
  hungary: "HUN",
  albania: "ALB",
  eslovenia: "SVN",
  slovenia: "SVN",
  rumania: "ROU",
  romania: "ROU",
  eslovaquia: "SVK",
  slovakia: "SVK",
  "republica checa": "CZE",
  "czech republic": "CZE",
  czechia: "CZE",
  grecia: "GRE",
  greece: "GRE",
  japon: "JPN",
  japan: "JPN",
  "corea del sur": "KOR",
  "south korea": "KOR",
  "korea republic": "KOR",
  "arabia saudita": "KSA",
  "saudi arabia": "KSA",
  iran: "IRN",
  "ir iran": "IRN",
  australia: "AUS",
  china: "CHN",
  indonesia: "IDN",
  uzbekistan: "UZB",
  qatar: "QAT",
  irak: "IRQ",
  iraq: "IRQ",
  jordania: "JOR",
  jordan: "JOR",
  marruecos: "MAR",
  morocco: "MAR",
  senegal: "SEN",
  nigeria: "NGA",
  ghana: "GHA",
  camerun: "CMR",
  cameroon: "CMR",
  tunez: "TUN",
  tunisia: "TUN",
  egipto: "EGY",
  egypt: "EGY",
  argelia: "ALG",
  algeria: "ALG",
  "costa de marfil": "CIV",
  "ivory coast": "CIV",
  "cote d'ivoire": "CIV",
  mali: "MLI",
  "rd congo": "COD",
  "congo dr": "COD",
  sudafrica: "RSA",
  "south africa": "RSA",
  "nueva zelanda": "NZL",
  "new zealand": "NZL",
  england: "ENG",
  inglaterra: "ENG",
  scotland: "SCO",
  escocia: "SCO",
  wales: "WAL",
  gales: "WAL",
};

export function teamCode(teamName: string) {
  const normalized = normalizeTeamName(teamName);
  const known = TEAM_CODES[normalized];
  if (known) return known;

  const letters = normalized.replace(/[^a-z0-9]/g, "").toUpperCase();
  return (letters || "TBD").slice(0, 3).padEnd(3, "-");
}
