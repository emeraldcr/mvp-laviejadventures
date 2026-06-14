import { REQUEST_TIMEOUT_MS } from "./constants";
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

export function isMatchClosed(match: MundialMatch, nowMs: number) {
  return match.closed || (nowMs > 0 && kickoffMs(match) <= nowMs);
}

export function hasFinalScore(match: MundialMatch) {
  return typeof match.homeFinalScore === "number" && typeof match.awayFinalScore === "number";
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

const COUNTRY_CODES: Record<string, string> = {
  argentina: "AR",
  brasil: "BR",
  brazil: "BR",
  mexico: "MX",
  "estados unidos": "US",
  usa: "US",
  "united states": "US",
  canada: "CA",
  uruguay: "UY",
  colombia: "CO",
  chile: "CL",
  ecuador: "EC",
  peru: "PE",
  paraguay: "PY",
  venezuela: "VE",
  bolivia: "BO",
  "costa rica": "CR",
  panama: "PA",
  honduras: "HN",
  jamaica: "JM",
  "el salvador": "SV",
  guatemala: "GT",
  haiti: "HT",
  "trinidad y tobago": "TT",
  "trinidad and tobago": "TT",
  curazao: "CW",
  curacao: "CW",
  "cabo verde": "CV",
  "cape verde": "CV",
  alemania: "DE",
  germany: "DE",
  francia: "FR",
  france: "FR",
  espana: "ES",
  spain: "ES",
  portugal: "PT",
  "paises bajos": "NL",
  netherlands: "NL",
  holanda: "NL",
  belgica: "BE",
  belgium: "BE",
  italia: "IT",
  italy: "IT",
  croacia: "HR",
  croatia: "HR",
  serbia: "RS",
  polonia: "PL",
  poland: "PL",
  suiza: "CH",
  switzerland: "CH",
  dinamarca: "DK",
  denmark: "DK",
  suecia: "SE",
  sweden: "SE",
  ucrania: "UA",
  ukraine: "UA",
  turquia: "TR",
  turkey: "TR",
  turkiye: "TR",
  austria: "AT",
  noruega: "NO",
  norway: "NO",
  "bosnia y herzegovina": "BA",
  "bosnia and herzegovina": "BA",
  hungria: "HU",
  hungary: "HU",
  albania: "AL",
  eslovenia: "SI",
  slovenia: "SI",
  rumania: "RO",
  romania: "RO",
  eslovaquia: "SK",
  slovakia: "SK",
  "republica checa": "CZ",
  "czech republic": "CZ",
  czechia: "CZ",
  grecia: "GR",
  greece: "GR",
  japon: "JP",
  japan: "JP",
  "corea del sur": "KR",
  "south korea": "KR",
  "korea republic": "KR",
  "arabia saudita": "SA",
  "saudi arabia": "SA",
  iran: "IR",
  "ir iran": "IR",
  australia: "AU",
  china: "CN",
  indonesia: "ID",
  uzbekistan: "UZ",
  qatar: "QA",
  irak: "IQ",
  iraq: "IQ",
  jordania: "JO",
  jordan: "JO",
  marruecos: "MA",
  morocco: "MA",
  senegal: "SN",
  nigeria: "NG",
  ghana: "GH",
  camerun: "CM",
  cameroon: "CM",
  tunez: "TN",
  tunisia: "TN",
  egipto: "EG",
  egypt: "EG",
  argelia: "DZ",
  algeria: "DZ",
  "costa de marfil": "CI",
  "ivory coast": "CI",
  "cote d'ivoire": "CI",
  mali: "ML",
  "rd congo": "CD",
  "congo dr": "CD",
  sudafrica: "ZA",
  "south africa": "ZA",
  "nueva zelanda": "NZ",
  "new zealand": "NZ",
};

const SUBDIVISION_FLAGS: Record<string, string> = {
  england: "gbeng",
  inglaterra: "gbeng",
  scotland: "gbsct",
  escocia: "gbsct",
  wales: "gbwls",
  gales: "gbwls",
};

function normalizeTeamName(teamName: string) {
  return teamName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function countryCodeFlag(countryCode: string) {
  const code = countryCode.toUpperCase().replace(/[^A-Z]/g, "");
  if (code.length !== 2) return whiteFlag();

  return [...code].map((letter) => String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65)).join("");
}

function subdivisionFlag(tag: string) {
  return [
    0x1f3f4,
    ...[...tag.toLowerCase()].map((letter) => 0xe0061 + letter.charCodeAt(0) - 97),
    0xe007f,
  ]
    .map((codePoint) => String.fromCodePoint(codePoint))
    .join("");
}

function whiteFlag() {
  return String.fromCodePoint(0x1f3f3, 0xfe0f);
}

export function getCountryFlag(teamName: string): string {
  const normalizedTeamName = normalizeTeamName(teamName);
  const subdivisionCode = SUBDIVISION_FLAGS[normalizedTeamName];
  if (subdivisionCode) return subdivisionFlag(subdivisionCode);

  const countryCode = COUNTRY_CODES[normalizedTeamName];
  return countryCode ? countryCodeFlag(countryCode) : whiteFlag();
}
