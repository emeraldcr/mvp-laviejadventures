// app/dashboard/page.tsx
import { Suspense } from "react";
import RainStatusCard from "./components/RainStatusCard";
import HourlyRainChart from "./components/HourlyRainChart";
import AccumulationStats from "./components/AccumulationStats";
import LastUpdate from "./components/LastUpdate";
import LoadingSkeleton from "./components/LoadingSkeleton";

export const revalidate = 300; // ISR cada 5 minutos (como el cache del API)
export const dynamic = "force-dynamic"; // o "auto" si prefieres

export const metadata = {
  title: "Dashboard Lluvia Río La Vieja | La Vieja Adventures",
  description: "Monitoreo en tiempo real de lluvia y riesgo de crecida en Montaña Sagrada – ideal para tours en río.",
};

async function fetchRainData() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/tiempo?hours=48`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error("Error al cargar datos de lluvia");
  return res.json();
}

export default async function DashboardPage() {
  let data;
  let error = null;

  try {
    data = await fetchRainData();
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Dashboard Lluvia – Río La Vieja
          </h1>
          <p className="text-lg text-slate-300">
            Monitoreo en tiempo real – Reserva Montaña Sagrada (IMN)
          </p>
        </header>

        {error ? (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-6 rounded-xl text-center">
            <p className="text-xl font-semibold mb-2">¡Ups! No pudimos cargar los datos</p>
            <p>{error}</p>
            <p className="mt-4 text-sm">Intenta de nuevo en unos minutos o revisa tu conexión.</p>
          </div>
        ) : (
          <Suspense fallback={<LoadingSkeleton />}>
            <DashboardContent data={data} />
          </Suspense>
        )}
      </div>
    </main>
  );
}

function DashboardContent({ data }: { data: any }) {
  if (!data?.success) {
    return <div className="text-center text-red-400">Datos no disponibles</div>;
  }

  const { status, now, stats, forecast, meta } = data;

  return (
    <>
      <LastUpdate lastUpdateISO={meta.lastUpdateISO} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <RainStatusCard
          risk={status.risk}
          riskLabel={status.riskLabel}
          riskEmoji={status.riskEmoji}
          intensity={status.intensity}
          lastHour_mm={status.lastHour_mm}
          trend={status.trend}
        />

        <div className="lg:col-span-2">
          <AccumulationStats stats={stats} forecast={forecast} />
        </div>
      </div>

      <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          Lluvia horaria (últimas 48 h)
        </h2>
        <HourlyRainChart hourly={data.data.hourly} />
      </div>

      <footer className="mt-12 text-center text-sm text-slate-500">
        <p>Fuente: {meta.source} • Última actualización: {new Date(meta.fetchedAt).toLocaleString("es-CR")}</p>
        <p className="mt-2">{meta.note}</p>
      </footer>
    </>
  );
}