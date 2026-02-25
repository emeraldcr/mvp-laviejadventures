import { useState, useCallback, useEffect, useMemo } from "react";
import {
  getDecision,
  buildHourlyChart,
  buildForecastChart,
  buildRiskChart,
  buildDailyChart,
} from "@/app/lib/tiempoHelpers";
import type { RainData, RegionalData } from "@/lib/types";
import type { WeatherSnapshot } from "@/app/lib/weatherMessageHelpers";

const RELOAD_COOLDOWN_SECS = 30;

export function useTiempoData() {
  const [rain, setRain] = useState<RainData | null>(null);
  const [regional, setRegional] = useState<RegionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [showRawForecast, setShowRawForecast] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.allSettled([
        fetch("/api/tiempo?hours=24").then(r => r.json()),
        fetch("/api/tiempo/regional").then(r => r.json()),
      ]);
      if (r1.status === "fulfilled") setRain(r1.value);
      if (r2.status === "fulfilled") setRegional(r2.value);
      setLastRefresh(new Date());
      setCooldown(RELOAD_COOLDOWN_SECS);
    } catch { /* silent */ } finally { setLoading(false); }
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
      intensity:   rain.status.intensity,
      trend:       rain.status.trend,
      consensusMm: rain.forecast?.consensusMm ?? 0,
      confidence:  rain.forecast?.confidence  ?? "baja",
      wetStreak:   rain.stats?.wetStreak  ?? 0,
      dryStreak:   rain.stats?.dryStreak  ?? 0,
      avgTemp24h:  rain.weather?.avgTemp24h ?? null,
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
  };
}
