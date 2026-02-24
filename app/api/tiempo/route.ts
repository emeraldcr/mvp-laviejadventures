// app/api/tiempo/route.ts
import { NextResponse } from "next/server";
import { load } from "cheerio";
import { parse, isValid } from "date-fns";
import { es } from "date-fns/locale";

const IMN_URL = "https://www.imn.ac.cr/especial/tablas/msagrada.html";
const CACHE_TTL_SECONDS = 300; // 5 min

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
  temp_c: number | null;
  hr_pct: number | null;
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

  dt = parse(cleaned, "dd/MM/yyyy HH:mm", new Date());
  return isValid(dt) ? dt : null;
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

// ─── Forecast methods ────────────────────────────────────────────────────────

/** Exponential Moving Average – gives more weight to recent hours */
function calculateEMA(values: number[], alpha = 0.6): number {
  if (values.length === 0) return 0;
  let ema = values[values.length - 1];
  for (let i = values.length - 2; i >= 0; i--) {
    ema = alpha * values[i] + (1 - alpha) * ema;
  }
  return ema;
}

/** Linear regression on the last N hours – projects the trend forward */
function linearRegressionForecast(values: number[]): number {
  const n = values.length;
  if (n < 2) return Math.max(0, values[0] ?? 0);
  // values[0] = latest, so reverse to get chronological order
  const ordered = [...values].reverse();
  const xMean = (n - 1) / 2;
  const yMean = ordered.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (ordered[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return Math.max(0, intercept + slope * n);
}

/** Simple moving average over a window */
function movingAverageForecast(values: number[], window: number): number {
  const slice = values.slice(0, window);
  return Math.max(0, slice.reduce((a, b) => a + b, 0) / Math.max(1, slice.length));
}

/** Double EMA (Holt–Winters simple) – captures trend + level */
function doubleEMAForecast(values: number[], alpha = 0.5, beta = 0.3): number {
  if (values.length === 0) return 0;
  const ordered = [...values].reverse(); // oldest first
  let level = ordered[0];
  let trend = ordered.length > 1 ? ordered[1] - ordered[0] : 0;
  for (let i = 1; i < ordered.length; i++) {
    const prevLevel = level;
    level = alpha * ordered[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }
  return Math.max(0, level + trend);
}

/** Weighted moving average – recent hours get linearly higher weight */
function weightedMovingAverage(values: number[], window: number): number {
  const slice = values.slice(0, window);
  const n = slice.length;
  if (n === 0) return 0;
  // weight[0] = highest (most recent), weight[n-1] = lowest
  const totalWeight = (n * (n + 1)) / 2;
  const weighted = slice.reduce((sum, v, i) => sum + v * (n - i), 0);
  return Math.max(0, weighted / totalWeight);
}

function getConfidence(length: number, std: number): "baja" | "media" | "alta" {
  if (length >= 8 && std < 2.5) return "alta";
  if (length >= 5) return "media";
  return "baja";
}

// ─────────────────────────────────────────────────────────────────────────────

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
      throw new Error(`IMN fetch failed: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();
    const $ = load(html);

    const sections: Record<string, string[][]> = {};

    $('*:contains("Tabla de datos:")').each((_, el) => {
      const title = $(el).text().trim();

      const key =
        title.includes("Horarios") ? "hourly" :
        title.includes("Actuales") ? "current" :
        title.includes("Diarios") ? "daily" : null;

      if (!key) return;

      const table = $(el).nextAll("table").first();
      if (!table.length) return;

      const rows: string[][] = [];

      table.find("tr").each((_, tr) => {
        const cells: string[] = [];
        $(tr).find("td, th").each((_, td) => {
          cells.push($(td).text().trim());
        });
        if (cells.length >= 2 && !cells[0].toLowerCase().includes("fecha")) {
          rows.push(cells);
        }
      });

      if (rows.length > 0) {
        sections[key] = rows;
      }
    });

    if (!sections.hourly?.length) {
      throw new Error("No se encontraron datos en la tabla Horarios");
    }

    // ─── Parse hourly (newest first) ─────────────────────────────────────────
    const hourlyRows: HourlyEntry[] = sections.hourly.map((cells) => {
      const fecha = cells[0]?.trim() ?? "";
      const timestamp = parseIMNDate(fecha);

      let lluvia_mm: number;
      let temp_c: number | null = null;
      let hr_pct: number | null = null;

      if (cells.length >= 4) {
        // Format: fecha, temp, HR, lluvia
        const t = safeParseFloat(cells[1]);
        const h = safeParseFloat(cells[2]);
        const l = safeParseFloat(cells[3]);
        temp_c = (t >= 5 && t <= 45) ? t : null;
        hr_pct = (h > 0 && h <= 100) ? h : null;
        lluvia_mm = l;
      } else {
        // Original format: fecha, lluvia
        lluvia_mm = safeParseFloat(cells[1]);
      }

      return {
        fecha,
        timestamp,
        timestampISO: timestamp?.toISOString() ?? null,
        lluvia_mm,
        temp_c,
        hr_pct,
      };
    });

    // ─── Parse current totals ─────────────────────────────────────────────────
    let current: CurrentTotals = null;
    if (sections.current?.length) {
      const [fechaRaw, sumRaw, ayerRaw] = sections.current[0];
      const timestamp = parseIMNDate(fechaRaw);
      current = {
        fecha: fechaRaw.trim(),
        timestamp,
        sum_lluv_mm: safeParseFloat(sumRaw),
        lluv_ayer_mm: safeParseFloat(ayerRaw),
      };
    }

    // ─── Parse daily ──────────────────────────────────────────────────────────
    const dailyRows = (sections.daily ?? []).map(([fechaRaw, lluviaRaw]) => ({
      fecha: fechaRaw.trim(),
      timestamp: parseIMNDate(fechaRaw),
      lluvia_mm: safeParseFloat(lluviaRaw),
    }));

    // ─── Accumulation stats ───────────────────────────────────────────────────
    const lastValues = hourlyRows.map((r) => r.lluvia_mm);

    const last1h  = lastValues[0] ?? 0;
    const last3h  = hourlyRows.slice(0, 3).reduce((a, r) => a + r.lluvia_mm, 0);
    const last6h  = hourlyRows.slice(0, 6).reduce((a, r) => a + r.lluvia_mm, 0);
    const last24h = hourlyRows.slice(0, 24).reduce((a, r) => a + r.lluvia_mm, 0);
    const last48h = hourlyRows.slice(0, 48).reduce((a, r) => a + r.lluvia_mm, 0);

    const intensity = getRainIntensity(last1h);
    const risk = getRiskStatus(last3h, last6h, last24h);

    // ─── Forecast – all methods ───────────────────────────────────────────────
    const forecastValues = lastValues.slice(0, 12); // last 12 h for forecast input
    const ema = calculateEMA(forecastValues);

    // Confidence based on recent spread
    const recent8 = forecastValues.slice(0, 8);
    const mean8 = recent8.reduce((a, b) => a + b, 0) / Math.max(1, recent8.length);
    const variance8 = recent8.reduce((a, b) => a + (b - mean8) ** 2, 0) / Math.max(1, recent8.length - 1);
    const std8 = Math.sqrt(variance8);
    const confidence = getConfidence(recent8.length, std8);

    const r = (v: number) => Math.round(v * 10) / 10;

    const forecastMethods = {
      ema:               { value: r(ema),                                          label: "EMA exponencial (α=0.6)" },
      doubleEMA:         { value: r(doubleEMAForecast(forecastValues)),             label: "Double EMA / Holt-Winters" },
      linearRegression:  { value: r(linearRegressionForecast(forecastValues)),     label: "Regresión lineal (12h)" },
      movingAverage3h:   { value: r(movingAverageForecast(lastValues, 3)),         label: "Media móvil simple (3h)" },
      movingAverage6h:   { value: r(movingAverageForecast(lastValues, 6)),         label: "Media móvil simple (6h)" },
      weightedAverage6h: { value: r(weightedMovingAverage(lastValues, 6)),         label: "Media ponderada reciente (6h)" },
    };

    // Consensus: simple mean of all method values
    const consensusMm = r(
      Object.values(forecastMethods).reduce((s, m) => s + m.value, 0) /
      Object.values(forecastMethods).length
    );

    // ─── Extra stats ──────────────────────────────────────────────────────────
    const recent24 = hourlyRows.slice(0, 24);
    const wetHoursLast24 = recent24.filter(r => r.lluvia_mm > 0.5).length;

    // Peak hour in last 24h
    const peakIdx24 = recent24.reduce(
      (maxI, row, i) => row.lluvia_mm > (recent24[maxI]?.lluvia_mm ?? 0) ? i : maxI,
      0
    );
    const peakHour24h = {
      mm: Math.round((recent24[peakIdx24]?.lluvia_mm ?? 0) * 10) / 10,
      fecha: recent24[peakIdx24]?.fecha ?? "—",
    };

    // Wet / dry streak (counting from latest hour)
    let wetStreak = 0;
    let dryStreak = 0;
    let mode: "wet" | "dry" | "unknown" = "unknown";
    for (const row of hourlyRows) {
      const wet = row.lluvia_mm > 0.5;
      if (mode === "unknown") {
        mode = wet ? "wet" : "dry";
      }
      if (mode === "wet" && wet)  { wetStreak++;  continue; }
      if (mode === "dry" && !wet) { dryStreak++;  continue; }
      break;
    }

    // ─── Weather metrics (temp + humidity) ───────────────────────────────────
    const tempVals = recent24.map(r => r.temp_c).filter((v): v is number => v !== null);
    const hrVals   = recent24.map(r => r.hr_pct).filter((v): v is number => v !== null);

    const weatherMetrics = {
      hasData:    tempVals.length > 0,
      avgTemp24h: tempVals.length ? r(tempVals.reduce((a, b) => a + b) / tempVals.length) : null,
      maxTemp24h: tempVals.length ? r(Math.max(...tempVals)) : null,
      minTemp24h: tempVals.length ? r(Math.min(...tempVals)) : null,
      avgHR24h:   hrVals.length   ? Math.round(hrVals.reduce((a, b) => a + b) / hrVals.length) : null,
      maxHR24h:   hrVals.length   ? Math.round(Math.max(...hrVals)) : null,
      minHR24h:   hrVals.length   ? Math.round(Math.min(...hrVals)) : null,
    };

    // ─── Rolling risk timeline (last 24h, chronological) ─────────────────────
    // hourlyRows[0] = latest, so slice(0,24) → then compute rolling 3h & 6h at each point
    const rollingRisk = hourlyRows.slice(0, 24).map((_, i, arr) => {
      const r3h = arr.slice(i, Math.min(i + 3, arr.length)).reduce((a, v) => a + v.lluvia_mm, 0);
      const r6h = arr.slice(i, Math.min(i + 6, arr.length)).reduce((a, v) => a + v.lluvia_mm, 0);
      return {
        fecha:       arr[i].fecha,
        timestampISO: arr[i].timestampISO,
        r3h: Math.round(r3h * 10) / 10,
        r6h: Math.round(r6h * 10) / 10,
      };
    }).reverse(); // now oldest → newest for charts

    const lastUpdate = hourlyRows[0]?.timestamp ?? current?.timestamp ?? new Date();

    return NextResponse.json({
      success: true,
      meta: {
        station:       "Reserva Montaña Sagrada (IMN)",
        source:        IMN_URL,
        fetchedAt:     new Date().toISOString(),
        lastUpdateISO: lastUpdate.toISOString(),
        note:          ABBREVIATIONS.nota,
      },
      status: {
        risk:          risk.level,
        riskLabel:     risk.label,
        riskEmoji:     risk.emoji,
        intensity,
        lastHour_mm:   Math.round(last1h * 10) / 10,
        trend: last3h > last6h * 1.3 ? "subiendo" : last3h < last6h * 0.7 ? "bajando" : "estable",
      },
      now: {
        lastHour:     hourlyRows[0] ?? null,
        currentTotals: current,
      },
      stats: {
        last1h_mm:       Math.round(last1h  * 10) / 10,
        last3h_mm:       Math.round(last3h  * 10) / 10,
        last6h_mm:       Math.round(last6h  * 10) / 10,
        last24h_mm:      Math.round(last24h * 10) / 10,
        last48h_mm:      Math.round(last48h * 10) / 10,
        wetHoursLast24,
        wetStreak,
        dryStreak,
        peakHour24h,
      },
      forecast: {
        nextHour_mm: Math.round(ema * 10) / 10,
        confidence,
        consensusMm,
        method:     "EMA (α=0.6)",
        methods:    forecastMethods,
      },
      weather:  weatherMetrics,
      analysis: { rollingRisk },
      data: {
        hourly: full ? hourlyRows : hourlyRows.slice(0, hours),
        daily:  full ? dailyRows  : dailyRows.slice(0, days),
      },
      currentSnapshot: current,
      counts: {
        hourlyAvailable: hourlyRows.length,
        dailyAvailable:  dailyRows.length,
      },
    }, {
      headers: {
        "Cache-Control": `s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=60`,
      },
    });
  } catch (err: unknown) {
    console.error("[rain-msagrada]", err);
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error:   "No pudimos obtener los datos del IMN en este momento",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 503 }
    );
  }
}
