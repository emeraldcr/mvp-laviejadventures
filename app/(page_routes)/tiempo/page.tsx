"use client";

/**
 * TourWeatherDashboard
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN PHILOSOPHY
 *  • One answer above the fold: ¿Puedo salir de tour?  → GO / CAUTION / NO
 *  • Everything else is progressive disclosure (expandable sections)
 *  • Dark theme matching existing site aesthetic
 *  • Spanish-first, uses all available API data
 *  • Bar + line charts inline with Recharts (already in your stack)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
  CartesianGrid,
} from "recharts";
import {
  CheckCircle2, AlertTriangle, XCircle, ChevronDown,
  RefreshCw, Droplets, Thermometer, Wind, Clock,
  TrendingUp, TrendingDown, Minus, Eye, EyeOff,
  CloudRain, Gauge, Activity, ArrowLeft,
} from "lucide-react";
import WeatherMessage from "./components/WeatherMessage";
import type { WeatherSnapshot } from "@/app/lib/weatherMessageHelpers";

// ─── Types ────────────────────────────────────────────────────────────────────
type HourlyEntry = {
  fecha: string;
  timestampISO: string | null;
  lluvia_mm: number;
  temp_c: number | null;
  hr_pct: number | null;
};

type RainData = {
  success: boolean;
  meta?: { fetchedAt: string; lastUpdateISO: string; note: string; station: string };
  status?: {
    risk: "green" | "yellow" | "red";
    riskLabel: string;
    riskEmoji: string;
    intensity: string;
    lastHour_mm: number;
    trend: string;
  };
  stats?: {
    last1h_mm: number; last3h_mm: number; last6h_mm: number;
    last24h_mm: number; last48h_mm: number;
    wetHoursLast24: number; wetStreak: number; dryStreak: number;
    peakHour24h: { mm: number; fecha: string };
  };
  forecast?: {
    nextHour_mm: number;
    confidence: string;
    consensusMm: number;
    methods: Record<string, { value: number; label: string }>;
  };
  weather?: {
    hasData: boolean;
    avgTemp24h: number | null; maxTemp24h: number | null; minTemp24h: number | null;
    avgHR24h: number | null; maxHR24h: number | null; minHR24h: number | null;
  };
  analysis?: {
    rollingRisk: Array<{
      fecha: string; timestampISO: string | null;
      r3h: number; r6h: number;
    }>;
  };
  data?: { hourly: HourlyEntry[]; daily: any[] };
  currentSnapshot?: { sum_lluv_mm: number; lluv_ayer_mm: number } | null;
  error?: string;
};

type RegionalData = {
  success: boolean;
  fetchedAt?: string;
  locations?: Array<{
    id: string; name: string; lat: number; lon: number;
    current: { temp_c: number; hr_pct: number; precip_mm: number; weather_label: string; weather_icon: string; wind_kmh: number } | null;
    daily_5d: Array<{ date: string; weather_icon: string; weather_label: string; temp_max_c: number; temp_min_c: number; precip_sum_mm: number }>;
  }>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatHora(iso: string | null | undefined, fecha?: string): string {
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

function formatFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-CR", { weekday: "short", day: "numeric", month: "short" });
  } catch { return "—"; }
}

function mmToColor(mm: number): string {
  if (mm >= 12) return "#ef4444";
  if (mm >= 4) return "#f97316";
  if (mm > 0.5) return "#fbbf24";
  return "#22c55e";
}

// ─── GO/CAUTION/NO Decision Engine ───────────────────────────────────────────
type Decision = { level: "go" | "caution" | "no"; title: string; subtitle: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 };

function getDecision(rain: RainData | null): Decision {
  if (!rain?.status) return {
    level: "caution", title: "Cargando...", subtitle: "Obteniendo datos del IMN",
    color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30",
    icon: AlertTriangle,
  };

  const r = rain.status.risk;
  const last3h = rain.stats?.last3h_mm ?? 0;
  const forecast = rain.forecast?.consensusMm ?? 0;
  const trend = rain.status.trend;

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

// ─── Subcomponents ────────────────────────────────────────────────────────────

function PulsingDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`} />
    </span>
  );
}

function StatPill({ label, value, unit, highlight }: { label: string; value: string | number; unit?: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col gap-0.5 px-3 py-2 rounded-xl border ${highlight ? "bg-white/5 border-white/15" : "bg-white/[0.03] border-white/8"}`}>
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{label}</span>
      <span className="text-sm font-bold text-white tabular-nums">
        {value}<span className="text-xs text-zinc-400 font-normal ml-0.5">{unit}</span>
      </span>
    </div>
  );
}

function CollapsibleSection({ title, icon: Icon, defaultOpen = false, children, badge }: {
  title: string; icon: typeof CloudRain; defaultOpen?: boolean; children: React.ReactNode; badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Icon size={15} className="text-zinc-400" />
          </div>
          <span className="text-sm font-semibold text-zinc-200">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/25 text-teal-400 text-[10px] font-bold uppercase tracking-wide">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown size={16} className={`text-zinc-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? "#fff" }} className="font-bold">
          {p.name}: {p.value?.toFixed ? p.value.toFixed(1) : p.value} {p.unit ?? "mm"}
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TourWeatherDashboard() {
  const [rain, setRain] = useState<RainData | null>(null);
  const [regional, setRegional] = useState<RegionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showRawForecast, setShowRawForecast] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.allSettled([
        fetch("/api/tiempo?hours=24").then(r => r.json()),
        fetch("/api/tiempo/regional").then(r => r.json()),
      ]);
      if (r1.status === "fulfilled") setRain(r1.value);
      if (r2.status === "fulfilled") setRegional(r2.value);
      setLastRefresh(new Date());
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const decision = getDecision(rain);
  const DecisionIcon = decision.icon;

  // ── Snapshot for Anthropic funny message ──
  // Memoized on `rain` so a new object reference is only created when weather
  // data actually changes — prevents the useEffect in WeatherMessage from
  // firing on every unrelated parent re-render.
  const weatherSnap = useMemo<WeatherSnapshot | null>(() => {
    if (!rain?.status) return null;
    return {
      risk:        rain.status.risk,
      riskLabel:   rain.status.riskLabel,
      last1h_mm:   rain.stats?.last1h_mm  ?? 0,
      last3h_mm:   rain.stats?.last3h_mm  ?? 0,
      last6h_mm:   rain.stats?.last6h_mm  ?? 0,
      last24h_mm:  rain.stats?.last24h_mm ?? 0,
      intensity:   rain.status.intensity,
      trend:       rain.status.trend,
      consensusMm: rain.forecast?.consensusMm ?? 0,
      confidence:  rain.forecast?.confidence  ?? "baja",
      wetStreak:   rain.stats?.wetStreak  ?? 0,
      dryStreak:   rain.stats?.dryStreak  ?? 0,
      avgTemp24h:  rain.weather?.avgTemp24h ?? null,
      avgHR24h:    rain.weather?.avgHR24h   ?? null,
    };
  }, [rain]);

  // ── Chart data: last 12h hourly ──
  const hourlyChart = (rain?.data?.hourly ?? [])
    .slice(0, 12)
    .map(h => ({
      hora: formatHora(h.timestampISO, h.fecha),
      lluvia: h.lluvia_mm,
      temp: h.temp_c,
      hr: h.hr_pct,
      fill: mmToColor(h.lluvia_mm),
    }))
    .reverse();

  // ── Forecast chart: ensemble methods ──
  const forecastChart = rain?.forecast?.methods
    ? Object.entries(rain.forecast.methods).map(([k, m]) => ({
      name: k === "ema" ? "EMA" : k === "doubleEMA" ? "D-EMA" : k === "linearRegression" ? "Regresión" : k === "movingAverage3h" ? "MA-3h" : k === "movingAverage6h" ? "MA-6h" : "WMA-6h",
      value: m.value,
      label: m.label,
    }))
    : [];

  // ── Rolling risk chart ──
  const riskChart = (rain?.analysis?.rollingRisk ?? []).slice(-12).map(r => ({
    hora: formatHora(r.timestampISO, r.fecha),
    "3h": r.r3h,
    "6h": r.r6h,
  }));

  // ── Daily chart ──
  const dailyChart = (rain?.data?.daily ?? []).slice(0, 7).map(d => ({
    fecha: formatFecha(d.timestamp ?? null),
    lluvia: d.lluvia_mm,
    fill: mmToColor(d.lluvia_mm),
  }));

  const sCarlos = regional?.locations?.find(l => l.id === "san_carlos");
  const jcb = regional?.locations?.find(l => l.id === "juan_castro_blanco");

  const trendIcon = rain?.status?.trend === "subiendo"
    ? <TrendingUp size={14} className="text-red-400" />
    : rain?.status?.trend === "bajando"
      ? <TrendingDown size={14} className="text-emerald-400" />
      : <Minus size={14} className="text-zinc-400" />;

  return (
    <div className="min-h-screen bg-[#080b0d] text-white font-sans">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[#080b0d]/90 backdrop-blur-xl border-b border-white/6">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-semibold">Inicio</span>
            </Link>
            <div className="flex items-center gap-2">
              <PulsingDot color={loading ? "bg-zinc-500" : "bg-emerald-500"} />
              <span className="hidden sm:block text-xs font-bold uppercase tracking-widest text-zinc-500">
                Estación IMN · Montaña Sagrada
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-[10px] text-zinc-600">
                {lastRefresh.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={fetchAll}
              disabled={loading}
              className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-zinc-400" : "text-zinc-400"} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ═══ HERO: ¿PUEDO SALIR? ════════════════════════════════════════════ */}
        <div className={`relative rounded-3xl border-2 overflow-hidden ${decision.bg} ${decision.border} p-6`}>
          {/* Glow */}
          <div className={`absolute inset-0 opacity-20 ${decision.level === "go" ? "bg-gradient-to-br from-emerald-500/30 to-transparent" : decision.level === "no" ? "bg-gradient-to-br from-red-500/30 to-transparent" : "bg-gradient-to-br from-amber-500/30 to-transparent"} pointer-events-none`} />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold mb-2">¿Puedo salir de tour ahora?</p>
                <div className="flex items-center gap-2.5 mb-1">
                  <DecisionIcon size={24} className={decision.color} strokeWidth={2} />
                  <h1 className={`text-2xl font-black ${decision.color}`}>{decision.title}</h1>
                </div>
                <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">{decision.subtitle}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className={`text-5xl font-black tabular-nums ${decision.color}`}>
                  {rain?.stats?.last3h_mm?.toFixed(1) ?? "—"}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-0.5">mm últimas 3h</div>
              </div>
            </div>

            {/* ── 3h + Próximas 3h split ── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/30 border border-white/8 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Últimas 3 horas</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Última hora</span>
                    <span className="font-bold text-white">{rain?.stats?.last1h_mm ?? "—"} mm</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">3 horas</span>
                    <span className="font-bold text-white">{rain?.stats?.last3h_mm ?? "—"} mm</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">6 horas</span>
                    <span className="font-bold text-white">{rain?.stats?.last6h_mm ?? "—"} mm</span>
                  </div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-zinc-400">Tendencia</span>
                    <span className="flex items-center gap-1 font-bold">{trendIcon} {rain?.status?.trend ?? "—"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-black/30 border border-white/8 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Próximas ~3 horas</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Consenso</span>
                    <span className="font-bold text-teal-300">{rain?.forecast?.consensusMm ?? "—"} mm/h</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Confianza</span>
                    <span className={`font-bold ${rain?.forecast?.confidence === "alta" ? "text-emerald-400" : rain?.forecast?.confidence === "media" ? "text-amber-400" : "text-red-400"}`}>
                      {rain?.forecast?.confidence === "alta" ? "Alta" : rain?.forecast?.confidence === "media" ? "Media" : "Baja"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">EMA 1h</span>
                    <span className="font-bold text-white">{rain?.forecast?.nextHour_mm ?? "—"} mm/h</span>
                  </div>
                  {rain?.stats?.dryStreak !== undefined && rain.stats.dryStreak > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Horas secas</span>
                      <span className="font-bold text-emerald-400">{rain.stats.dryStreak}h seguidas</span>
                    </div>
                  )}
                  {rain?.stats?.wetStreak !== undefined && rain.stats.wetStreak > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Horas lluvia</span>
                      <span className="font-bold text-red-400">{rain.stats.wetStreak}h seguidas</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ ANTHROPIC FUNNY MESSAGE ════════════════════════════════════════ */}
        <WeatherMessage snap={weatherSnap} />

        {/* ═══ MINI HOURLY BAR CHART (last 12h) ══════════════════════════════ */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CloudRain size={14} className="text-zinc-400" />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">Lluvia · últimas 12h</span>
            </div>
            {rain?.currentSnapshot && (
              <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                <span>Acum. hoy: <strong className="text-zinc-300">{rain.currentSnapshot.sum_lluv_mm}mm</strong></span>
                <span>Ayer: <strong className="text-zinc-300">{rain.currentSnapshot.lluv_ayer_mm}mm</strong></span>
              </div>
            )}
          </div>

          {hourlyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={hourlyChart} barSize={18} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="hora" tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <ReferenceLine y={4} stroke="#f97316" strokeDasharray="3 2" strokeOpacity={0.5} />
                <ReferenceLine y={12} stroke="#ef4444" strokeDasharray="3 2" strokeOpacity={0.5} />
                <Bar dataKey="lluvia" name="Lluvia" radius={[3, 3, 0, 0]}>
                  {hourlyChart.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[120px] flex items-center justify-center text-zinc-600 text-sm">Sin datos</div>
          )}

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
              <div className="w-5 h-0.5 bg-orange-500 border-dashed border border-orange-500" />
              <span>Moderada (4mm)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
              <div className="w-5 h-0.5 bg-red-500" />
              <span>Intensa (12mm)</span>
            </div>
          </div>
        </div>

        {/* ═══ TEMPERATURA + HUMEDAD (si hay datos) ══════════════════════════ */}
        {rain?.weather?.hasData && hourlyChart.some(h => h.temp !== null) && (
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-4">
              <Thermometer size={14} className="text-zinc-400" />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">Temperatura & Humedad · 12h</span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={hourlyChart} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="hora" tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)" }} />
                <Line dataKey="temp" name="Temp" unit="°C" stroke="#f97316" strokeWidth={2} dot={false} connectNulls />
                <Line dataKey="hr" name="HR" unit="%" stroke="#38bdf8" strokeWidth={1.5} dot={false} strokeDasharray="4 2" connectNulls />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-3">
              <StatPill label="Prom. Temp 24h" value={rain.weather.avgTemp24h ?? "—"} unit="°C" />
              <StatPill label="Máx 24h" value={rain.weather.maxTemp24h ?? "—"} unit="°C" />
              <StatPill label="Mín 24h" value={rain.weather.minTemp24h ?? "—"} unit="°C" />
              <StatPill label="HR prom 24h" value={rain.weather.avgHR24h ?? "—"} unit="%" />
            </div>
          </div>
        )}

        {/* ═══ RIESGO ACUMULADO (rolling) ═════════════════════════════════════ */}
        <CollapsibleSection title="Riesgo acumulado · últimas 24h" icon={Activity} badge="rolante">
          {riskChart.length > 0 ? (
            <>
              <p className="text-xs text-zinc-500 mb-3">Acumulación de lluvia en ventanas de 3h y 6h. Rojo = riesgo de crecida.</p>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={riskChart} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="g3h" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g6h" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="hora" tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <ReferenceLine y={10} stroke="#f97316" strokeDasharray="3 2" strokeOpacity={0.6} />
                  <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="3 2" strokeOpacity={0.6} />
                  <Area type="monotone" dataKey="3h" name="Acum. 3h" stroke="#f97316" fill="url(#g3h)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="6h" name="Acum. 6h" stroke="#ef4444" fill="url(#g6h)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-orange-500 inline-block" /> Acum. 3h (alerta &gt;10mm)</span>
                <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-red-500 inline-block" /> Acum. 6h (alerta &gt;20mm)</span>
              </div>
            </>
          ) : <p className="text-xs text-zinc-600">Sin datos de riesgo disponibles.</p>}
        </CollapsibleSection>

        {/* ═══ PRONÓSTICO MÉTODOS ═════════════════════════════════════════════ */}
        <CollapsibleSection title="Pronóstico · métodos ensemble" icon={TrendingUp}>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-400">Consenso de todos los métodos</span>
              <span className="text-xl font-black text-teal-300">{rain?.forecast?.consensusMm ?? "—"} <span className="text-xs font-normal text-zinc-500">mm/h estimado</span></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Confianza: <strong className={rain?.forecast?.confidence === "alta" ? "text-emerald-400" : rain?.forecast?.confidence === "media" ? "text-amber-400" : "text-red-400"}>{rain?.forecast?.confidence}</strong></span>
            </div>
          </div>
          {forecastChart.length > 0 && (
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={forecastChart} barSize={24} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="value" name="mm/h" fill="#14b8a6" radius={[3, 3, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <button
            onClick={() => setShowRawForecast(!showRawForecast)}
            className="flex items-center gap-1.5 text-[10px] text-zinc-600 hover:text-zinc-400 mt-3 transition-colors"
          >
            {showRawForecast ? <EyeOff size={11} /> : <Eye size={11} />}
            {showRawForecast ? "Ocultar detalle" : "Ver detalle de métodos"}
          </button>
          {showRawForecast && (
            <div className="mt-3 space-y-1.5">
              {Object.entries(rain?.forecast?.methods ?? {}).map(([k, m]) => (
                <div key={k} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 truncate max-w-[70%]">{m.label}</span>
                  <span className="font-bold text-zinc-300 tabular-nums">{m.value} mm/h</span>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        {/* ═══ DIARIO 7 DÍAS ══════════════════════════════════════════════════ */}
        <CollapsibleSection title="Lluvia diaria · últimos 7 días (estación)" icon={Gauge}>
          {dailyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={dailyChart} barSize={28} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="fecha" tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="lluvia" name="Lluvia" radius={[4, 4, 0, 0]}>
                  {dailyChart.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-zinc-600">Sin datos diarios.</p>}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <StatPill label="Hoy (acum.)" value={rain?.currentSnapshot?.sum_lluv_mm ?? "—"} unit="mm" highlight />
            <StatPill label="Ayer total" value={rain?.currentSnapshot?.lluv_ayer_mm ?? "—"} unit="mm" />
            <StatPill label="Pico 24h" value={rain?.stats?.peakHour24h?.mm ?? "—"} unit="mm" />
          </div>
        </CollapsibleSection>

        {/* ═══ REGIONAL: SAN CARLOS + JCB ════════════════════════════════════ */}
        <CollapsibleSection title="Contexto regional · Open-Meteo" icon={Wind}>
          <p className="text-[10px] text-zinc-600 mb-4">Modelo numérico – no observaciones directas. Útil para tendencia regional.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[sCarlos, jcb].filter(Boolean).map(loc => loc && (
              <div key={loc.id} className="rounded-xl bg-black/30 border border-white/8 p-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">{loc.name}</p>
                {loc.current ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{loc.current.weather_icon}</span>
                      <span className="text-sm text-zinc-300">{loc.current.weather_label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="flex justify-between"><span className="text-zinc-500">Temp</span><span className="text-white font-bold">{loc.current.temp_c}°C</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">HR</span><span className="text-white font-bold">{loc.current.hr_pct}%</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Precip</span><span className="text-white font-bold">{loc.current.precip_mm}mm</span></div>
                      <div className="flex justify-between"><span className="text-zinc-500">Viento</span><span className="text-white font-bold">{loc.current.wind_kmh}km/h</span></div>
                    </div>
                  </div>
                ) : <p className="text-xs text-zinc-600">Sin datos</p>}
                {/* 5-day mini forecast */}
                {loc.daily_5d?.length > 0 && (
                  <div className="flex gap-1 mt-3 pt-3 border-t border-white/5">
                    {loc.daily_5d.slice(0, 5).map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <span className="text-[9px] text-zinc-600">{formatFecha(d.date).split(" ")[0]}</span>
                        <span className="text-base leading-none">{d.weather_icon}</span>
                        <span className="text-[9px] text-zinc-400 font-bold">{d.precip_sum_mm}mm</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* ═══ RESUMEN STATS ══════════════════════════════════════════════════ */}
        <CollapsibleSection title="Resumen estadístico" icon={Droplets}>
          <div className="grid grid-cols-3 gap-2">
            <StatPill label="Últ. 1h" value={rain?.stats?.last1h_mm ?? "—"} unit="mm" />
            <StatPill label="Últ. 3h" value={rain?.stats?.last3h_mm ?? "—"} unit="mm" highlight />
            <StatPill label="Últ. 6h" value={rain?.stats?.last6h_mm ?? "—"} unit="mm" />
            <StatPill label="Últ. 24h" value={rain?.stats?.last24h_mm ?? "—"} unit="mm" />
            <StatPill label="Últ. 48h" value={rain?.stats?.last48h_mm ?? "—"} unit="mm" />
            <StatPill label="Hrs lluvia/24h" value={rain?.stats?.wetHoursLast24 ?? "—"} unit="h" />
            {rain?.stats?.wetStreak !== undefined && <StatPill label="Racha lluvia" value={rain.stats.wetStreak} unit="h" />}
            {rain?.stats?.dryStreak !== undefined && <StatPill label="Racha seca" value={rain.stats.dryStreak} unit="h" />}
            {rain?.stats?.peakHour24h && <StatPill label="Pico hora" value={rain.stats.peakHour24h.mm} unit="mm" />}
          </div>
        </CollapsibleSection>

        {/* ─ Footer note ──────────────────────────────────────────────────────── */}
        {rain?.meta && (
          <p className="text-[10px] text-zinc-700 text-center pb-4 leading-relaxed px-4">
            {rain.meta.note}<br />
            Fuente: {rain.meta.station} · Actualizado: {new Date(rain.meta.fetchedAt).toLocaleString("es-CR")}
          </p>
        )}
      </div>
    </div>
  );
}