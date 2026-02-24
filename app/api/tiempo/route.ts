// app/api/tiempo/route.ts
import { NextResponse } from "next/server";
import { load } from "cheerio";
import { parse, isValid } from "date-fns";
import { es } from "date-fns/locale";

const IMN_URL = "https://www.imn.ac.cr/especial/tablas/msagrada.html";
const CACHE_TTL_SECONDS = 300; // 5 min

// Browser-like headers to avoid 403 from IMN server
const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "es-CR,es;q=0.9,en;q=0.8",
  Referer: "https://www.imn.ac.cr/",
  "Cache-Control": "no-cache",
};

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

// ─── Open-Meteo fetch (nearest NWP proxy to Montaña Sagrada) ─────────────────
// Juan Castro Blanco NP coordinates are the closest grid point available.
// Returns precipitation array for next 6 hours (index 0 = current hour).
async function fetchOpenMeteoProxy(): Promise<number[]> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude",       "10.185");
    url.searchParams.set("longitude",      "-84.370");
    url.searchParams.set("hourly",         "precipitation");
    url.searchParams.set("timezone",       "America/Costa_Rica");
    url.searchParams.set("forecast_hours", "6");
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.hourly?.precipitation as number[]) ?? [];
  } catch {
    return [];
  }
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

// ─── Multi-step (h+n) forecast helpers ───────────────────────────────────────

/**
 * Projects linear regression n steps ahead.
 * values[0] = most recent (newest-first order).
 */
function linearRegressionNStep(values: number[], horizon: number): number {
  const n = values.length;
  if (n < 2) return Math.max(0, values[0] ?? 0);
  const ordered = [...values].reverse(); // oldest first
  const xMean = (n - 1) / 2;
  const yMean = ordered.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (ordered[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return Math.max(0, intercept + slope * (n - 1 + horizon));
}

/**
 * Projects Holt-Winters double EMA n steps ahead: level + horizon * trend.
 * values[0] = most recent.
 */
function doubleEMANStep(
  values: number[],
  horizon: number,
  alpha = 0.5,
  beta = 0.3
): number {
  if (values.length === 0) return 0;
  const ordered = [...values].reverse(); // oldest first
  let level = ordered[0];
  let trend = ordered.length > 1 ? ordered[1] - ordered[0] : 0;
  for (let i = 1; i < ordered.length; i++) {
    const prevLevel = level;
    level = alpha * ordered[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }
  return Math.max(0, level + horizon * trend);
}

/**
 * Combined IMN statistical estimate for h+n.
 * As horizon grows, we reduce the regression weight (it can diverge) and lean
 * more on the level-only EMA, keeping DoubleEMA as a middle ground.
 */
function imnHorizonEstimate(
  forecastValues: number[],
  horizon: number,
  emaLevel: number
): number {
  const lr   = linearRegressionNStep(forecastValues, horizon);
  const dema = doubleEMANStep(forecastValues, horizon);
  // LR weight decreases from 1/3 toward 0 as horizon grows
  const lrW   = Math.max(0.05, 1 / 3 - (horizon - 1) * 0.1);
  const demaW = 1 / 3;
  const emaW  = 1 - lrW - demaW;
  return Math.max(0, lr * lrW + dema * demaW + emaLevel * emaW);
}

// Blend weights: how much to trust IMN stats vs Open-Meteo NWP per horizon
// h+1: obs-heavy (70/30), h+4: model-heavy (10/90)
const BLEND_IMN_WEIGHT = [0.70, 0.50, 0.25, 0.10] as const;

// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const full = searchParams.get("full") === "1";
  const hours = Math.min(Math.max(Number(searchParams.get("hours") ?? 72), 1), 120);
  const days = Math.min(Math.max(Number(searchParams.get("days") ?? 14), 1), 31);

  try {
    // Fire both fetches simultaneously to avoid sequential latency
    const [res, ometRaw] = await Promise.all([
      fetch(IMN_URL, {
        cache: "no-store",
        next: { revalidate: CACHE_TTL_SECONDS },
        headers: FETCH_HEADERS,
      }),
      fetchOpenMeteoProxy(),
    ]);

    if (!res.ok) {
      throw new Error(`IMN fetch failed: ${res.status} ${res.statusText}`);
    }

    // ometRaw[0] = current hour (partial), [1..4] = next 4 complete hours
    const ometNext4h: (number | null)[] = [1, 2, 3, 4].map((i) =>
      typeof ometRaw[i] === "number" ? ometRaw[i] : null
    );

    const html = await res.text();
    const $ = load(html);

    const sections: Record<string, string[][]> = {};

    function parseTableRows(table: ReturnType<typeof $>): string[][] {
      const rows: string[][] = [];
      table.find("tr").each((_, tr) => {
        const cells: string[] = [];
        $(tr).find("td, th").each((_, td) => {
          cells.push($(td).text().trim());
        });
        // Skip empty rows and header rows that start with "fecha" or "date"
        if (cells.length >= 2 && !cells[0].toLowerCase().match(/^(fecha|date|hora)$/)) {
          rows.push(cells);
        }
      });
      return rows;
    }

    // Strategy 1: Find the most specific (leaf-level) element that contains "Tabla de datos:"
    // using a targeted element list to avoid matching large parent containers.
    const titleSelector = 'p, h2, h3, h4, h5, h6, td, th, div, span, b, strong';
    $(titleSelector).each((_, el) => {
      // Only match elements whose OWN direct text (not deep children) references the section
      const ownText = $(el).clone().children().remove().end().text().trim();
      const fullText = $(el).text().trim();

      // Use short text elements as title markers (avoid whole-page containers)
      const titleText = ownText.length > 0 && ownText.length < 120 ? ownText : fullText;
      if (!titleText.includes("Tabla de datos:") || titleText.length > 200) return;

      const key =
        titleText.includes("Horarios") ? "hourly" :
        titleText.includes("Actuales") ? "current" :
        titleText.includes("Diarios") ? "daily" : null;

      if (!key) return;

      // Look for adjacent table: first as next sibling, then as sibling of parent
      let table = $(el).nextAll("table").first();
      if (!table.length) table = $(el).parent().nextAll("table").first();
      if (!table.length) table = $(el).closest("table").length
        ? $(el).closest("table")
        : $();

      if (!table.length) return;

      const rows = parseTableRows(table);
      if (rows.length > 0 && (!sections[key] || rows.length > sections[key].length)) {
        // Keep the parse with the most rows (guards against partial matches)
        sections[key] = rows;
      }
    });

    // Strategy 2 (fallback): if we still don't have hourly data, scan all tables
    // and infer which is which from column headers / data patterns.
    if (!sections.hourly) {
      $("table").each((_, tableEl) => {
        const table = $(tableEl);
        const allRows: string[][] = [];
        table.find("tr").each((_, tr) => {
          const cells: string[] = [];
          $(tr).find("td, th").each((_, td) => cells.push($(td).text().trim()));
          if (cells.length >= 2) allRows.push(cells);
        });
        if (allRows.length < 2) return;

        const headerRow = allRows[0].join(" ").toLowerCase();
        const isHourly =
          headerRow.includes("lluvia") || headerRow.includes("temp") || headerRow.includes("hr");
        const isDaily =
          (headerRow.includes("lluvia") || headerRow.includes("fecha")) &&
          allRows.length <= 35 &&
          !isHourly;

        const dataRows = allRows.filter(
          (r) => !r[0].toLowerCase().match(/^(fecha|date|hora)$/) && r.length >= 2
        );
        if (dataRows.length === 0) return;

        if (isHourly && !sections.hourly) sections.hourly = dataRows;
        else if (isDaily && !sections.daily) sections.daily = dataRows;
      });
    }

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

    // ─── 4-hour blended forecast (IMN stats × obs-weight + NWP × model-weight) ─
    const extendedForecast = ([1, 2, 3, 4] as const).map((horizon, i) => {
      const imnEst = r(imnHorizonEstimate(forecastValues, horizon, ema));
      const ometVal = ometNext4h[i];
      const imnW  = BLEND_IMN_WEIGHT[i];
      const ometW = 1 - imnW;
      const blended = ometVal !== null
        ? r(imnEst * imnW + ometVal * ometW)
        : imnEst;
      return {
        horizon,                           // 1–4
        label: `+${horizon}h`,
        imnForecast_mm:   imnEst,
        modelForecast_mm: ometVal !== null ? r(ometVal) : null,
        blended_mm:       blended,
        imnWeight:        imnW,
        modelWeight:      ometVal !== null ? ometW : null,
        hasModel:         ometVal !== null,
      };
    });

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
        nextHour_mm:      Math.round(ema * 10) / 10,
        confidence,
        consensusMm,
        method:           "EMA (α=0.6)",
        methods:          forecastMethods,
        extended:         extendedForecast,
        modelSource:      "Open-Meteo / P.N. Juan Castro Blanco",
        modelAvailable:   ometNext4h.some((v) => v !== null),
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
