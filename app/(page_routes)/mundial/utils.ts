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
  return new Intl.DateTimeFormat("es", {
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

const COUNTRY_FLAGS: Record<string, string> = {
  // América
  Argentina: "🇦🇷",
  Brasil: "🇧🇷", Brazil: "🇧🇷",
  México: "🇲🇽", Mexico: "🇲🇽",
  "Estados Unidos": "🇺🇸", USA: "🇺🇸", "United States": "🇺🇸",
  Canadá: "🇨🇦", Canada: "🇨🇦",
  Uruguay: "🇺🇾",
  Colombia: "🇨🇴",
  Chile: "🇨🇱",
  Ecuador: "🇪🇨",
  Perú: "🇵🇪", Peru: "🇵🇪",
  Paraguay: "🇵🇾",
  Venezuela: "🇻🇪",
  Bolivia: "🇧🇴",
  "Costa Rica": "🇨🇷",
  Panamá: "🇵🇦", Panama: "🇵🇦",
  Honduras: "🇭🇳",
  Jamaica: "🇯🇲",
  "El Salvador": "🇸🇻",
  Guatemala: "🇬🇹",
  Haití: "🇭🇹", Haiti: "🇭🇹",
  "Trinidad y Tobago": "🇹🇹", "Trinidad and Tobago": "🇹🇹",
  // Europa
  Alemania: "🇩🇪", Germany: "🇩🇪",
  Francia: "🇫🇷", France: "🇫🇷",
  España: "🇪🇸", Spain: "🇪🇸",
  Inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󁿢", England: "🏴󠁧󠁢󠁥󠁮󠁧󁿢",
  Portugal: "🇵🇹",
  "Países Bajos": "🇳🇱", Netherlands: "🇳🇱", Holanda: "🇳🇱",
  Bélgica: "🇧🇪", Belgium: "🇧🇪",
  Italia: "🇮🇹", Italy: "🇮🇹",
  Croacia: "🇭🇷", Croatia: "🇭🇷",
  Serbia: "🇷🇸",
  Polonia: "🇵🇱", Poland: "🇵🇱",
  Suiza: "🇨🇭", Switzerland: "🇨🇭",
  Dinamarca: "🇩🇰", Denmark: "🇩🇰",
  Suecia: "🇸🇪", Sweden: "🇸🇪",
  Ucrania: "🇺🇦", Ukraine: "🇺🇦",
  Turquía: "🇹🇷", Turkey: "🇹🇷",
  Austria: "🇦🇹",
  Escocia: "🏴󠁧󠁢󠁳󠁣󠁴󁿢", Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󁿢",
  Gales: "🏴󠁧󠁢󠁷󠁬󠁳󁿢", Wales: "🏴󠁧󠁢󠁷󠁬󠁳󁿢",
  Hungría: "🇭🇺", Hungary: "🇭🇺",
  Albania: "🇦🇱",
  Eslovenia: "🇸🇮", Slovenia: "🇸🇮",
  Rumania: "🇷🇴", Romania: "🇷🇴",
  Eslovaquia: "🇸🇰", Slovakia: "🇸🇰",
  "República Checa": "🇨🇿", "Czech Republic": "🇨🇿",
  Grecia: "🇬🇷", Greece: "🇬🇷",
  // Asia
  Japón: "🇯🇵", Japan: "🇯🇵",
  "Corea del Sur": "🇰🇷", "South Korea": "🇰🇷",
  "Arabia Saudita": "🇸🇦", "Saudi Arabia": "🇸🇦",
  Irán: "🇮🇷", Iran: "🇮🇷",
  Australia: "🇦🇺",
  China: "🇨🇳",
  Indonesia: "🇮🇩",
  Uzbekistán: "🇺🇿", Uzbekistan: "🇺🇿",
  Qatar: "🇶🇦",
  Irak: "🇮🇶", Iraq: "🇮🇶",
  Jordania: "🇯🇴", Jordan: "🇯🇴",
  // África
  Marruecos: "🇲🇦", Morocco: "🇲🇦",
  Senegal: "🇸🇳",
  Nigeria: "🇳🇬",
  Ghana: "🇬🇭",
  Camerún: "🇨🇲", Cameroon: "🇨🇲",
  Túnez: "🇹🇳", Tunisia: "🇹🇳",
  Egipto: "🇪🇬", Egypt: "🇪🇬",
  Argelia: "🇩🇿", Algeria: "🇩🇿",
  "Costa de Marfil": "🇨🇮", "Ivory Coast": "🇨🇮",
  Mali: "🇲🇱",
  "RD Congo": "🇨🇩",
  Sudáfrica: "🇿🇦", "South Africa": "🇿🇦",
  // Oceanía
  "Nueva Zelanda": "🇳🇿", "New Zealand": "🇳🇿",
};

export function getCountryFlag(teamName: string): string {
  return COUNTRY_FLAGS[teamName] ?? "🏳️";
}
