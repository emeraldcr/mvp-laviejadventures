import { load, type Cheerio, type CheerioAPI, type Element } from "cheerio";
import { isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import type {
  CurrentTotals,
  DailyEntry,
  HourlyEntry,
  RainStatus,
  RiskDescriptor,
  TiempoSections,
} from "./types";

export function safeParseFloat(s?: string): number {
  if (!s) return 0;
  return parseFloat(s.replace(",", ".").trim()) || 0;
}

export function parseIMNDate(str: string): Date | null {
  const cleaned = str.trim().replace(/\s+/g, " ");
  let dt = parse(cleaned, "dd/MM/yyyy hh:mm:ss a", new Date(), { locale: es });
  if (!isValid(dt)) {
    dt = parse(cleaned, "dd/MM/yyyy hh:mm a", new Date(), { locale: es });
  }
  if (!isValid(dt)) {
    dt = parse(cleaned, "dd/MM/yyyy HH:mm", new Date());
  }
  if (!isValid(dt)) return null;

  const hoursInCostaRica = dt.getHours();
  const utcHour = hoursInCostaRica + 6; // Costa Rica = UTC-6 todo el año.
  return new Date(
    Date.UTC(
      dt.getFullYear(),
      dt.getMonth(),
      dt.getDate(),
      utcHour,
      dt.getMinutes(),
      dt.getSeconds(),
      dt.getMilliseconds(),
    ),
  );
}

export function getRainIntensity(mm: number): RainStatus {
  if (mm >= 12) return "intensa";
  if (mm >= 4) return "moderada";
  if (mm > 0.5) return "ligera";
  return "sin lluvia";
}

export function getRiskStatus(last3h: number, last6h: number, last24h: number): RiskDescriptor {
  if (last3h >= 20 || last6h >= 35 || last24h >= 70) {
    return { level: "red", label: "Riesgo alto – probable crecida rápida", emoji: "🔴" };
  }
  if (last3h >= 10 || last6h >= 18 || last24h >= 40) {
    return { level: "yellow", label: "Precaución – caudal puede subir", emoji: "🟡" };
  }
  return { level: "green", label: "Condiciones aceptables", emoji: "🟢" };
}

export function calculateEMA(values: number[], alpha = 0.6): number {
  if (values.length === 0) return 0;
  let ema = values[values.length - 1];
  for (let i = values.length - 2; i >= 0; i--) {
    ema = alpha * values[i] + (1 - alpha) * ema;
  }
  return ema;
}

export function linearRegressionForecast(values: number[]): number {
  const n = values.length;
  if (n < 2) return Math.max(0, values[0] ?? 0);

  const ordered = [...values].reverse();
  const xMean = (n - 1) / 2;
  const yMean = ordered.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;

  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (ordered[i] - yMean);
    den += (i - xMean) ** 2;
  }

  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  return Math.max(0, intercept + slope * n);
}

export function movingAverageForecast(values: number[], window: number): number {
  const slice = values.slice(0, window);
  return Math.max(0, slice.reduce((a, b) => a + b, 0) / Math.max(1, slice.length));
}

export function doubleEMAForecast(values: number[], alpha = 0.5, beta = 0.3): number {
  if (values.length === 0) return 0;

  const ordered = [...values].reverse();
  let level = ordered[0];
  let trend = ordered.length > 1 ? ordered[1] - ordered[0] : 0;

  for (let i = 1; i < ordered.length; i++) {
    const prevLevel = level;
    level = alpha * ordered[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  return Math.max(0, level + trend);
}

export function weightedMovingAverage(values: number[], window: number): number {
  const slice = values.slice(0, window);
  const n = slice.length;
  if (n === 0) return 0;

  const totalWeight = (n * (n + 1)) / 2;
  const weighted = slice.reduce((sum, v, i) => sum + v * (n - i), 0);
  return Math.max(0, weighted / totalWeight);
}

export function getConfidence(length: number, std: number): "baja" | "media" | "alta" {
  if (length >= 8 && std < 2.5) return "alta";
  if (length >= 5) return "media";
  return "baja";
}

export function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

function parseTableRows($: CheerioAPI, table: Cheerio<Element>): string[][] {
  const rows: string[][] = [];
  table.find("tr").each((_, tr) => {
    const cells: string[] = [];
    $(tr)
      .find("td, th")
      .each((_, td) => cells.push($(td).text().trim()));

    if (cells.length >= 2 && !cells[0].toLowerCase().match(/^(fecha|date|hora)$/)) {
      rows.push(cells);
    }
  });
  return rows;
}

export function extractSections(html: string): TiempoSections {
  const $ = load(html);
  const sections: TiempoSections = {};
  const titleSelector = "p, h2, h3, h4, h5, h6, td, th, div, span, b, strong";

  $(titleSelector).each((_, el) => {
    const ownText = $(el).clone().children().remove().end().text().trim();
    const fullText = $(el).text().trim();
    const titleText = ownText.length > 0 && ownText.length < 120 ? ownText : fullText;

    if (!titleText.includes("Tabla de datos:") || titleText.length > 200) return;

    const key = titleText.includes("Horarios")
      ? "hourly"
      : titleText.includes("Actuales")
        ? "current"
        : titleText.includes("Diarios")
          ? "daily"
          : null;

    if (!key) return;

    let table = $(el).nextAll("table").first();
    if (!table.length) table = $(el).parent().nextAll("table").first();
    if (!table.length) table = $(el).closest("table").length ? $(el).closest("table") : $();
    if (!table.length) return;

    const rows = parseTableRows($, table);
    if (rows.length > 0 && (!sections[key] || rows.length > sections[key].length)) {
      sections[key] = rows;
    }
  });

  if (!sections.hourly) {
    $("table").each((_, tableEl) => {
      const table = $(tableEl);
      const allRows: string[][] = [];

      table.find("tr").each((_, tr) => {
        const cells: string[] = [];
        $(tr)
          .find("td, th")
          .each((_, td) => cells.push($(td).text().trim()));
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
        (r) => !r[0].toLowerCase().match(/^(fecha|date|hora)$/) && r.length >= 2,
      );
      if (dataRows.length === 0) return;

      if (isHourly && !sections.hourly) sections.hourly = dataRows;
      else if (isDaily && !sections.daily) sections.daily = dataRows;
    });
  }

  return sections;
}

export function parseHourlyRows(rows: string[][]): HourlyEntry[] {
  return rows.map((cells) => {
    const fecha = cells[0]?.trim() ?? "";
    const timestamp = parseIMNDate(fecha);

    let lluvia_mm: number;
    let temp_c: number | null = null;
    let hr_pct: number | null = null;

    if (cells.length >= 4) {
      const t = safeParseFloat(cells[1]);
      const h = safeParseFloat(cells[2]);
      const l = safeParseFloat(cells[3]);
      temp_c = t >= 5 && t <= 45 ? t : null;
      hr_pct = h > 0 && h <= 100 ? h : null;
      lluvia_mm = l;
    } else {
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
}

export function parseCurrentTotals(rows?: string[][]): CurrentTotals {
  if (!rows?.length) return null;

  const [fechaRaw, sumRaw, ayerRaw] = rows[0];
  const timestamp = parseIMNDate(fechaRaw);

  return {
    fecha: fechaRaw.trim(),
    timestamp,
    sum_lluv_mm: safeParseFloat(sumRaw),
    lluv_ayer_mm: safeParseFloat(ayerRaw),
  };
}

export function parseDailyRows(rows?: string[][]): DailyEntry[] {
  return (rows ?? []).map(([fechaRaw, lluviaRaw]) => ({
    fecha: fechaRaw.trim(),
    timestamp: parseIMNDate(fechaRaw),
    lluvia_mm: safeParseFloat(lluviaRaw),
  }));
}
