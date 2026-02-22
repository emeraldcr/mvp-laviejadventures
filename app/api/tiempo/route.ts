import { NextResponse } from "next/server";
import { load, type CheerioAPI } from "cheerio";
import { parse, isValid, format } from "date-fns";
import { es } from "date-fns/locale";

const IMN_URL = "https://www.imn.ac.cr/especial/tablas/msagrada.html";
const CACHE_TTL_SECONDS = 300; // 5 min – adjust as needed

const ABBREVIATIONS = {
  Temp: { desc: "Temperatura promedio", unit: "°C" },
  HR: { desc: "Humedad Relativa Promedio", unit: "%" },
  Lluvia: { desc: "Lluvia horaria", unit: "mm" },
  SUM_lluv: { desc: "Lluvia acumulada desde 7 a.m.", unit: "mm" },
  LLUV_ayer: { desc: "Lluvia del día anterior (7 a.m. a 7 a.m.)", unit: "mm" },
  nota: "Datos preliminares – sin control de calidad completo. Úsalos solo como referencia.",
} as const;

type HourlyEntry = {
  fecha: string;
  timestamp: Date | null;
  timestampISO: string | null;
  lluvia_mm: number;
};

type CurrentTotals = {
  fecha: string;
  timestamp: Date | null;
  sum_lluv_mm: number;
  lluv_ayer_mm: number;
} | null;

type RiskStatus = "green" | "yellow" | "red";

type RainStatus = "sin lluvia" | "ligera" | "moderada" | "intensa";

function safeParseFloat(s?: string): number {
  if (!s) return 0;
  return parseFloat(s.replace(",", ".").trim()) || 0;
}

function parseIMNDate(str: string): Date | null {
  const cleaned = str.trim().replace(/\s+/g, " ");
  let dt = parse(cleaned, "dd/MM/yyyy hh:mm:ss a", new Date(), { locale: es });
  if (isValid(dt)) return dt;

  dt = parse(cleaned, "dd/MM/yyyy hh:mm a", new Date(), { locale: es });
  if (isValid(dt)) return dt;

  dt = parse(cleaned, "dd/MM/yyyy HH:mm", new Date()); // fallback 24h
  return isValid(dt) ? dt : null;
}

function parseHourlyTable($: CheerioAPI): HourlyEntry[] {
  const rows: HourlyEntry[] = [];
  $("table").eq(0).find("tr").slice(1).each((_, el) => {
    const cells = $(el).find("td, th");
    if (cells.length < 2) return;
    const fecha = $(cells[0]).text().trim();
    const lluvia = safeParseFloat($(cells[1]).text());
    const timestamp = parseIMNDate(fecha);
    rows.push({
      fecha,
      timestamp,
      timestampISO: timestamp?.toISOString() ?? null,
      lluvia_mm: lluvia,
    });
  });
  return rows;
}

function parseCurrentTable($: CheerioAPI): CurrentTotals {
  const row = $("table").eq(1).find("tr").slice(1).first();
  if (row.length === 0) return null;

  const cells = row.find("td, th");
  if (cells.length < 3) return null;

  const fecha = $(cells[0]).text().trim();
  const timestamp = parseIMNDate(fecha);

  return {
    fecha,
    timestamp,
    sum_lluv_mm: safeParseFloat($(cells[1]).text()),
    lluv_ayer_mm: safeParseFloat($(cells[2]).text()),
  };
}

function parseDailyTable($: CheerioAPI): { fecha: string; timestamp: Date | null; lluvia_mm: number }[] {
  const rows: any[] = [];
  $("table").eq(2).find("tr").slice(1).each((_, el) => {
    const cells = $(el).find("td, th");
    if (cells.length < 2) return;
    const fecha = $(cells[0]).text().trim();
    const timestamp = parseIMNDate(fecha);
    rows.push({
      fecha,
      timestamp,
      lluvia_mm: safeParseFloat($(cells[1]).text()),
    });
  });
  return rows;
}

function getRainIntensity(mm: number): RainStatus {
  if (mm >= 12) return "intensa";
  if (mm >= 4) return "moderada";
  if (mm > 0.5) return "ligera";
  return "sin lluvia";
}

function getRiskStatus(
  last3h: number,
  last6h: number,
  last24h: number
): { level: RiskStatus; label: string; emoji: string } {
  if (last3h >= 20 || last6h >= 35 || last24h >= 70) {
    return { level: "red", label: "Riesgo alto – probable crecida rápida", emoji: "🔴" };
  }
  if (last3h >= 10 || last6h >= 18 || last24h >= 40) {
    return { level: "yellow", label: "Precaución – caudal puede subir", emoji: "🟡" };
  }
  return { level: "green", label: "Condiciones aceptables", emoji: "🟢" };
}

function calculateEMA(values: number[], alpha = 0.6): number {
  if (values.length === 0) return 0;
  let ema = values[values.length - 1];
  for (let i = values.length - 2; i >= 0; i--) {
    ema = alpha * values[i] + (1 - alpha) * ema;
  }
  return ema;
}

function getConfidence(length: number, std: number): "baja" | "media" | "alta" {
  if (length >= 8 && std < 2.5) return "alta";
  if (length >= 5) return "media";
  return "baja";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const full = searchParams.get("full") === "1";
  const hours = Math.min(Math.max(Number(searchParams.get("hours") ?? 24), 1), 72);
  const days = Math.min(Math.max(Number(searchParams.get("days") ?? 14), 1), 31);

  try {
    const res = await fetch(IMN_URL, {
      cache: "no-store",
      next: { revalidate: CACHE_TTL_SECONDS },
    });

    if (!res.ok) {
      throw new Error(`IMN fetch failed: ${res.status}`);
    }

    const html = await res.text();
    const $ = load(html);

    if ($("table").length < 3) {
      throw new Error("Estructura de página cambió – menos de 3 tablas");
    }

    const hourlyRows = parseHourlyTable($);
    const current = parseCurrentTable($);
    const dailyRows = parseDailyTable($);

    if (hourlyRows.length === 0) {
      throw new Error("No se encontraron datos horarios");
    }

    // Most recent first (assuming IMN orders newest on top)
    const lastValues = hourlyRows.map((r) => r.lluvia_mm);

    const last1h = lastValues[0] ?? 0;
    const last3h = hourlyRows.slice(0, 3).reduce((a, r) => a + r.lluvia_mm, 0);
    const last6h = hourlyRows.slice(0, 6).reduce((a, r) => a + r.lluvia_mm, 0);
    const last24h = hourlyRows.slice(0, 24).reduce((a, r) => a + r.lluvia_mm, 0);
    const last48h = hourlyRows.slice(0, 48).reduce((a, r) => a + r.lluvia_mm, 0);

    const intensity = getRainIntensity(last1h);
    const risk = getRiskStatus(last3h, last6h, last24h);

    // Simple nowcast (next hour)
    const forecastValues = lastValues.slice(0, 12);
    const ema = calculateEMA(forecastValues);
    const recent = forecastValues.slice(0, 8);
    const mean = recent.reduce((a, b) => a + b, 0) / Math.max(1, recent.length);
    const variance = recent.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, recent.length - 1);
    const std = Math.sqrt(variance);
    const confidence = getConfidence(recent.length, std);

    const lastUpdate = hourlyRows[0]?.timestamp ?? current?.timestamp ?? new Date();

    return NextResponse.json({
      success: true,
      meta: {
        station: "Reserva Montaña Sagrada (IMN)",
        source: IMN_URL,
        fetchedAt: new Date().toISOString(),
        lastUpdateISO: lastUpdate.toISOString(),
        note: ABBREVIATIONS.nota,
      },
      status: {
        risk: risk.level,
        riskLabel: risk.label,
        riskEmoji: risk.emoji,
        intensity,
        lastHour_mm: Math.round(last1h * 10) / 10,
        trend: last3h > last6h * 1.3 ? "subiendo" : last3h < last6h * 0.7 ? "bajando" : "estable",
      },
      now: {
        lastHour: hourlyRows[0] ?? null,
        currentTotals: current,
      },
      stats: {
        last1h_mm: Math.round(last1h * 10) / 10,
        last3h_mm: Math.round(last3h * 10) / 10,
        last6h_mm: Math.round(last6h * 10) / 10,
        last24h_mm: Math.round(last24h * 10) / 10,
        last48h_mm: Math.round(last48h * 10) / 10,
      },
      forecast: {
        nextHour_mm: Math.round(ema * 10) / 10,
        confidence,
        method: "EMA (α=0.6) – estimación simple",
      },
      data: {
        hourly: full ? hourlyRows : hourlyRows.slice(0, hours),
        daily: full ? dailyRows : dailyRows.slice(0, days),
      },
      counts: {
        hourlyAvailable: hourlyRows.length,
        dailyAvailable: dailyRows.length,
      },
    }, {
      headers: {
        "Cache-Control": `s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=60`,
      },
    });
  } catch (err: any) {
    console.error("[rain-msagrada]", err);
    return NextResponse.json(
      {
        success: false,
        error: "No pudimos obtener los datos del IMN en este momento",
        details: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 503 }
    );
  }
}