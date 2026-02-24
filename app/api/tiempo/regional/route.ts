// app/api/tiempo/regional/route.ts
// Fetches weather data from Open-Meteo (free, no API key) for multiple
// locations in the San Carlos / Juan Castro Blanco area of Costa Rica.

import { NextResponse } from "next/server";
import type { LocationWeather } from "@/lib/types";

const CACHE_TTL = 1800; // 30 min – regional forecast doesn't change as fast

// ─── WMO weather code descriptions (Spanish) ─────────────────────────────────
const WMO: Record<number, { label: string; icon: string }> = {
  0:  { label: "Despejado",              icon: "☀️" },
  1:  { label: "Mayorm. despejado",      icon: "🌤️" },
  2:  { label: "Parcialm. nublado",      icon: "⛅" },
  3:  { label: "Nublado",                icon: "☁️" },
  45: { label: "Neblina",                icon: "🌫️" },
  48: { label: "Niebla helada",          icon: "🌫️" },
  51: { label: "Llovizna ligera",        icon: "🌦️" },
  53: { label: "Llovizna moderada",      icon: "🌦️" },
  55: { label: "Llovizna densa",         icon: "🌧️" },
  61: { label: "Lluvia ligera",          icon: "🌧️" },
  63: { label: "Lluvia moderada",        icon: "🌧️" },
  65: { label: "Lluvia intensa",         icon: "🌧️" },
  71: { label: "Nevada ligera",          icon: "🌨️" },
  73: { label: "Nevada moderada",        icon: "🌨️" },
  75: { label: "Nevada intensa",         icon: "❄️" },
  77: { label: "Granizo ligero",         icon: "🌨️" },
  80: { label: "Chubascos ligeros",      icon: "🌦️" },
  81: { label: "Chubascos moderados",    icon: "🌧️" },
  82: { label: "Chubascos fuertes",      icon: "⛈️" },
  85: { label: "Nevada en chubascos",    icon: "🌨️" },
  86: { label: "Nevada intensa",         icon: "🌨️" },
  95: { label: "Tormenta eléctrica",     icon: "⛈️" },
  96: { label: "Tormenta c/ granizo",    icon: "⛈️" },
  99: { label: "Tormenta c/ granizo f.", icon: "⛈️" },
};

function wmo(code: number): { label: string; icon: string } {
  return WMO[code] ?? { label: `Código ${code}`, icon: "🌡️" };
}

const LOCATIONS: Array<{
  id: string;
  name: string;
  description: string;
  lat: number;
  lon: number;
}> = [
  {
    id: "san_carlos",
    name: "San Carlos (Ciudad Quesada)",
    description: "Cabecera del cantón de San Carlos, Alajuela",
    lat: 10.330,
    lon: -84.430,
  },
  {
    id: "juan_castro_blanco",
    name: "P.N. Juan Castro Blanco",
    description: "Parque Nacional Juan Castro Blanco – zona de amortiguamiento",
    lat: 10.185,
    lon: -84.370,
  },
  {
    id: "san_jose_montana",
    name: "San José de la Montaña",
    description: "Distrito de Barva, Heredia – ladera sur de la cordillera",
    lat: 10.056,
    lon: -84.134,
  },
  {
    id: "el_congo",
    name: "El Congo",
    description: "Sector El Congo, San Carlos – zona baja norte",
    lat: 10.375,
    lon: -84.380,
  },
];

async function fetchLocation(loc: (typeof LOCATIONS)[number]): Promise<LocationWeather> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude",  String(loc.lat));
  url.searchParams.set("longitude", String(loc.lon));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,cloud_cover"
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code"
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum"
  );
  url.searchParams.set("timezone",       "America/Costa_Rica");
  url.searchParams.set("forecast_days",  "5");
  url.searchParams.set("forecast_hours", "24");
  url.searchParams.set("wind_speed_unit","kmh");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // ── Current conditions ──────────────────────────────────────────────────
    const cur = json.current;
    const current: LocationWeather["current"] = cur
      ? {
          time:          cur.time,
          temp_c:        cur.temperature_2m ?? 0,
          hr_pct:        cur.relative_humidity_2m ?? 0,
          precip_mm:     cur.precipitation ?? 0,
          rain_mm:       cur.rain ?? 0,
          wind_kmh:      cur.wind_speed_10m ?? 0,
          cloud_pct:     cur.cloud_cover ?? 0,
          weather_code:  cur.weather_code ?? 0,
          weather_label: wmo(cur.weather_code ?? 0).label,
          weather_icon:  wmo(cur.weather_code ?? 0).icon,
        }
      : null;

    // ── 24-hour hourly ──────────────────────────────────────────────────────
    const h = json.hourly ?? {};
    const times: string[] = h.time ?? [];
    const hourly_24h: LocationWeather["hourly_24h"] = times.slice(0, 24).map((t, i) => ({
      time:         t,
      temp_c:       h.temperature_2m?.[i]           ?? 0,
      hr_pct:       h.relative_humidity_2m?.[i]     ?? 0,
      precip_mm:    h.precipitation?.[i]             ?? 0,
      rain_mm:      h.rain?.[i]                      ?? 0,
      weather_code: h.weather_code?.[i]              ?? 0,
      weather_icon: wmo(h.weather_code?.[i] ?? 0).icon,
    }));

    // ── 5-day daily ─────────────────────────────────────────────────────────
    const d = json.daily ?? {};
    const dates: string[] = d.time ?? [];
    const daily_5d: LocationWeather["daily_5d"] = dates.slice(0, 5).map((date, i) => ({
      date,
      weather_code:   d.weather_code?.[i]        ?? 0,
      weather_label:  wmo(d.weather_code?.[i] ?? 0).label,
      weather_icon:   wmo(d.weather_code?.[i] ?? 0).icon,
      temp_max_c:     d.temperature_2m_max?.[i]  ?? 0,
      temp_min_c:     d.temperature_2m_min?.[i]  ?? 0,
      precip_sum_mm:  d.precipitation_sum?.[i]   ?? 0,
    }));

    return {
      ...loc,
      elevation_m: json.elevation ?? null,
      current,
      hourly_24h,
      daily_5d,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return {
      ...loc,
      elevation_m: null,
      current: null,
      hourly_24h: [],
      daily_5d: [],
      error: msg,
    };
  }
}

export async function GET() {
  const results = await Promise.all(LOCATIONS.map(fetchLocation));

  return NextResponse.json(
    {
      success: true,
      fetchedAt: new Date().toISOString(),
      source: "Open-Meteo (https://open-meteo.com) – CC BY 4.0",
      note: "Datos de modelo numérico de pronóstico. No sustituyen a observaciones en estación.",
      locations: results,
    },
    {
      headers: {
        "Cache-Control": `s-maxage=${CACHE_TTL}, stale-while-revalidate=120`,
      },
    }
  );
}
