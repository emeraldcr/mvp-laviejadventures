import { Suspense } from "react";
import RainStatusCard      from "./components/RainStatusCard";
import HourlyRainChart     from "./components/HourlyRainChart";
import AccumulationStats   from "./components/AccumulationStats";
import LastUpdate          from "./components/LastUpdate";
import LoadingSkeleton     from "./components/LoadingSkeleton";
import DailyRainBarChart   from "./components/DailyRainBarChart";
import ForecastPanel       from "./components/ForecastPanel";
import RollingRiskChart    from "./components/RollingRiskChart";
import WeatherMetricsPanel from "./components/WeatherMetricsPanel";
import RegionalWeatherPanel from "./components/RegionalWeatherPanel";
import type { DashboardApiResponse } from "@/lib/types";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard Lluvia Río La Vieja | La Vieja Adventures",
  description:
    "Monitoreo en tiempo real de lluvia y riesgo de crecida – Estación Montaña Sagrada (IMN). Clima regional San Carlos, Juan Castro Blanco, San José de la Montaña, El Congo.",
};

async function fetchRainData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  // Request all available hours (up to 120) so the chart shows the full table
  const res = await fetch(`${base}/api/tiempo?hours=120&days=14`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return res.json();
}

async function fetchRegionalData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/tiempo/regional`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  let apiData = null;
  let regionalData = null;
  let error: string | null = null;

  try {
    [apiData, regionalData] = await Promise.all([
      fetchRainData(),
      fetchRegionalData(),
    ]);
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : "No se pudieron cargar los datos del IMN";
    console.error("[Dashboard]", err);
    // Still try regional data independently if IMN fails
    try {
      regionalData = await fetchRegionalData();
    } catch {
      // silently ignore
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <header className="text-center mb-10 md:mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Dashboard Lluvia – Río La Vieja
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Monitoreo en tiempo real – Estación Automática Montaña Sagrada (IMN)
          </p>
        </header>

        {error ? (
          <div className="bg-red-950/60 border border-red-600/50 rounded-2xl p-8 text-center shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-red-300 mb-4">¡Problema al cargar datos IMN!</h2>
            <p className="text-slate-200 mb-4">{error}</p>
            <p className="text-sm text-slate-400">
              Intenta refrescar la página en unos minutos. Los datos se actualizan cada 5 minutos.
            </p>
          </div>
        ) : (
          <Suspense fallback={<LoadingSkeleton />}>
            <DashboardContent data={apiData} />
          </Suspense>
        )}

        {/* Regional weather – shown regardless of IMN status */}
        {regionalData?.success && regionalData.locations?.length > 0 && (
          <RegionalWeatherPanel
            locations={regionalData.locations}
            fetchedAt={regionalData.fetchedAt}
          />
        )}
      </div>
    </main>
  );
}

function DashboardContent({ data }: { data: DashboardApiResponse }) {
  if (!data?.success) {
    return (
      <div className="text-center py-12 text-red-400 text-xl">
        Datos no disponibles en este momento
      </div>
    );
  }

  const { status, stats, forecast, weather, analysis, meta, data: payload, currentSnapshot } = data;

  return (
    <>
      <LastUpdate lastUpdateISO={meta.lastUpdateISO} />

      {/* ── Row 1: Status card + Accumulation stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
        <RainStatusCard
          risk={status.risk}
          riskLabel={status.riskLabel}
          riskEmoji={status.riskEmoji}
          intensity={status.intensity}
          lastHour_mm={status.lastHour_mm}
          trend={status.trend}
        />
        <div className="lg:col-span-2">
          <AccumulationStats
            last1h={stats.last1h_mm}
            last3h={stats.last3h_mm}
            last6h={stats.last6h_mm}
            last24h={stats.last24h_mm}
            last48h={stats.last48h_mm}
            todayAccum={currentSnapshot?.sum_lluv_mm?.toFixed(2) ?? "—"}
            yesterday={currentSnapshot?.lluv_ayer_mm?.toFixed(2) ?? "—"}
            forecastNextHour={forecast.nextHour_mm}
            confidence={forecast.confidence}
            wetHoursLast24={stats.wetHoursLast24 ?? 0}
            wetStreak={stats.wetStreak ?? 0}
            dryStreak={stats.dryStreak ?? 0}
            peakHour24h={stats.peakHour24h ?? { mm: 0, fecha: "—" }}
          />
        </div>
      </div>

      {/* ── Row 2: Forecast methods panel ── */}
      {forecast.methods && (
        <div className="mb-8">
          <ForecastPanel
            methods={forecast.methods}
            consensusMm={forecast.consensusMm ?? forecast.nextHour_mm}
            confidence={forecast.confidence}
          />
        </div>
      )}

      {/* ── Row 3: Weather metrics (only if station has temp/HR data) ── */}
      {weather?.hasData && (
        <div className="mb-8">
          <WeatherMetricsPanel metrics={weather} />
        </div>
      )}

      {/* ── Row 4: Hourly rain chart – all available hours ── */}
      <section className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2 flex items-center gap-3">
          Lluvia horaria
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Barras = lluvia cada hora · Línea = acumulado progresivo ·{" "}
          <span className="text-cyan-400 font-medium">{payload.hourly.length} horas disponibles</span>
          {" "}(estación Montaña Sagrada)
        </p>
        <HourlyRainChart hourly={payload.hourly} />
      </section>

      {/* ── Row 5: Rolling risk chart ── */}
      {analysis?.rollingRisk?.length > 0 && (
        <section className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">
            Riesgo de crecida — evolución (24h)
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Acumulados móviles de 3h y 6h con umbrales de alerta. Cuando la línea cruza los umbrales, el riesgo se activa.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-center text-xs">
            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
              <p className="text-yellow-300 font-semibold">3h &ge; 10 mm</p>
              <p className="text-slate-400 mt-0.5">Precaución</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
              <p className="text-red-300 font-semibold">3h &ge; 20 mm</p>
              <p className="text-slate-400 mt-0.5">Riesgo alto</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
              <p className="text-yellow-300 font-semibold">6h &ge; 18 mm</p>
              <p className="text-slate-400 mt-0.5">Precaución</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
              <p className="text-red-300 font-semibold">6h &ge; 35 mm</p>
              <p className="text-slate-400 mt-0.5">Riesgo alto</p>
            </div>
          </div>
          <RollingRiskChart data={analysis.rollingRisk} />
        </section>
      )}

      {/* ── Row 6: Daily bar chart ── */}
      {payload.daily?.length > 0 && (
        <section className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">
            Historial diario (7 a.m. – 7 a.m.)
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Últimos {Math.min(14, payload.daily.length)} días ·
            <span className="text-sky-400 ml-1">azul claro</span> = traza,
            <span className="text-blue-400 ml-1">azul</span> = moderado (&ge;5 mm),
            <span className="text-amber-400 ml-1">ámbar</span> = intenso (&ge;20 mm),
            <span className="text-red-400 ml-1">rojo</span> = extremo (&ge;50 mm)
          </p>
          <DailyRainBarChart daily={payload.daily} />

          {/* Exact values table */}
          <div className="overflow-x-auto mt-6 border-t border-slate-700 pt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600 bg-slate-700/40">
                  <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                  <th className="text-right py-3 px-4 font-semibold">Lluvia (mm)</th>
                </tr>
              </thead>
              <tbody>
                {payload.daily.slice(0, 14).map((day, i: number) => (
                  <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">{day.fecha}</td>
                    <td className="text-right py-3 px-4 font-medium">{day.lluvia_mm.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="text-center text-sm text-slate-500 mt-4 mb-8">
        <p>
          Fuente IMN:{" "}
          <a
            href={meta.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            {meta.station}
          </a>
          {" · "}Última actualización:{" "}
          {new Date(meta.fetchedAt).toLocaleString("es-CR", { timeZone: "America/Costa_Rica" })}
          {" · "}
          <span className="text-cyan-400">{data.counts?.hourlyAvailable ?? "?"} filas horarias disponibles</span>
        </p>
        <p className="mt-2 italic">{meta.note}</p>
        <p className="mt-2 text-xs opacity-70">
          Datos preliminares – sin control de calidad oficial del IMN. Uso bajo responsabilidad propia.
        </p>
      </footer>
    </>
  );
}
