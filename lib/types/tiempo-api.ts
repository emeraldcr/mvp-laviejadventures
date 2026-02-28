export const IMN_URL = "https://www.imn.ac.cr/especial/tablas/msagrada.html";
export const CACHE_TTL_SECONDS = 300;

export const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "es-CR,es;q=0.9,en;q=0.8",
  Referer: "https://www.imn.ac.cr/",
  "Cache-Control": "no-cache",
} as const;

export const ABBREVIATIONS = {
  Temp: { desc: "Temperatura promedio", unit: "°C" },
  HR: { desc: "Humedad Relativa Promedio", unit: "%" },
  Lluvia: { desc: "Lluvia horaria", unit: "mm" },
  SUM_lluv: { desc: "Lluvia acumulada desde 7 a.m.", unit: "mm" },
  LLUV_ayer: { desc: "Lluvia del día anterior (7 a.m. a 7 a.m.)", unit: "mm" },
  nota: "Datos preliminares – sin control de calidad completo. Úsalos solo como referencia.",
} as const;

export type HourlyEntry = {
  fecha: string;
  timestamp: Date | null;
  timestampISO: string | null;
  lluvia_mm: number;
  temp_c: number | null;
  hr_pct: number | null;
};

export type CurrentTotals = {
  fecha: string;
  timestamp: Date | null;
  sum_lluv_mm: number;
  lluv_ayer_mm: number;
} | null;

export type DailyEntry = {
  fecha: string;
  timestamp: Date | null;
  lluvia_mm: number;
};

export type RiskStatus = "green" | "yellow" | "red";
export type RainStatus = "sin lluvia" | "ligera" | "moderada" | "intensa";

export type RiskDescriptor = { level: RiskStatus; label: string; emoji: string };

export type TiempoSections = Record<string, string[][]>;
