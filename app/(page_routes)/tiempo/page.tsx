"use client";

import Link from "next/link";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
  CartesianGrid,
} from "recharts";
import {
  RefreshCw, Droplets, Thermometer, Wind,
  TrendingUp, TrendingDown, Minus, Eye, EyeOff,
  CloudRain, Gauge, Activity, ArrowLeft, Waves, ShieldCheck, AlertOctagon,
} from "lucide-react";

import { useTiempoData } from "@/app/hooks/useTiempoData";
import WeatherMessage from "./components/WeatherMessage";
import { PulsingDot } from "./components/PulsingDot";
import { StatPill } from "./components/StatPill";
import { CollapsibleSection } from "./components/CollapsibleSection";
import { CustomBarTooltip } from "./components/CustomBarTooltip";

export default function TourWeatherDashboard() {
  const {
    rain,
    regional,
    loading,
    lastRefresh,
    cooldown,
    fetchAll,
    decision,
    weatherSnap,
    hourlyChart,
    forecastChart,
    riskChart,
    dailyChart,
    showRawForecast,
    setShowRawForecast,
    fetchWarning,
  } = useTiempoData();

  const DecisionIcon = decision.icon;

  const sCarlos = regional?.locations?.find(l => l.id === "san_carlos");
  const jcb = regional?.locations?.find(l => l.id === "juan_castro_blanco");

  const trendIcon = rain?.status?.trend === "subiendo"
    ? <TrendingUp size={14} className="text-red-400" />
    : rain?.status?.trend === "bajando"
      ? <TrendingDown size={14} className="text-emerald-400" />
      : <Minus size={14} className="text-zinc-400" />;


  const reliabilityTone = rain?.reliability?.level === "alta"
    ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
    : rain?.reliability?.level === "media"
      ? "text-amber-300 border-amber-500/30 bg-amber-500/10"
      : "text-red-300 border-red-500/30 bg-red-500/10";

  const RiverIcon = rain?.riverLevel?.status === "critico" ? AlertOctagon : Waves;

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
            {cooldown > 0 && !loading && (
              <span className="text-[10px] text-zinc-600 tabular-nums">{cooldown}s</span>
            )}
            <button
              onClick={fetchAll}
              disabled={loading || cooldown > 0}
              title={cooldown > 0 ? `Espera ${cooldown}s para recargar` : "Recargar datos"}
              className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-zinc-400" : "text-zinc-400"} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {fetchWarning && (
          <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3">
            <p className="text-xs font-semibold text-amber-300 uppercase tracking-wide">Aviso de actualización</p>
            <p className="text-sm text-amber-100 mt-1">{fetchWarning}</p>
          </div>
        )}

        {/* ═══ HERO: ¿PUEDO SALIR? ════════════════════════════════════════════ */}
        <div className={`relative rounded-3xl border-2 overflow-hidden ${decision.bg} ${decision.border} p-6`}>
          <div className={`absolute inset-0 opacity-20 ${
            decision.level === "go" ? "bg-gradient-to-br from-emerald-500/30 to-transparent"
            : decision.level === "no" ? "bg-gradient-to-br from-red-500/30 to-transparent"
            : "bg-gradient-to-br from-amber-500/30 to-transparent"
          } pointer-events-none`} />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold mb-2">
                  ¿Puedo salir de tour ahora?
                </p>
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
                    <span className={`font-bold ${
                      rain?.forecast?.confidence === "alta" ? "text-emerald-400"
                      : rain?.forecast?.confidence === "media" ? "text-amber-400"
                      : "text-red-400"
                    }`}>
                      {rain?.forecast?.confidence === "alta" ? "Alta"
                        : rain?.forecast?.confidence === "media" ? "Media"
                        : "Baja"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">EMA 1h</span>
                    <span className="font-bold text-white">{rain?.forecast?.nextHour_mm ?? "—"} mm/h</span>
                  </div>
                  {(rain?.stats?.dryStreak ?? 0) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Horas secas</span>
                      <span className="font-bold text-emerald-400">{rain!.stats!.dryStreak}h seguidas</span>
                    </div>
                  )}
                  {(rain?.stats?.wetStreak ?? 0) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Horas lluvia</span>
                      <span className="font-bold text-red-400">{rain!.stats!.wetStreak}h seguidas</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Alerta lluvia continua ── */}
        {(rain?.stats?.wetStreak ?? 0) >= 4 && (
          <div className="rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-3">
            <p className="text-xs font-semibold text-red-300 uppercase tracking-wide">Alerta por lluvia continua</p>
            <p className="text-sm text-red-100 mt-1">
              Se registran <strong>{rain?.stats?.wetStreak} horas seguidas de lluvia</strong>. No se recomienda entrar al cañón hasta que baje el caudal.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wide">Horario seguro en cañón</p>
          <p className="text-sm text-amber-100 mt-1">
            Recomendación operativa: permanecer dentro del cañón solo entre <strong>7:00 a.m. y 4:00 p.m.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={`rounded-2xl border px-4 py-3 ${reliabilityTone}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide">Confiabilidad de datos</p>
              <ShieldCheck size={14} />
            </div>
            <p className="text-sm font-bold mt-1">{rain?.reliability?.level?.toUpperCase() ?? "SIN DATO"} · {rain?.reliability?.score ?? "—"}/100</p>
            <p className="text-xs mt-1 opacity-90">{rain?.reliability?.reason ?? "Sin evaluación disponible."}</p>
          </div>

          <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-cyan-100">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide">Nivel actual Río La Vieja (Sucre)</p>
              <RiverIcon size={14} className={rain?.riverLevel?.status === "critico" ? "text-red-300" : "text-cyan-300"} />
            </div>
            <p className="text-lg font-black mt-1 tabular-nums">{rain?.riverLevel?.estimatedLevelM?.toFixed(2) ?? "—"} m</p>
            <p className="text-xs opacity-90">{rain?.riverLevel?.label ?? "Sin estimación"} · Ref. estación: {rain?.riverLevel?.referenceMm ?? "—"} mm</p>
            <p className="text-xs mt-1 opacity-80">{rain?.riverLevel?.guidance ?? ""}</p>
          </div>
        </div>

        {/* ═══ MENSAJE DIVERTIDO (IA) ══════════════════════════════════════════ */}
        <WeatherMessage snap={weatherSnap} />

        {/* ═══ LLUVIA · ÚLTIMAS 12H ════════════════════════════════════════════ */}
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

        {/* ═══ TEMPERATURA & HUMEDAD · 12H ════════════════════════════════════ */}
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

        {/* ═══ RIESGO ACUMULADO (rolling) ══════════════════════════════════════ */}
        <CollapsibleSection title="Riesgo acumulado · últimas 24h" icon={Activity} badge="rolante">
          {riskChart.length > 0 ? (
            <>
              <p className="text-xs text-zinc-500 mb-3">
                Acumulación de lluvia en ventanas de 3h y 6h. Rojo = riesgo de crecida.
              </p>
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
                <span className="flex items-center gap-1">
                  <span className="w-4 h-0.5 bg-orange-500 inline-block" /> Acum. 3h (alerta &gt;10mm)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-4 h-0.5 bg-red-500 inline-block" /> Acum. 6h (alerta &gt;20mm)
                </span>
              </div>
            </>
          ) : (
            <p className="text-xs text-zinc-600">Sin datos de riesgo disponibles.</p>
          )}
        </CollapsibleSection>

        {/* ═══ PRONÓSTICO · MÉTODOS ENSEMBLE ══════════════════════════════════ */}
        <CollapsibleSection title="Pronóstico · métodos ensemble" icon={TrendingUp}>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-400">Consenso de todos los métodos</span>
              <span className="text-xl font-black text-teal-300">
                {rain?.forecast?.consensusMm ?? "—"}{" "}
                <span className="text-xs font-normal text-zinc-500">mm/h estimado</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Confianza:{" "}
                <strong className={
                  rain?.forecast?.confidence === "alta" ? "text-emerald-400"
                  : rain?.forecast?.confidence === "media" ? "text-amber-400"
                  : "text-red-400"
                }>
                  {rain?.forecast?.confidence}
                </strong>
              </span>
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

        {/* ═══ LLUVIA DIARIA · ÚLTIMOS 7 DÍAS ═════════════════════════════════ */}
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
          ) : (
            <p className="text-xs text-zinc-600">Sin datos diarios.</p>
          )}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <StatPill label="Hoy (acum.)" value={rain?.currentSnapshot?.sum_lluv_mm ?? "—"} unit="mm" highlight />
            <StatPill label="Ayer total" value={rain?.currentSnapshot?.lluv_ayer_mm ?? "—"} unit="mm" />
            <StatPill label="Pico 24h" value={rain?.stats?.peakHour24h?.mm ?? "—"} unit="mm" />
          </div>
        </CollapsibleSection>

        {/* ═══ CONTEXTO REGIONAL · OPEN-METEO ═════════════════════════════════ */}
        <CollapsibleSection title="Contexto regional · Open-Meteo" icon={Wind}>
          <p className="text-[10px] text-zinc-600 mb-4">
            Modelo numérico – no observaciones directas. Útil para tendencia regional.
          </p>
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
                ) : (
                  <p className="text-xs text-zinc-600">Sin datos</p>
                )}
                {loc.daily_5d?.length > 0 && (
                  <div className="flex gap-1 mt-3 pt-3 border-t border-white/5">
                    {loc.daily_5d.slice(0, 5).map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <span className="text-[9px] text-zinc-600">{d.date.split("T")[0]}</span>
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

        {/* ═══ RESUMEN ESTADÍSTICO ═════════════════════════════════════════════ */}
        <CollapsibleSection title="Resumen estadístico" icon={Droplets}>
          <div className="grid grid-cols-3 gap-2">
            <StatPill label="Últ. 1h" value={rain?.stats?.last1h_mm ?? "—"} unit="mm" />
            <StatPill label="Últ. 3h" value={rain?.stats?.last3h_mm ?? "—"} unit="mm" highlight />
            <StatPill label="Últ. 6h" value={rain?.stats?.last6h_mm ?? "—"} unit="mm" />
            <StatPill label="Últ. 24h" value={rain?.stats?.last24h_mm ?? "—"} unit="mm" />
            <StatPill label="Últ. 48h" value={rain?.stats?.last48h_mm ?? "—"} unit="mm" />
            <StatPill label="Hrs lluvia/24h" value={rain?.stats?.wetHoursLast24 ?? "—"} unit="h" />
            {rain?.stats?.wetStreak !== undefined && (
              <StatPill label="Racha lluvia" value={rain.stats.wetStreak} unit="h" />
            )}
            {rain?.stats?.dryStreak !== undefined && (
              <StatPill label="Racha seca" value={rain.stats.dryStreak} unit="h" />
            )}
            {rain?.stats?.peakHour24h && (
              <StatPill label="Pico hora" value={rain.stats.peakHour24h.mm} unit="mm" />
            )}
          </div>
        </CollapsibleSection>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
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
