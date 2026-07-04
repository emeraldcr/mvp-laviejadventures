import { NextResponse } from "next/server";
import {
  extractSections,
  getRainIntensity,
  getRiskStatus,
  parseCurrentTotals,
  parseDailyRows,
  parseHourlyRows,
  round1,
} from "./helpers";
import { ABBREVIATIONS, CACHE_TTL_SECONDS, FETCH_HEADERS, IMN_URL } from "@/lib/types/tiempo-api";

// La estación de la Reserva Montaña Sagrada solo mide LLUVIA (mm).
// No hay sensor de temperatura, humedad ni un limnímetro de río. Por eso todo
// lo que se muestra al usuario se deriva de la lluvia y se etiqueta con honestidad:
// no inventamos un "nivel del río en metros".

function buildCrecidaRisk(last3h: number, last6h: number, last24h: number) {
  if (last3h >= 20 || last6h >= 35 || last24h >= 70) {
    return {
      level: "critico" as const,
      label: "Riesgo alto de crecida",
      guidance: "Evitá ingresar al cañón. Confirmá condiciones en sitio antes de operar.",
      basisMm: round1(last3h),
    };
  }
  if (last3h >= 10 || last6h >= 18 || last24h >= 40) {
    return {
      level: "alto" as const,
      label: "El caudal puede subir",
      guidance: "Operar solo con alta precaución y monitoreo constante del río.",
      basisMm: round1(last3h),
    };
  }
  if (last3h >= 3 || last6h >= 6) {
    return {
      level: "moderado" as const,
      label: "Lluvia reciente",
      guidance: "Condiciones cambiantes. Mantené observación del río antes de entrar.",
      basisMm: round1(last3h),
    };
  }
  return {
    level: "bajo" as const,
    label: "Caudal estable",
    guidance: "Sin lluvia significativa reciente. Protocolos de seguridad estándar.",
    basisMm: round1(last3h),
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

    const last1h = hourlyRows[0]?.lluvia_mm ?? 0;
    const last3h = hourlyRows.slice(0, 3).reduce((a, r) => a + r.lluvia_mm, 0);
    const prev3h = hourlyRows.slice(3, 6).reduce((a, r) => a + r.lluvia_mm, 0);
    const last6h = hourlyRows.slice(0, 6).reduce((a, r) => a + r.lluvia_mm, 0);
    const last24h = hourlyRows.slice(0, 24).reduce((a, r) => a + r.lluvia_mm, 0);
    const last48h = hourlyRows.slice(0, 48).reduce((a, r) => a + r.lluvia_mm, 0);

    const intensity = getRainIntensity(last1h);
    const risk = getRiskStatus(last3h, last6h, last24h);

    // ── Señal única de tendencia (reemplaza el ensemble de 6 métodos) ──────────
    // Comparamos la lluvia de las últimas 3h contra las 3h previas. Es una lectura
    // honesta de "¿va subiendo o bajando?", sin pronósticos de falsa precisión.
    const trendDirection: "subiendo" | "estable" | "bajando" =
      last3h > prev3h + 1 ? "subiendo" : last3h < prev3h - 1 ? "bajando" : "estable";
    const trendLabel =
      trendDirection === "subiendo"
        ? "La lluvia va en aumento"
        : trendDirection === "bajando"
          ? "La lluvia va cediendo"
          : "Lluvia estable";

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

    const rollingRisk = recent24
      .map((_, i, arr) => {
        const r3h = arr.slice(i, Math.min(i + 3, arr.length)).reduce((a, v) => a + v.lluvia_mm, 0);
        const r6h = arr.slice(i, Math.min(i + 6, arr.length)).reduce((a, v) => a + v.lluvia_mm, 0);
        return { fecha: arr[i].fecha, timestampISO: arr[i].timestampISO, r3h: round1(r3h), r6h: round1(r6h) };
      })
      .reverse();

    const lastUpdate = hourlyRows[0]?.timestamp ?? current?.timestamp ?? new Date();
    const crecidaRisk = buildCrecidaRisk(last3h, last6h, last24h);

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
          trend: trendDirection,
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
        rainTrend: {
          direction: trendDirection,
          label: trendLabel,
          last3h_mm: round1(last3h),
          prev3h_mm: round1(prev3h),
        },
        analysis: { rollingRisk },
        data: {
          hourly: full ? hourlyRows : hourlyRows.slice(0, hours),
          daily: full ? dailyRows : dailyRows.slice(0, days),
        },
        currentSnapshot: current,
        crecidaRisk,
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
