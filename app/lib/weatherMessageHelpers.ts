/**
 * weatherMessageHelpers.ts
 * Versión chill: vacilón tico ligero, corto y sin ser despiadado.
 */

import {
  WEATHER_MESSAGE_CHARACTERS,
  WEATHER_MESSAGE_STYLE_ANGLES,
  WEATHER_MESSAGE_SYSTEM_PROMPT,
} from "@/app/lib/weatherMessageConstants";

export type WeatherSnapshot = {
  risk: "green" | "yellow" | "red";
  riskLabel?: string;
  last1h_mm: number;
  last3h_mm?: number;
  last6h_mm?: number;
  last24h_mm: number;
  last48h_mm?: number;
  intensity: string;
  trend: string;
  wetHoursLast24?: number;
  consensusMm: number;
  forecastNextHourMm?: number;
  confidence?: string;
  wetStreak?: number;
  dryStreak?: number;
  peakHourMm?: number;
  peakHourLabel?: string;
  stationName?: string;
  currentSumMm?: number;
  yesterdayMm?: number;
  avgTemp24h: number | null;
  maxTemp24h?: number | null;
  minTemp24h?: number | null;
  avgHR24h?: number | null;
};

export function buildSystemPrompt(): string {
  return WEATHER_MESSAGE_SYSTEM_PROMPT;
}

function trendLabel(trendRaw: string): "up" | "down" | "flat" {
  const t = (trendRaw || "").toLowerCase();
  if (t.includes("up") || t.includes("sub")) return "up";
  if (t.includes("down") || t.includes("baj")) return "down";
  return "flat";
}

export function buildUserPrompt(snap: WeatherSnapshot): string {
  const condicion =
    snap.risk === "red"
      ? "lluvia brava"
      : snap.risk === "yellow"
        ? "lluvia inquieta"
        : "clima manso";

  const fmt = (v?: number | null, unit = "") =>
    v == null ? "sin dato" : `${Math.round(v * 10) / 10}${unit}`;

  const trend = trendLabel(snap.trend);
  const trendTexto =
    trend === "up"
      ? "subiendo"
      : trend === "down"
        ? "bajando"
        : "estable";

  const angle =
    WEATHER_MESSAGE_STYLE_ANGLES[Math.floor(Math.random() * WEATHER_MESSAGE_STYLE_ANGLES.length)];

  return `Generá 1-2 oraciones de humor campesino san carleño con estos datos reales:
- Estado general: ${condicion} (${snap.riskLabel ?? snap.risk})
- Intensidad reportada: ${snap.intensity}
- Tendencia de lluvia: ${trendTexto}
- Lluvia última 1h: ${fmt(snap.last1h_mm, " mm")}
- Lluvia última 3h: ${fmt(snap.last3h_mm, " mm")}
- Lluvia última 6h: ${fmt(snap.last6h_mm, " mm")}
- Lluvia últimas 24h: ${fmt(snap.last24h_mm, " mm")}
- Lluvia últimas 48h: ${fmt(snap.last48h_mm, " mm")}
- Lluvia esperada próxima hora: ${fmt(snap.forecastNextHourMm, " mm")}
- Consenso pronóstico: ${fmt(snap.consensusMm, " mm")}
- Confianza del pronóstico: ${snap.confidence ?? "sin dato"}
- Horas con lluvia en 24h: ${fmt(snap.wetHoursLast24)}
- Racha mojada: ${fmt(snap.wetStreak, " h")}
- Racha seca: ${fmt(snap.dryStreak, " h")}
- Pico de lluvia 24h: ${fmt(snap.peakHourMm, " mm")} (${snap.peakHourLabel ?? "hora no disponible"})
- Acumulado de hoy: ${fmt(snap.currentSumMm, " mm")}
- Ayer cayó: ${fmt(snap.yesterdayMm, " mm")}
- Temperatura promedio 24h: ${fmt(snap.avgTemp24h, " °C")}
- Temperatura máxima 24h: ${fmt(snap.maxTemp24h, " °C")}
- Temperatura mínima 24h: ${fmt(snap.minTemp24h, " °C")}
- Humedad promedio 24h: ${fmt(snap.avgHR24h, " %")}
- Estación/zona: ${snap.stationName ?? "San Carlos"}

Personalización obligatoria Río La Vieja:
- Mencioná explícitamente "Río La Vieja" o "La Vieja river".
- Estilo de compa extranjero + barrio tico, con humor más filoso pero no odio real.
- Meté al menos 1 personaje de esta lista en la línea final:
  ${WEATHER_MESSAGE_CHARACTERS.join(", ")}.
- Si encaja, podés usar guiños como: "ni que fuera Virgilio" o "o sea(s) tonto".

Enfoque de estilo: ${angle}`;
}
