"use client";

import Link from "next/link";
import { MobileBottomNav, SiteHeader } from "@/app/components/navigation/SiteNavigation";
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
  CartesianGrid,
} from "recharts";
import {
  RefreshCw, Droplets, Thermometer, Wind,
  TrendingUp, TrendingDown, Minus, CloudRain, Gauge, Activity,
  ArrowLeft, Waves, AlertOctagon, Umbrella,
  ShieldCheck, MapPin, MessageCircle, CloudSun,
} from "lucide-react";

import { useTiempoData } from "@/lib/hooks/useTiempoData";
import WeatherMessage from "./components/WeatherMessage";
import { PulsingDot } from "./components/PulsingDot";
import { StatPill } from "./components/StatPill";
import { CollapsibleSection } from "./components/CollapsibleSection";
import { CustomBarTooltip } from "./components/CustomBarTooltip";
import { SaturationGauge } from "./components/SaturationGauge";
import { RainHistorySection } from "./components/RainHistorySection";
import { TomorrowMorningSection } from "./components/TomorrowMorningSection";

export default function TourWeatherDashboard() {
  const {
    rain,
    regional,
    loading,
    lastRefresh,
    cooldown,
    fetchAll,
    assessment,
    canyonSchedule,
    saturation,
    rainNarrative,
    morningSlots,
    morningSummary,
    weatherSnap,
    hourlyChart,
    riskChart,
    dailyChart,
    fetchWarning,
  } = useTiempoData();

  const AssessmentIcon = assessment.icon;
  const ScheduleIcon = canyonSchedule.icon;

  const sCarlos = regional?.locations?.find(l => l.id === "san_carlos");
  const zoneNow = sCarlos?.current ?? null;

  const trendIcon = rain?.status?.trend === "subiendo"
    ? <TrendingUp size={14} className="text-red-400" />
    : rain?.status?.trend === "bajando"
      ? <TrendingDown size={14} className="text-emerald-400" />
      : <Minus size={14} className="text-zinc-400" />;

  const crecida = rain?.crecidaRisk;
  const crecidaTone =
    crecida?.level === "critico" ? "text-red-300 border-red-500/35 bg-red-500/10"
    : crecida?.level === "alto" ? "text-amber-300 border-amber-500/35 bg-amber-500/10"
    : crecida?.level === "moderado" ? "text-yellow-200 border-yellow-500/30 bg-yellow-500/10"
    : "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";
  const CrecidaIcon = crecida?.level === "critico" ? AlertOctagon : Waves;

  return (
    <div className="min-h-screen bg-[#0d0f0f] text-white font-sans selection:bg-[#00C4B0]/30">

      <SiteHeader isScrolled />

      <div className="pt-14 md:pt-20">
        <div className="sticky top-14 z-20 border-b border-white/6 bg-[#0d0f0f]/90 backdrop-blur-xl md:top-20">
          <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
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
                  Clima · Río La Vieja
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

        <main className="max-w-5xl mx-auto px-4 py-7 md:px-6 md:py-10">
          <header className="mb-7 max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-[#66ddcf]">
              <CloudSun size={17} />
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Guía local del tiempo</p>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
              Clima y condiciones para su aventura
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
              Una lectura sencilla de lluvia, río y pronóstico en San Carlos. Úsela para prepararse; la decisión final de una actividad en río o cañón siempre la toma el guía en sitio.
            </p>
          </header>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <a href="#ahora" className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#00C4B0]/35 hover:bg-[#00C4B0]/[0.05]">
              <CloudSun size={18} className="mb-3 text-[#00C4B0]" />
              <p className="text-sm font-bold">Condiciones ahora</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Lo esencial para decidir cómo prepararse.</p>
            </a>
            <a href="#manana" className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#00C4B0]/35 hover:bg-[#00C4B0]/[0.05]">
              <Umbrella size={18} className="mb-3 text-[#00C4B0]" />
              <p className="text-sm font-bold">Mañana y 5 días</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Ventanas de salida y tendencia semanal.</p>
            </a>
            <a href="#seguridad" className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#00C4B0]/35 hover:bg-[#00C4B0]/[0.05]">
              <ShieldCheck size={18} className="mb-3 text-[#00C4B0]" />
              <p className="text-sm font-bold">Río y seguridad</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Qué significa el dato para sus planes.</p>
            </a>
          </div>

          <div className="space-y-4">
          {fetchWarning && (
            <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3">
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-wide">Aviso</p>
              <p className="text-sm text-amber-100 mt-1">{fetchWarning}</p>
            </div>
          )}

          {/* ═══ RESUMEN PRINCIPAL ═══════════════════════════════════════════════ */}
          <div id="ahora" className={`relative scroll-mt-40 rounded-3xl border overflow-hidden ${assessment.bg} ${assessment.border} p-5 md:p-7`}>
            <div className={`absolute inset-0 opacity-20 ${
              assessment.level === "go" ? "bg-gradient-to-br from-emerald-500/30 to-transparent"
              : assessment.level === "no" ? "bg-gradient-to-br from-red-500/30 to-transparent"
              : "bg-gradient-to-br from-amber-500/30 to-transparent"
            } pointer-events-none`} />

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold mb-1.5">
                    Lectura rápida · San Carlos
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <AssessmentIcon size={22} className={assessment.color} strokeWidth={2} />
                    <h2 className={`text-2xl font-black ${assessment.color}`}>{assessment.title}</h2>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{assessment.subtitle}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-4xl font-black tabular-nums ${assessment.color}`}>
                    {rain?.stats?.last3h_mm?.toFixed(1) ?? "—"}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">mm · 3h</div>
                </div>
              </div>

              <SaturationGauge saturation={saturation} />

              {zoneNow && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-xl bg-black/25 border border-white/8 px-3 py-3">
                    <Thermometer size={12} className="text-orange-300 mx-auto mb-1" />
                    <p className="text-center text-base font-bold">{Math.round(zoneNow.temp_c)}°C</p>
                    <p className="mt-0.5 text-center text-[10px] text-zinc-500">Temperatura</p>
                  </div>
                  <div className="rounded-xl bg-black/25 border border-white/8 px-3 py-3">
                    <Droplets size={12} className="text-blue-300 mx-auto mb-1" />
                    <p className="text-center text-base font-bold">{Math.round(zoneNow.hr_pct)}%</p>
                    <p className="mt-0.5 text-center text-[10px] text-zinc-500">Humedad</p>
                  </div>
                  <div className="rounded-xl bg-black/25 border border-white/8 px-3 py-3">
                    <Wind size={12} className="text-teal-300 mx-auto mb-1" />
                    <p className="text-center text-base font-bold">{Math.round(zoneNow.wind_kmh)} km/h</p>
                    <p className="mt-0.5 text-center text-[10px] text-zinc-500">Viento</p>
                  </div>
                  <div className="rounded-xl bg-black/25 border border-white/8 px-3 py-3">
                    <Umbrella size={12} className="text-sky-300 mx-auto mb-1" />
                    <p className="text-center text-base font-bold">
                      {zoneNow.precip_prob_next3h != null ? `${zoneNow.precip_prob_next3h}%` : "—"}
                    </p>
                    <p className="mt-0.5 text-center text-[10px] text-zinc-500">Lluvia · próx. 3h</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Horario del cañón — informativo, no bloquea datos */}
          <div className={`rounded-2xl border px-4 py-3 ${canyonSchedule.bg} ${canyonSchedule.border}`}>
            <div className="flex items-start gap-3">
              <ScheduleIcon size={16} className={`${canyonSchedule.color} mt-0.5 shrink-0`} />
              <div>
                <p className={`text-sm font-bold ${canyonSchedule.color}`}>{canyonSchedule.message}</p>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{canyonSchedule.detail}</p>
              </div>
            </div>
          </div>

          {(rain?.stats?.wetStreak ?? 0) >= 4 && (
            <div className="rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-3">
              <p className="text-xs font-semibold text-red-300 uppercase tracking-wide">Alerta</p>
              <p className="text-sm text-red-100 mt-1">
                <strong>{rain?.stats?.wetStreak} horas seguidas de lluvia.</strong> El río puede seguir subiendo aunque ahora parezca calmado.
              </p>
            </div>
          )}

          {/* Riesgo de crecida simplificado */}
          <div id="seguridad" className={`scroll-mt-40 rounded-2xl border px-4 py-4 ${crecidaTone}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide">Río La Vieja · crecida estimada</p>
              <CrecidaIcon size={15} />
            </div>
            <p className="text-lg font-black mt-1">{crecida?.label ?? "Sin estimación"}</p>
            <p className="text-xs mt-1 leading-5 opacity-90">{crecida?.guidance ?? ""}</p>
            <p className="mt-3 border-t border-current/15 pt-3 text-[11px] leading-5 opacity-75">
              Esta estimación orienta, pero no confirma una salida. El nivel real del río, el terreno y la valoración del guía mandan.
            </p>
          </div>

          {/* ═══ CÓMO HA LLOVIDO ═══════════════════════════════════════════════ */}
          <RainHistorySection narrative={rainNarrative} chartData={hourlyChart} />

          {/* ═══ MAÑANA 7 / 8 / 9 AM ═══════════════════════════════════════════ */}
          <div id="manana" className="scroll-mt-40">
            <TomorrowMorningSection slots={morningSlots} summary={morningSummary} />
          </div>

          {/* Mensaje vacilón */}
          <WeatherMessage snap={weatherSnap} />

          {/* ═══ PRONÓSTICO 5 DÍAS (simple) ════════════════════════════════════ */}
          {sCarlos?.daily_5d && sCarlos.daily_5d.length > 0 && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
              <p className="text-xs font-bold text-zinc-300 uppercase tracking-wide mb-3">
                Próximos días · San Carlos
              </p>
              <div className="flex gap-1.5">
                {sCarlos.daily_5d.slice(0, 5).map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 rounded-xl bg-black/25 border border-white/6 py-2.5 px-1">
                    <span className="text-[9px] text-zinc-500">
                      {i === 0 ? "Hoy" : i === 1 ? "Mañana" : new Date(d.date).toLocaleDateString("es-CR", { weekday: "short" }).replace(".", "")}
                    </span>
                    <span className="text-lg leading-none">{d.weather_icon}</span>
                    <span className="text-[10px] text-zinc-300 font-bold">{Math.round(d.temp_max_c)}°</span>
                    <span className="text-[9px] text-teal-300 font-semibold">
                      {d.precip_prob_max != null ? `${d.precip_prob_max}%` : `${d.precip_sum_mm}mm`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ DETALLES TÉCNICOS (colapsable) ══════════════════════════════════ */}
          <CollapsibleSection title="Más detalles técnicos" icon={Gauge}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-black/30 border border-white/8 p-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Lluvia reciente</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Última hora</span>
                    <span className="font-bold">{rain?.stats?.last1h_mm ?? "—"} mm</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">6 horas</span>
                    <span className="font-bold">{rain?.stats?.last6h_mm ?? "—"} mm</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">24 horas</span>
                    <span className="font-bold">{rain?.stats?.last24h_mm ?? "—"} mm</span>
                  </div>
                  <div className="flex justify-between text-xs items-center">
                    <span className="text-zinc-400">Tendencia</span>
                    <span className="flex items-center gap-1 font-bold">{trendIcon} {rain?.status?.trend ?? "—"}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-black/30 border border-white/8 p-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Rachas</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Horas lluvia/24h</span>
                    <span className="font-bold">{rain?.stats?.wetHoursLast24 ?? "—"} h</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Racha lluvia</span>
                    <span className="font-bold">{rain?.stats?.wetStreak ?? "—"} h</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Racha seca</span>
                    <span className="font-bold">{rain?.stats?.dryStreak ?? "—"} h</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Pico 24h</span>
                    <span className="font-bold">{rain?.stats?.peakHour24h?.mm ?? "—"} mm</span>
                  </div>
                </div>
              </div>

              {dailyChart.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide flex items-center gap-1">
                    <CloudRain size={12} /> Lluvia diaria · 7 días
                  </p>
                  <ResponsiveContainer width="100%" height={100} minWidth={1} minHeight={1}>
                    <BarChart data={dailyChart} barSize={24} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
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
                </div>
              )}

              {riskChart.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide flex items-center gap-1">
                    <Activity size={12} /> Riesgo acumulado 24h
                  </p>
                  <ResponsiveContainer width="100%" height={110} minWidth={1} minHeight={1}>
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
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <StatPill label="Últ. 48h" value={rain?.stats?.last48h_mm ?? "—"} unit="mm" />
                <StatPill label="Hoy (acum.)" value={rain?.currentSnapshot?.sum_lluv_mm ?? "—"} unit="mm" />
                <StatPill label="Ayer total" value={rain?.currentSnapshot?.lluv_ayer_mm ?? "—"} unit="mm" />
              </div>
            </div>
          </CollapsibleSection>

          <section className="rounded-3xl border border-white/10 bg-[#2E2A25]/45 p-5 md:flex md:items-center md:justify-between md:gap-6">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-[#00C4B0]" />
              <div>
                <h2 className="text-sm font-bold">¿Su tour depende del río?</h2>
                <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-400">Escríbanos antes de salir. Allan o Verónica le confirman la condición operativa real, sin adivinar disponibilidad ni poner la aventura por encima de la seguridad.</p>
              </div>
            </div>
            <Link href="/reservar" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-full bg-[#00C4B0] px-4 py-2.5 text-xs font-black text-[#16211f] transition hover:bg-[#66ddcf] md:mt-0">
              <MessageCircle size={15} /> Consultar al equipo
            </Link>
          </section>

          {rain?.meta && (
            <p className="text-[10px] text-zinc-700 text-center pb-4 leading-relaxed px-4">
              {rain.meta.note}<br />
              Fuente lluvia: {rain.meta.station} · Pronóstico: Open-Meteo · {new Date(rain.meta.fetchedAt).toLocaleString("es-CR")}
            </p>
          )}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
