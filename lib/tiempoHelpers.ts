import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RainData } from "@/lib/types/index";

// ── Decision type ─────────────────────────────────────────────────────────────

export type Decision = {
  level: "go" | "caution" | "no";
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  border: string;
  icon: LucideIcon;
};

// ── Format helpers ────────────────────────────────────────────────────────────

export function formatHora(iso: string | null | undefined, fecha?: string): string {
  if (iso) {
    try {
      return new Date(iso).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch { /* fall through */ }
  }
  if (fecha) {
    const m = fecha.match(/\d{1,2}:\d{2}(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)?/i);
    if (m) return m[0];
  }
  return "—";
}

export function formatFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-CR", { weekday: "short", day: "numeric", month: "short" });
  } catch { return "—"; }
}

export function getCostaRicaHour(referenceISO?: string | null): number {
  const base = referenceISO ? new Date(referenceISO) : new Date();
  const hourText = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: "America/Costa_Rica",
  }).format(base);
  const hour = Number(hourText);
  return Number.isFinite(hour) ? hour : 12;
}

export function mmToColor(mm: number): string {
  if (!Number.isFinite(mm) || mm <= 0) return "#22c55e";
  if (mm >= 20) return "#7f1d1d";
  if (mm >= 12) return "#dc2626";
  if (mm >= 8) return "#f97316";
  if (mm >= 4) return "#f59e0b";
  if (mm > 0.5) return "#facc15";
  return "#84cc16";
}

// ── GO / CAUTION / NO decision engine ────────────────────────────────────────

export function getDecision(rain: RainData | null): Decision {
  if (!rain?.status) return {
    level: "caution", title: "Cargando...", subtitle: "Obteniendo datos del IMN",
    color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30",
    icon: AlertTriangle,
  };

  const r = rain.status.risk;
  const last3h = rain.stats?.last3h_mm ?? 0;
  const forecast = rain.forecast?.consensusMm ?? 0;
  const trend = rain.status.trend;
  const wetStreak = rain.stats?.wetStreak ?? 0;
  const currentHourCR = getCostaRicaHour(rain.meta?.lastUpdateISO);
  const isWithinCanyonWindow = currentHourCR >= 7 && currentHourCR < 16;

  if (!isWithinCanyonWindow) return {
    level: "no",
    title: "Fuera de horario recomendado",
    subtitle: "Para seguridad en el cañón: ingreso solo entre 7:00 a.m. y 4:00 p.m.",
    color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/40",
    icon: XCircle,
  };

  if (wetStreak >= 4) return {
    level: "no",
    title: "No recomendado ingresar al cañón",
    subtitle: `${wetStreak}h seguidas de lluvia detectadas · Posible aumento de caudal`,
    color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/40",
    icon: XCircle,
  };

  if (r === "red" || (last3h > 15 && forecast > 3)) return {
    level: "no",
    title: "No recomendado salir",
    subtitle: `Lluvia intensa: ${last3h.toFixed(1)}mm en 3h • ${rain.status.riskLabel}`,
    color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/40",
    icon: XCircle,
  };

  if (r === "yellow" || last3h > 5 || forecast > 2) return {
    level: "caution",
    title: "Salir con precaución",
    subtitle: `${last3h.toFixed(1)}mm en últimas 3h · Tendencia: ${trend} · Pronóstico: ${forecast.toFixed(1)}mm/h`,
    color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30",
    icon: AlertTriangle,
  };

  return {
    level: "go",
    title: "¡Condiciones favorables!",
    subtitle: `${last3h.toFixed(1)}mm en últimas 3h · Pronóstico: ${forecast.toFixed(1)}mm/h esperado`,
    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30",
    icon: CheckCircle2,
  };
}

// ── Chart data transformers ───────────────────────────────────────────────────

export function buildHourlyChart(rain: RainData | null) {
  return (rain?.data?.hourly ?? [])
    .slice(0, 12)
    .map(h => ({
      hora: formatHora(h.timestampISO, h.fecha),
      lluvia: h.lluvia_mm,
      temp: h.temp_c,
      hr: h.hr_pct,
      fill: mmToColor(h.lluvia_mm),
    }))
    .reverse();
}

export function buildForecastChart(rain: RainData | null) {
  if (!rain?.forecast?.methods) return [];
  return Object.entries(rain.forecast.methods).map(([k, m]) => ({
    name:
      k === "ema" ? "EMA"
      : k === "doubleEMA" ? "D-EMA"
      : k === "linearRegression" ? "Regresión"
      : k === "movingAverage3h" ? "MA-3h"
      : k === "movingAverage6h" ? "MA-6h"
      : "WMA-6h",
    value: m.value,
    label: m.label,
  }));
}

export function buildRiskChart(rain: RainData | null) {
  return (rain?.analysis?.rollingRisk ?? []).slice(-12).map(r => ({
    hora: formatHora(r.timestampISO, r.fecha),
    "3h": r.r3h,
    "6h": r.r6h,
  }));
}

export function buildDailyChart(rain: RainData | null) {
  return (rain?.data?.daily ?? []).slice(0, 7).map((d) => ({
    fecha: formatFecha(d.timestamp ?? null),
    lluvia: d.lluvia_mm,
    fill: mmToColor(d.lluvia_mm),
  }));
}
