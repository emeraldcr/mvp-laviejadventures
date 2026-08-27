"use client";

import Link from "next/link";
import { MobileBottomNav, SiteHeader } from "@/app/components/navigation/SiteNavigation";
import {
  BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  RefreshCw, CloudRain, Gauge,
  ArrowLeft, Waves, MapPin, MessageCircle, CloudSun,
  CalendarClock, Clock,
} from "lucide-react";

import { useTiempoData } from "@/lib/hooks/useTiempoData";
import WeatherMessage from "./components/WeatherMessage";
import { PulsingDot } from "./components/PulsingDot";
import { CollapsibleSection } from "./components/CollapsibleSection";
import { CustomBarTooltip } from "./components/CustomBarTooltip";
import { RainHistorySection } from "./components/RainHistorySection";
import { RiverTourImpactSection } from "./components/RiverTourImpactSection";
import { StationInfoSection } from "./components/StationInfoSection";
import { StationHealthBadge } from "./components/StationHealthBadge";
import { NowModule } from "./components/v2/NowModule";
import { TomorrowModule } from "./components/v2/TomorrowModule";
import { RiverModule } from "./components/v2/RiverModule";

export default function TourWeatherDashboard() {
  const {
    rain,
    regional,
    loading,
    lastRefresh,
    cooldown,
    fetchAll,
    canyonSchedule,
    rainNarrative,
    weatherSnap,
    riskChart,
    dailyChart,
    accumulationSeries,
    tourImpacts,
    stationHealth,
    baseline,
    model,
    fetchWarning,
  } = useTiempoData();

  const rainWindows = [
    { label: "1 h", mm: rain?.stats?.last1h_mm ?? 0 },
    { label: "3 h", mm: rain?.stats?.last3h_mm ?? 0 },
    { label: "6 h", mm: rain?.stats?.last6h_mm ?? 0 },
    { label: "24 h", mm: rain?.stats?.last24h_mm ?? 0 },
    { label: "48 h", mm: rain?.stats?.last48h_mm ?? 0 },
  ];

  const ScheduleIcon = canyonSchedule.icon;
  const sCarlos = regional?.locations?.find((l) => l.id === "san_carlos");
  const zoneNow = sCarlos?.current ?? null;

  return (
    <div className="min-h-screen bg-[#0d0f0f] text-white font-sans selection:bg-[#00C4B0]/30">
      <SiteHeader isScrolled />

      <div className="pt-14 md:pt-20">
        <div className="sticky top-14 z-20 border-b border-white/6 bg-[#0d0f0f]/90 backdrop-blur-xl md:top-20">
          <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors group">
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-xs font-semibold">Inicio</span>
              </Link>
              <div className="flex items-center gap-2">
                <PulsingDot color={loading ? "bg-zinc-500" : "bg-emerald-500"} />
                <span className="hidden sm:block text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Clima · Río La Vieja
                </span>
              </div>
              <StationHealthBadge health={stationHealth} compact />
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
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Guía local del tiempo · v2.0</p>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
              Clima, río y pronóstico para su aventura
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
              Tres lecturas, cada una con su nivel de confianza: cómo está{" "}
              <strong className="text-zinc-200">ahora</strong>, cómo se ve{" "}
              <strong className="text-zinc-200">mañana hora por hora</strong> y el{" "}
              <strong className="text-zinc-200">nivel del río</strong> en el tramo del tour. La fuente
              primaria es el pluviómetro del IMN en la cuenca alta; todo lo demás entra como apoyo
              secundario. La decisión final de una salida la toma el guía en sitio.
            </p>
          </header>

          {/* Índice de navegación */}
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a href="#ahora" className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#00C4B0]/35 hover:bg-[#00C4B0]/[0.05]">
              <CloudSun size={18} className="mb-3 text-[#00C4B0]" />
              <p className="text-sm font-bold">1 · Ahora</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Lluvia medida y estado de la cuenca.</p>
            </a>
            <a href="#manana" className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#00C4B0]/35 hover:bg-[#00C4B0]/[0.05]">
              <CalendarClock size={18} className="mb-3 text-[#00C4B0]" />
              <p className="text-sm font-bold">2 · Mañana</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Pronóstico hora por hora, con banda.</p>
            </a>
            <a href="#rio" className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#00C4B0]/35 hover:bg-[#00C4B0]/[0.05]">
              <Waves size={18} className="mb-3 text-[#00C4B0]" />
              <p className="text-sm font-bold">3 · Nivel del río</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Índice de caudal y proyección 30 h.</p>
            </a>
            <a href="#estacion" className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#00C4B0]/35 hover:bg-[#00C4B0]/[0.05]">
              <Gauge size={18} className="mb-3 text-[#00C4B0]" />
              <p className="text-sm font-bold">La estación IMN</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Qué mide, qué no, y qué tan fresca está.</p>
            </a>
          </div>

          <div className="space-y-4">
            {fetchWarning && (
              <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3">
                <p className="text-xs font-semibold text-amber-300 uppercase tracking-wide">Aviso</p>
                <p className="text-sm text-amber-100 mt-1">{fetchWarning}</p>
              </div>
            )}

            {(rain?.stats?.wetStreak ?? 0) >= 4 && (
              <div className="rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-3">
                <p className="text-xs font-semibold text-red-300 uppercase tracking-wide">Alerta</p>
                <p className="text-sm text-red-100 mt-1">
                  <strong>{rain?.stats?.wetStreak} horas seguidas de lluvia.</strong> El río puede seguir
                  subiendo aunque ahora parezca calmado.
                </p>
              </div>
            )}

            {/* ═══ LOS 3 MÓDULOS ═══════════════════════════════════════════════ */}
            {model && rain ? (
              <>
                <NowModule
                  model={model}
                  rain={rain}
                  zoneNow={zoneNow}
                  lastUpdateISO={rain.meta?.lastUpdateISO}
                />
                <TomorrowModule model={model} />
                <RiverModule model={model} />
              </>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
                <p className="text-sm text-zinc-400">
                  {loading
                    ? "Cargando datos de la estación IMN…"
                    : "La estación IMN no tiene suficientes lecturas para el modelo en este momento. Reintente en unos minutos."}
                </p>
              </div>
            )}

            {/* Horario del cañón */}
            <div className={`rounded-2xl border px-4 py-3 ${canyonSchedule.bg} ${canyonSchedule.border}`}>
              <div className="flex items-start gap-3">
                <ScheduleIcon size={16} className={`${canyonSchedule.color} mt-0.5 shrink-0`} />
                <div>
                  <p className={`text-sm font-bold ${canyonSchedule.color}`}>{canyonSchedule.message}</p>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{canyonSchedule.detail}</p>
                </div>
              </div>
            </div>

            {/* ═══ IMPACTO EN LOS TOURS DE RÍO ═══════════════════════════════ */}
            <div id="tours" className="scroll-mt-40">
              <RiverTourImpactSection impacts={tourImpacts} />
            </div>

            {/* ═══ CÓMO HA LLOVIDO (histórico) ══════════════════════════════ */}
            <div id="lluvia" className="scroll-mt-40">
              <RainHistorySection
                narrative={rainNarrative}
                accumulationSeries={accumulationSeries}
                riskChart={riskChart}
                baseline={baseline}
                windows={rainWindows}
                todayMm={rain?.currentSnapshot?.sum_lluv_mm ?? 0}
                yesterdayMm={rain?.currentSnapshot?.lluv_ayer_mm ?? 0}
              />
            </div>

            {/* Mensaje vacilón */}
            <WeatherMessage snap={weatherSnap} />

            {/* ═══ PRONÓSTICO 5 DÍAS (contexto secundario) ══════════════════ */}
            {sCarlos?.daily_5d && sCarlos.daily_5d.length > 0 && (() => {
              const days = sCarlos.daily_5d.slice(0, 5);
              const maxMm = Math.max(1, ...days.map((d) => d.precip_sum_mm ?? 0));
              return (
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <p className="text-xs font-bold text-zinc-300 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Clock size={12} /> Próximos días · San Carlos
                  </p>
                  <p className="text-[10px] text-zinc-600 mb-3">
                    Base secundaria (Open-Meteo). Contexto, no sustituye la estación.
                  </p>
                  <div className="flex gap-1.5">
                    {days.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 rounded-xl bg-black/25 border border-white/6 py-2.5 px-1">
                        <span className="text-[9px] text-zinc-500">
                          {i === 0 ? "Hoy" : i === 1 ? "Mañana" : new Date(d.date).toLocaleDateString("es-CR", { weekday: "short" }).replace(".", "")}
                        </span>
                        <span className="text-lg leading-none">{d.weather_icon}</span>
                        <span className="text-[10px] text-zinc-300 font-bold">{Math.round(d.temp_max_c)}°</span>
                        <span className="text-[9px] text-teal-300 font-semibold">
                          {d.precip_prob_max != null ? `${d.precip_prob_max}%` : "—"}
                        </span>
                        <div className="mt-0.5 h-8 w-1.5 rounded-full bg-white/6 flex flex-col justify-end overflow-hidden">
                          <div
                            className="w-full rounded-full bg-sky-400/70"
                            style={{ height: `${Math.round(((d.precip_sum_mm ?? 0) / maxMm) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[8px] text-zinc-500 tabular-nums">{(d.precip_sum_mm ?? 0).toFixed(0)} mm</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ═══ LA ESTACIÓN ══════════════════════════════════════════════ */}
            <StationInfoSection health={stationHealth} stationName={rain?.meta?.station} />

            {/* ═══ SUPUESTOS DEL MODELO ═════════════════════════════════════ */}
            {model && (
              <CollapsibleSection title="Supuestos y límites del modelo" icon={Gauge}>
                <ul className="space-y-2 text-xs leading-5 text-zinc-400">
                  {model.assumptions.map((a, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                      <span>{a}</span>
                    </li>
                  ))}
                  <li className="flex gap-2 text-zinc-600">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-700" />
                    <span>Motor generado {new Date(model.generatedAtISO).toLocaleString("es-CR")}.</span>
                  </li>
                </ul>
              </CollapsibleSection>
            )}

            {/* ═══ DETALLES TÉCNICOS ═══════════════════════════════════════ */}
            <CollapsibleSection title="Más detalles técnicos" icon={Gauge}>
              <div className="space-y-4">
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
                <p className="text-[10px] text-zinc-600 leading-4">
                  La curva de acumulación 48 h y las ventanas móviles de 3 h / 6 h están en la
                  sección <a href="#lluvia" className="text-zinc-400 hover:underline">Cómo ha llovido</a>.
                </p>
              </div>
            </CollapsibleSection>

            <section className="rounded-3xl border border-white/10 bg-[#2E2A25]/45 p-5 md:flex md:items-center md:justify-between md:gap-6">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#00C4B0]" />
                <div>
                  <h2 className="text-sm font-bold">¿Su tour depende del río?</h2>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-400">
                    Escríbanos antes de salir. Allan o Verónica le confirman la condición operativa real,
                    sin adivinar disponibilidad ni poner la aventura por encima de la seguridad.
                  </p>
                </div>
              </div>
              <Link href="/reservar" className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-full bg-[#00C4B0] px-4 py-2.5 text-xs font-black text-[#16211f] transition hover:bg-[#66ddcf] md:mt-0">
                <MessageCircle size={15} /> Consultar al equipo
              </Link>
            </section>

            {rain?.meta && (
              <p className="text-[10px] text-zinc-700 text-center pb-4 leading-relaxed px-4">
                {rain.meta.note}<br />
                Fuente primaria: {rain.meta.station} · Base secundaria: Open-Meteo (San Carlos) ·{" "}
                {new Date(rain.meta.fetchedAt).toLocaleString("es-CR")}
              </p>
            )}
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
