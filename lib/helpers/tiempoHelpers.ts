import { CheckCircle2, AlertTriangle, XCircle, Clock, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RainData, RegionalHourlyEntry } from "@/lib/types/index";

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

export type CanyonSchedule = {
  isOpen: boolean;
  currentHour: number;
  message: string;
  detail: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
};

export type Saturation = {
  percent: number;
  label: string;
  shortLabel: string;
  color: string;
  barColor: string;
  description: string;
};

export type RainNarrative = {
  period: string;
  headline: string;
  summary: string;
  todayMm: number;
  yesterdayMm: number;
  last6hMm: number;
  wetStreak: number;
};

export type MorningSlot = {
  hour: number;
  label: string;
  time: string | null;
  temp_c: number | null;
  precip_mm: number | null;
  precip_prob: number | null;
  weather_icon: string;
  available: boolean;
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

// ── Horario del cañón (independiente del clima) ──────────────────────────────

export function getCanyonSchedule(referenceISO?: string | null): CanyonSchedule {
  const hour = getCostaRicaHour(referenceISO);
  const isOpen = hour >= 7 && hour < 16;

  if (isOpen) {
    return {
      isOpen: true,
      currentHour: hour,
      message: "Horario de cañón abierto",
      detail: "Ingreso permitido entre 7:00 a.m. y 4:00 p.m.",
      icon: Sun,
      color: "text-emerald-300",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
    };
  }

  const isNight = hour >= 18 || hour < 6;
  return {
    isOpen: false,
    currentHour: hour,
    message: isNight ? "Fuera de horario (noche)" : "Fuera de horario del cañón",
    detail: "El cañón solo opera de 7:00 a.m. a 4:00 p.m. · Igual podés ver cómo está el río",
    icon: Clock,
    color: "text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
  };
}

// ── Saturación del río (lluvia acumulada, lenguaje simple) ───────────────────

export function getSaturation(rain: RainData | null): Saturation {
  if (!rain?.stats) {
    return {
      percent: 0,
      label: "Sin datos",
      shortLabel: "—",
      color: "text-zinc-400",
      barColor: "bg-zinc-500",
      description: "Esperando datos de la estación IMN.",
    };
  }

  const last3h = rain.stats.last3h_mm ?? 0;
  const last24h = rain.stats.last24h_mm ?? 0;
  const last48h = rain.stats.last48h_mm ?? 0;
  const wetStreak = rain.stats.wetStreak ?? 0;
  const crecida = rain.crecidaRisk?.level;

  let percent = Math.min(
    100,
    (last24h / 45) * 55 + (last3h / 12) * 25 + (last48h / 80) * 10 + Math.min(wetStreak, 8) * 1.5,
  );

  if (crecida === "critico") percent = Math.max(percent, 88);
  else if (crecida === "alto") percent = Math.max(percent, 68);
  else if (crecida === "moderado") percent = Math.max(percent, 42);

  percent = Math.round(percent);

  if (percent >= 80) {
    return {
      percent,
      label: "Río muy cargado",
      shortLabel: "Muy cargado",
      color: "text-red-300",
      barColor: "bg-red-500",
      description: `Mucha lluvia reciente (${last24h.toFixed(0)} mm en 24h). El caudal puede seguir subiendo.`,
    };
  }
  if (percent >= 55) {
    return {
      percent,
      label: "Río saturado",
      shortLabel: "Saturado",
      color: "text-amber-300",
      barColor: "bg-amber-500",
      description: `Ha llovido bastante (${last24h.toFixed(0)} mm en 24h). Conviene esperar a que baje.`,
    };
  }
  if (percent >= 30) {
    return {
      percent,
      label: "Río húmedo",
      shortLabel: "Húmedo",
      color: "text-yellow-200",
      barColor: "bg-yellow-500",
      description: `Lluvia moderada reciente. El río responde pero aún manejable.`,
    };
  }
  return {
    percent,
    label: "Río tranquilo",
    shortLabel: "Tranquilo",
    color: "text-emerald-300",
    barColor: "bg-emerald-500",
    description: `Poca lluvia acumulada (${last24h.toFixed(0)} mm en 24h). Buenas condiciones de base.`,
  };
}

// ── Narrativa de lluvia en lenguaje cotidiano ────────────────────────────────

export function getRainPeriodLabel(hour: number): string {
  if (hour >= 18 || hour < 6) return "esta noche";
  if (hour < 12) return "esta mañana";
  return "esta tarde";
}

export function buildRainNarrative(rain: RainData | null, referenceISO?: string | null): RainNarrative {
  const hour = getCostaRicaHour(referenceISO ?? rain?.meta?.lastUpdateISO);
  const period = getRainPeriodLabel(hour);
  const last1h = rain?.stats?.last1h_mm ?? 0;
  const last6h = rain?.stats?.last6h_mm ?? 0;
  const last24h = rain?.stats?.last24h_mm ?? 0;
  const wetStreak = rain?.stats?.wetStreak ?? 0;
  const todayMm = rain?.currentSnapshot?.sum_lluv_mm ?? 0;
  const yesterdayMm = rain?.currentSnapshot?.lluv_ayer_mm ?? 0;
  const trend = rain?.status?.trend ?? "estable";

  let headline = "Sin lluvia reciente";
  let summary = "El río descansa. No ha caído agua significativa en las últimas horas.";

  if (wetStreak >= 4) {
    headline = `Lleva ${wetStreak} horas lloviendo seguido`;
    summary = `La lluvia no para. En las últimas 6h cayeron ${last6h.toFixed(1)} mm. El río puede seguir subiendo.`;
  } else if (last6h >= 15) {
    headline = `Lluvia fuerte ${period}`;
    summary = `${last6h.toFixed(1)} mm en 6 horas. Mejor no planear cañón hasta que baje el caudal.`;
  } else if (last6h >= 5) {
    headline = `Ha llovido bastante ${period}`;
    summary = `${last6h.toFixed(1)} mm en 6h y la tendencia está ${trend}. Vigilá el río antes de entrar.`;
  } else if (last6h >= 1) {
    headline = `Llovizna ${period}`;
    summary = `Cayeron ${last6h.toFixed(1)} mm en 6h. Nada alarmante, pero el suelo ya está húmedo.`;
  } else if (last1h > 0.3) {
    headline = "Llovizna reciente";
    summary = `${last1h.toFixed(1)} mm en la última hora. Por ahora controlado.`;
  } else if (last24h >= 20) {
    headline = "Mucha lluvia en el día";
    summary = `Aunque ahora está calmado, hoy acumuló ${todayMm.toFixed(0)} mm. El río puede ir cargado.`;
  }

  return { period, headline, summary, todayMm, yesterdayMm, last6hMm: last6h, wetStreak };
}

// ── Pronóstico mañana 7 / 8 / 9 AM ───────────────────────────────────────────

export function getCostaRicaDateString(reference?: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(reference ?? new Date());
}

function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function getTomorrowMorningSlots(hourly: RegionalHourlyEntry[] | undefined): MorningSlot[] {
  const tomorrow = addDaysToDateString(getCostaRicaDateString(), 1);
  const targetHours = [7, 8, 9];

  return targetHours.map((h) => {
    const key = `${tomorrow}T${String(h).padStart(2, "0")}:00`;
    const match = hourly?.find((x) => x.time === key);
    const label = `${h}:00 a.m.`;

    if (!match) {
      return {
        hour: h,
        label,
        time: null,
        temp_c: null,
        precip_mm: null,
        precip_prob: null,
        weather_icon: "🌤️",
        available: false,
      };
    }

    return {
      hour: h,
      label,
      time: match.time,
      temp_c: match.temp_c,
      precip_mm: match.precip_mm,
      precip_prob: match.precip_prob,
      weather_icon: match.weather_icon,
      available: true,
    };
  });
}

export function summarizeMorningSlots(slots: MorningSlot[]): string {
  const available = slots.filter((s) => s.available);
  if (!available.length) return "Pronóstico de mañana temprano no disponible aún.";

  const maxProb = Math.max(...available.map((s) => s.precip_prob ?? 0));
  const totalMm = available.reduce((a, s) => a + (s.precip_mm ?? 0), 0);

  if (maxProb >= 70 || totalMm >= 5) {
    return "Mañana temprano se ve lluvioso. Planificá con margen o considerá pozas.";
  }
  if (maxProb >= 40 || totalMm >= 2) {
    return "Mañana puede haber llovizna. Llevá impermeable y revisá antes de salir.";
  }
  return "Mañana temprano se ve bastante seco. Buena ventana para salir temprano.";
}

// ── GO / CAUTION / NO — solo condiciones de lluvia (sin bloquear por horario) ─

export function getWeatherAssessment(rain: RainData | null): Decision {
  if (!rain?.status) return {
    level: "caution", title: "Cargando...", subtitle: "Obteniendo datos del IMN",
    color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30",
    icon: AlertTriangle,
  };

  const r = rain.status.risk;
  const last3h = rain.stats?.last3h_mm ?? 0;
  const trend = rain.status.trend;
  const wetStreak = rain.stats?.wetStreak ?? 0;

  if (wetStreak >= 4) return {
    level: "no",
    title: "Lluvia continua",
    subtitle: `${wetStreak}h seguidas de lluvia · El río puede estar subiendo`,
    color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/40",
    icon: XCircle,
  };

  if (r === "red") return {
    level: "no",
    title: "Lluvia intensa ahora",
    subtitle: `${last3h.toFixed(1)} mm en 3h · Mejor esperar`,
    color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/40",
    icon: XCircle,
  };

  if (r === "yellow" || last3h > 5) return {
    level: "caution",
    title: "Lluvia moderada",
    subtitle: `${last3h.toFixed(1)} mm en 3h · Tendencia ${trend}`,
    color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30",
    icon: AlertTriangle,
  };

  return {
    level: "go",
    title: "Clima tranquilo",
    subtitle: `${last3h.toFixed(1)} mm en 3h · Lluvia ${trend}`,
    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30",
    icon: CheckCircle2,
  };
}

/** @deprecated Usar getWeatherAssessment + getCanyonSchedule por separado */
export function getDecision(rain: RainData | null): Decision {
  return getWeatherAssessment(rain);
}

// ── Chart data transformers ───────────────────────────────────────────────────

export function buildHourlyChart(rain: RainData | null) {
  return (rain?.data?.hourly ?? [])
    .slice(0, 12)
    .map(h => ({
      hora: formatHora(h.timestampISO, h.fecha),
      lluvia: h.lluvia_mm,
      fill: mmToColor(h.lluvia_mm),
    }))
    .reverse();
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
