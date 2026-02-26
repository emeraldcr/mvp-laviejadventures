import { Thermometer, Droplets } from "lucide-react";
import type { WeatherMetrics } from "@/types";

export default function WeatherMetricsPanel({ metrics }: { metrics: WeatherMetrics }) {
  if (!metrics.hasData) return null;

  const tempCards = [
    { label: "Temp. promedio",  value: metrics.avgTemp24h, unit: "°C", color: "text-orange-300", icon: <Thermometer className="w-5 h-5 text-orange-400" /> },
    { label: "Temp. máxima",    value: metrics.maxTemp24h, unit: "°C", color: "text-red-300",    icon: <Thermometer className="w-5 h-5 text-red-400"    /> },
    { label: "Temp. mínima",    value: metrics.minTemp24h, unit: "°C", color: "text-blue-300",   icon: <Thermometer className="w-5 h-5 text-blue-400"   /> },
    { label: "Humedad prom.",   value: metrics.avgHR24h,   unit: "%",  color: "text-cyan-300",   icon: <Droplets    className="w-5 h-5 text-cyan-400"   /> },
    { label: "Humedad máx.",    value: metrics.maxHR24h,   unit: "%",  color: "text-teal-300",   icon: <Droplets    className="w-5 h-5 text-teal-400"   /> },
    { label: "Humedad mín.",    value: metrics.minHR24h,   unit: "%",  color: "text-sky-300",    icon: <Droplets    className="w-5 h-5 text-sky-400"    /> },
  ].filter((c) => c.value !== null);

  if (tempCards.length === 0) return null;

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl md:text-2xl font-semibold mb-6 text-slate-200">
        Temperatura y Humedad — últimas 24h
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {tempCards.map((card, i) => (
          <div
            key={i}
            className="bg-slate-900/50 rounded-xl p-4 text-center border border-slate-700/70 hover:border-slate-600 transition-all"
          >
            <div className="flex justify-center mb-2">{card.icon}</div>
            <p className="text-xs text-slate-400 mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>
              {typeof card.value === "number" ? card.value.toFixed(1) : card.value}
              <span className="text-base font-normal ml-0.5">{card.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
