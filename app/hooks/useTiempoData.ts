import { useState, useCallback, useEffect, useMemo } from "react";
import {
  getDecision,
  buildHourlyChart,
  buildForecastChart,
  buildRiskChart,
  buildDailyChart,
} from "@/lib/tiempoHelpers";
import type { RainData, RegionalData } from "@/lib/types/index";
import type { WeatherSnapshot } from "@/lib/weatherMessageHelpers";

const RELOAD_COOLDOWN_SECS = 30;

export function useTiempoData() {
  const [rain, setRain] = useState<RainData | null>(null);
  const [regional, setRegional] = useState<RegionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showRawForecast, setShowRawForecast] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [fetchWarning, setFetchWarning] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      setFetchWarning(null);
      const [r1, r2] = await Promise.allSettled([
        fetch("/api/tiempo?hours=24").then(r => r.json()),
        fetch("/api/tiempo/regional").then(r => r.json()),
      ]);

      if (r1.status === "fulfilled" && r1.value?.success) setRain(r1.value);
      if (r2.status === "fulfilled" && r2.value?.success) setRegional(r2.value);

      if (r1.status !== "fulfilled" || !r1.value?.success) {
        setFetchWarning("Datos locales de lluvia no disponibles temporalmente.");
      }
      if (r2.status !== "fulfilled" || !r2.value?.success) {
        setFetchWarning(prev => prev
          ? `${prev} Contexto regional no disponible.`
          : "Contexto regional no disponible temporalmente.");
      }

      setLastRefresh(new Date());
      setCooldown(RELOAD_COOLDOWN_SECS);
    } catch {
      setFetchWarning("No se pudieron actualizar los datos en este momento.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const decision = getDecision(rain);

  const weatherSnap = useMemo<WeatherSnapshot | null>(() => {
    if (!rain?.status) return null;
    return {
      risk:        rain.status.risk,
      riskLabel:   rain.status.riskLabel,
      last1h_mm:   rain.stats?.last1h_mm  ?? 0,
      last3h_mm:   rain.stats?.last3h_mm  ?? 0,
      last6h_mm:   rain.stats?.last6h_mm  ?? 0,
      last24h_mm:  rain.stats?.last24h_mm ?? 0,
      last48h_mm:  rain.stats?.last48h_mm ?? 0,
      intensity:   rain.status.intensity,
      trend:       rain.status.trend,
      wetHoursLast24: rain.stats?.wetHoursLast24 ?? 0,
      consensusMm: rain.forecast?.consensusMm ?? 0,
      forecastNextHourMm: rain.forecast?.nextHour_mm ?? 0,
      confidence:  rain.forecast?.confidence  ?? "baja",
      wetStreak:   rain.stats?.wetStreak  ?? 0,
      dryStreak:   rain.stats?.dryStreak  ?? 0,
      peakHourMm:  rain.stats?.peakHour24h?.mm ?? 0,
      peakHourLabel: rain.stats?.peakHour24h?.fecha ?? "",
      stationName: rain.meta?.station ?? "San Carlos",
      currentSumMm: rain.currentSnapshot?.sum_lluv_mm ?? 0,
      yesterdayMm: rain.currentSnapshot?.lluv_ayer_mm ?? 0,
      avgTemp24h:  rain.weather?.avgTemp24h ?? null,
      maxTemp24h:  rain.weather?.maxTemp24h ?? null,
      minTemp24h:  rain.weather?.minTemp24h ?? null,
      avgHR24h:    rain.weather?.avgHR24h   ?? null,
    };
  }, [rain]);

  const hourlyChart  = useMemo(() => buildHourlyChart(rain),   [rain]);
  const forecastChart = useMemo(() => buildForecastChart(rain), [rain]);
  const riskChart    = useMemo(() => buildRiskChart(rain),     [rain]);
  const dailyChart   = useMemo(() => buildDailyChart(rain),    [rain]);

  return {
    rain,
    regional,
    loading,
    lastRefresh,
    cooldown,
    fetchAll,
    decision,
    weatherSnap,
    hourlyChart,
    forecastChart,
    riskChart,
    dailyChart,
    showRawForecast,
    setShowRawForecast,
    fetchWarning,
  };
}
