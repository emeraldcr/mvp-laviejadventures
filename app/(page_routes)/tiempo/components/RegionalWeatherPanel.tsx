"use client";

import { Thermometer, Droplets, Wind, CloudRain, MapPin, Calendar } from "lucide-react";
import type { LocationWeather, RegionalWeatherPanelProps } from "@/lib/types";

// Day-of-week in Spanish
function dayLabel(dateStr: string, index: number): string {
  if (index === 0) return "Hoy";
  if (index === 1) return "Mañana";
  try {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-CR", { weekday: "short" }).replace(".", "");
  } catch {
    return dateStr.slice(5); // MM-DD
  }
}

// Format hour from ISO string "2026-02-24T15:00"
function hourLabel(timeStr: string): string {
  try {
    return timeStr.slice(11, 16); // HH:MM
  } catch {
    return timeStr;
  }
}

function PrecipBadge({ mm }: { mm: number }) {
  if (mm < 0.1) return null;
  const color =
    mm >= 20 ? "bg-red-500/20 text-red-300 border-red-500/30" :
    mm >= 5  ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
               "bg-blue-500/20 text-blue-300 border-blue-500/30";
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${color}`}>
      {mm.toFixed(1)} mm
    </span>
  );
}

function LocationCard({ loc }: { loc: LocationWeather }) {
  if (loc.error || !loc.current) {
    return (
      <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5 shadow-lg">
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-200 text-sm">{loc.name}</h3>
            <p className="text-xs text-slate-500">{loc.description}</p>
          </div>
        </div>
        <p className="text-xs text-red-400">
          No se pudieron cargar los datos
          {loc.error ? ` (${loc.error})` : ""}
        </p>
      </div>
    );
  }

  const cur = loc.current;

  // Next 8 hours summary from hourly
  const next8 = loc.hourly_24h.slice(0, 8);
  const totalPrecip8h = next8.reduce((s, h) => s + h.precip_mm, 0);

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-5 shadow-lg hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-slate-100 text-sm leading-tight">{loc.name}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{loc.description}</p>
            {loc.elevation_m && (
              <p className="text-[10px] text-slate-600 mt-0.5">{loc.elevation_m} m.s.n.m.</p>
            )}
          </div>
        </div>
        <div className="text-3xl leading-none">{cur.weather_icon}</div>
      </div>

      {/* Current conditions */}
      <div className="bg-slate-900/50 rounded-xl p-3 mb-4 border border-slate-700/50">
        <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">
          Ahora
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-lg font-bold text-orange-300">{cur.temp_c.toFixed(1)}</span>
            <span className="text-xs text-slate-400">°C</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-lg font-bold text-blue-300">{cur.hr_pct}</span>
            <span className="text-xs text-slate-400">%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-base font-semibold text-sky-300">{cur.precip_mm.toFixed(1)}</span>
            <span className="text-xs text-slate-400">mm/h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-base font-semibold text-teal-300">{cur.wind_kmh.toFixed(0)}</span>
            <span className="text-xs text-slate-400">km/h</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">{cur.weather_label}</p>
        {totalPrecip8h > 0.5 && (
          <p className="text-xs text-amber-400 mt-1">
            Próx. 8h: {totalPrecip8h.toFixed(1)} mm acumulados
          </p>
        )}
      </div>

      {/* 24-hour hourly strip */}
      {loc.hourly_24h.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] text-slate-500 mb-1.5 uppercase tracking-wide font-medium">
            Próximas 24 horas
          </p>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {loc.hourly_24h.map((h, i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-0.5 min-w-[36px] rounded-lg p-1.5 text-center transition-colors ${
                  h.precip_mm >= 5 ? "bg-blue-900/40 border border-blue-700/40" :
                  h.precip_mm >= 1 ? "bg-slate-700/40 border border-slate-600/40" :
                  "bg-slate-800/20 border border-slate-700/20"
                }`}
              >
                <span className="text-[9px] text-slate-400">{hourLabel(h.time)}</span>
                <span className="text-base leading-none">{h.weather_icon}</span>
                <span className="text-[10px] font-medium text-orange-300">{h.temp_c.toFixed(0)}°</span>
                {h.precip_mm >= 0.1 && (
                  <span className="text-[9px] text-blue-300">{h.precip_mm.toFixed(1)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5-day forecast */}
      {loc.daily_5d.length > 0 && (
        <div>
          <p className="text-[10px] text-slate-500 mb-1.5 uppercase tracking-wide font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Próximos 5 días
          </p>
          <div className="space-y-1">
            {loc.daily_5d.map((day, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5 bg-slate-900/30 border border-slate-700/30"
              >
                <span className="text-slate-300 w-14 shrink-0 font-medium">
                  {dayLabel(day.date, i)}
                </span>
                <span className="text-base leading-none">{day.weather_icon}</span>
                <span className="text-slate-400 hidden sm:block text-[11px] flex-1 text-center px-1 truncate">
                  {day.weather_label}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-red-300 font-semibold">{day.temp_max_c.toFixed(0)}°</span>
                  <span className="text-slate-500">/</span>
                  <span className="text-blue-300">{day.temp_min_c.toFixed(0)}°</span>
                  <PrecipBadge mm={day.precip_sum_mm} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


export default function RegionalWeatherPanel({ locations, fetchedAt }: RegionalWeatherPanelProps) {
  const fetchTime = (() => {
    try {
      return new Date(fetchedAt).toLocaleTimeString("es-CR", {
        timeZone: "America/Costa_Rica",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fetchedAt;
    }
  })();

  return (
    <section className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">
            Clima regional – Zona San Carlos
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Modelo numérico Open-Meteo · Pronóstico 24 h y 5 días
          </p>
        </div>
        <span className="text-xs text-slate-500 shrink-0">
          Actualizado {fetchTime}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {locations.map((loc) => (
          <LocationCard key={loc.id} loc={loc} />
        ))}
      </div>

      <p className="text-[11px] text-slate-600 text-center italic mt-2">
        Fuente: Open-Meteo (open-meteo.com) – modelo GFS/ECMWF. Datos de pronóstico numérico,
        no estaciones físicas. Uso referencial.
      </p>
    </section>
  );
}
