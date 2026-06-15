import { REQUEST_TIMEOUT_MS } from "./constants";
import { normalizeTeamName, resolveTeamFlag } from "./flags";
import type { Draft, MundialMatch } from "./types";

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

export function isSameDayInCR(leftMs: number, rightMs: number) {
  if (!Number.isFinite(leftMs) || !Number.isFinite(rightMs)) return false;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(leftMs) === formatter.format(rightMs);
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
