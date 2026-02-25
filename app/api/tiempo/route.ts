import { NextResponse } from "next/server";
import {
  calculateEMA,
  doubleEMAForecast,
  extractSections,
  getConfidence,
  getRainIntensity,
  getRiskStatus,
  linearRegressionForecast,
  movingAverageForecast,
  parseCurrentTotals,
  parseDailyRows,
  parseHourlyRows,
  round1,
  weightedMovingAverage,
} from "./helpers";
import { ABBREVIATIONS, CACHE_TTL_SECONDS, FETCH_HEADERS, IMN_URL } from "./types";


function estimateRiverLevel(sumLluvMm: number) {
  const level = 0.45 + sumLluvMm * 0.012;
  if (level >= 1.8) {
    return {
      station: "Río La Vieja (Sucre)",
      label: "Crecida fuerte",
      status: "critico" as const,
      estimatedLevelM: round1(level),
      guidance: "Evitar ingresos al cañón. Revisar en sitio antes de operar.",
    };
  }
  if (level >= 1.4) {
    return {
      station: "Río La Vieja (Sucre)",
      label: "Caudal alto",
      status: "alto" as const,
      estimatedLevelM: round1(level),
      guidance: "Operar solo con alta precaución y monitoreo constante.",
    };
  }
  if (level >= 0.95) {
    return {
      station: "Río La Vieja (Sucre)",
      label: "Caudal normal",
      status: "normal" as const,
      estimatedLevelM: round1(level),
      guidance: "Condiciones operativas normales, mantener observación.",
    };
  }
  return {
    station: "Río La Vieja (Sucre)",
    label: "Caudal bajo",
    status: "bajo" as const,
    estimatedLevelM: round1(level),
    guidance: "Caudal bajo. Mantener protocolos de seguridad estándar.",
  };
}

function buildReliability(args: { records24h: number; freshnessMinutes: number; hasCurrentSnapshot: boolean; }) {
  const { records24h, freshnessMinutes, hasCurrentSnapshot } = args;
  let score = 100;
  const reasons: string[] = [];

  if (records24h < 18) {
    score -= 35;
    reasons.push("faltan registros horarios en las últimas 24h");
  } else if (records24h < 24) {
    score -= 15;
    reasons.push("faltan algunos registros horarios");
  }

  if (freshnessMinutes > 180) {
    score -= 35;
    reasons.push("datos con más de 3 horas de atraso");
  } else if (freshnessMinutes > 90) {
    score -= 20;
    reasons.push("datos algo desactualizados");
  } else if (freshnessMinutes > 45) {
    score -= 10;
    reasons.push("actualización no reciente");
  }

  if (!hasCurrentSnapshot) {
    score -= 10;
    reasons.push("snapshot actual de estación no disponible");
  }

  score = Math.max(0, Math.min(100, score));
  const level = score >= 80 ? "alta" : score >= 55 ? "media" : "baja";

  return {
    level,
    score,
    reason: reasons.length ? reasons.join(" · ") : "datos consistentes y recientes",
    freshnessMinutes,
    records24h,
  };
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const full = searchParams.get("full") === "1";
  const hours = Math.min(Math.max(Number(searchParams.get("hours") ?? 72), 1), 120);
  const days = Math.min(Math.max(Number(searchParams.get("days") ?? 14), 1), 31);

  try {
    const res = await fetch(IMN_URL, {
      cache: "no-store",
      next: { revalidate: CACHE_TTL_SECONDS },
      headers: FETCH_HEADERS,
    });

    if (!res.ok) {
      throw new Error(`IMN fetch failed: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();
    const sections = extractSections(html);

    if (!sections.hourly?.length) {
      throw new Error("No se encontraron datos en la tabla Horarios");
    }

    const hourlyRows = parseHourlyRows(sections.hourly);
    const current = parseCurrentTotals(sections.current);
    const dailyRows = parseDailyRows(sections.daily);

    const lastValues = hourlyRows.map((r) => r.lluvia_mm);
    const last1h = lastValues[0] ?? 0;
    const last3h = hourlyRows.slice(0, 3).reduce((a, r) => a + r.lluvia_mm, 0);
    const last6h = hourlyRows.slice(0, 6).reduce((a, r) => a + r.lluvia_mm, 0);
    const last24h = hourlyRows.slice(0, 24).reduce((a, r) => a + r.lluvia_mm, 0);
    const last48h = hourlyRows.slice(0, 48).reduce((a, r) => a + r.lluvia_mm, 0);

    const intensity = getRainIntensity(last1h);
    const risk = getRiskStatus(last3h, last6h, last24h);

    const forecastValues = lastValues.slice(0, 12);
    const ema = calculateEMA(forecastValues);
    const recent8 = forecastValues.slice(0, 8);
    const mean8 = recent8.reduce((a, b) => a + b, 0) / Math.max(1, recent8.length);
    const variance8 =
      recent8.reduce((a, b) => a + (b - mean8) ** 2, 0) / Math.max(1, recent8.length - 1);
    const confidence = getConfidence(recent8.length, Math.sqrt(variance8));

    const forecastMethods = {
      ema: { value: round1(ema), label: "EMA exponencial (α=0.6)" },
      doubleEMA: {
        value: round1(doubleEMAForecast(forecastValues)),
        label: "Double EMA / Holt-Winters",
      },
      linearRegression: {
        value: round1(linearRegressionForecast(forecastValues)),
        label: "Regresión lineal (12h)",
      },
      movingAverage3h: {
        value: round1(movingAverageForecast(lastValues, 3)),
        label: "Media móvil simple (3h)",
      },
      movingAverage6h: {
        value: round1(movingAverageForecast(lastValues, 6)),
        label: "Media móvil simple (6h)",
      },
      weightedAverage6h: {
        value: round1(weightedMovingAverage(lastValues, 6)),
        label: "Media ponderada reciente (6h)",
      },
    };

    const consensusMm = round1(
      Object.values(forecastMethods).reduce((sum, method) => sum + method.value, 0) /
        Object.values(forecastMethods).length,
    );

    const recent24 = hourlyRows.slice(0, 24);
    const wetHoursLast24 = recent24.filter((r) => r.lluvia_mm > 0.5).length;
    const peakIdx24 = recent24.reduce(
      (maxI, row, i) => (row.lluvia_mm > (recent24[maxI]?.lluvia_mm ?? 0) ? i : maxI),
      0,
    );

    let wetStreak = 0;
    let dryStreak = 0;
    let mode: "wet" | "dry" | "unknown" = "unknown";
    for (const row of hourlyRows) {
      const wet = row.lluvia_mm > 0.5;
      if (mode === "unknown") mode = wet ? "wet" : "dry";
      if (mode === "wet" && wet) {
        wetStreak++;
        continue;
      }
      if (mode === "dry" && !wet) {
        dryStreak++;
        continue;
      }
      break;
    }

    const tempVals = recent24.map((r) => r.temp_c).filter((v): v is number => v !== null);
    const hrVals = recent24.map((r) => r.hr_pct).filter((v): v is number => v !== null);

    const rollingRisk = recent24
      .map((_, i, arr) => {
        const r3h = arr.slice(i, Math.min(i + 3, arr.length)).reduce((a, v) => a + v.lluvia_mm, 0);
        const r6h = arr.slice(i, Math.min(i + 6, arr.length)).reduce((a, v) => a + v.lluvia_mm, 0);
        return { fecha: arr[i].fecha, timestampISO: arr[i].timestampISO, r3h: round1(r3h), r6h: round1(r6h) };
      })
      .reverse();

    const lastUpdate = hourlyRows[0]?.timestamp ?? current?.timestamp ?? new Date();
    const freshnessMinutes = Math.max(0, Math.round((Date.now() - lastUpdate.getTime()) / 60000));
    const reliability = buildReliability({
      records24h: recent24.length,
      freshnessMinutes,
      hasCurrentSnapshot: Boolean(current),
    });
    const referenceMm = round1(current?.sum_lluv_mm ?? last24h);
    const riverLevel = estimateRiverLevel(referenceMm);

    return NextResponse.json(
      {
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
          lastHour_mm: round1(last1h),
          trend: last3h > last6h * 1.3 ? "subiendo" : last3h < last6h * 0.7 ? "bajando" : "estable",
        },
        now: { lastHour: hourlyRows[0] ?? null, currentTotals: current },
        stats: {
          last1h_mm: round1(last1h),
          last3h_mm: round1(last3h),
          last6h_mm: round1(last6h),
          last24h_mm: round1(last24h),
          last48h_mm: round1(last48h),
          wetHoursLast24,
          wetStreak,
          dryStreak,
          peakHour24h: {
            mm: round1(recent24[peakIdx24]?.lluvia_mm ?? 0),
            fecha: recent24[peakIdx24]?.fecha ?? "—",
          },
        },
        forecast: {
          nextHour_mm: round1(ema),
          confidence,
          consensusMm,
          method: "EMA (α=0.6)",
          methods: forecastMethods,
        },
        weather: {
          hasData: tempVals.length > 0,
          avgTemp24h: tempVals.length ? round1(tempVals.reduce((a, b) => a + b) / tempVals.length) : null,
          maxTemp24h: tempVals.length ? round1(Math.max(...tempVals)) : null,
          minTemp24h: tempVals.length ? round1(Math.min(...tempVals)) : null,
          avgHR24h: hrVals.length ? Math.round(hrVals.reduce((a, b) => a + b) / hrVals.length) : null,
          maxHR24h: hrVals.length ? Math.round(Math.max(...hrVals)) : null,
          minHR24h: hrVals.length ? Math.round(Math.min(...hrVals)) : null,
        },
        analysis: { rollingRisk },
        data: {
          hourly: full ? hourlyRows : hourlyRows.slice(0, hours),
          daily: full ? dailyRows : dailyRows.slice(0, days),
        },
        currentSnapshot: current,
        riverLevel: {
          ...riverLevel,
          referenceMm,
        },
        reliability,
        counts: { hourlyAvailable: hourlyRows.length, dailyAvailable: dailyRows.length },
      },
      {
        headers: {
          "Cache-Control": `s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=60`,
        },
      },
    );
  } catch (err: unknown) {
    console.error("[rain-msagrada]", err);
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error: "No pudimos obtener los datos del IMN en este momento",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 503 },
    );
  }
}
