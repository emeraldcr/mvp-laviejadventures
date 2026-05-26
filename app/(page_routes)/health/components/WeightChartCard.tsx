"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { useHealth } from "../context/HealthContext";
import type { TimeframeConfig } from "../types";
import { WeightChartHelper } from "../utils/weight-chart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export function WeightChartCard({ timeframe }: { timeframe: TimeframeConfig }) {
  const { selectedPerson, isDark, isLoading, latestEntryTime, theme, getFilteredEntries } = useHealth();
  const periodEntries = getFilteredEntries(timeframe.key);
  const chartEntries = WeightChartHelper.getVisibleEntries(periodEntries);
  const barEntries = WeightChartHelper.groupForBars(chartEntries, timeframe.key);
  const latestWeight = periodEntries[periodEntries.length - 1]?.weight;
  const chartData = WeightChartHelper.getChartData({
    entries: periodEntries,
    timeframe: timeframe.key,
    selectedPerson,
    theme,
  });
  const chartOptions = WeightChartHelper.getChartOptions({
    entries: periodEntries,
    timeframe: timeframe.key,
    latestEntryTime,
    theme,
  });

  return (
    <div
      className={`rounded-lg border p-5 shadow-sm sm:p-6 ${
        isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>
            {timeframe.label}
          </h2>
          <p className={`mt-1 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {barEntries.length} bars from {chartEntries.length} shown entries
          </p>
        </div>

        {latestWeight !== undefined && (
          <div
            className={`rounded-lg border px-3 py-2 text-right ${
              isDark ? "border-blue-500/30 bg-blue-500/10" : "border-blue-100 bg-blue-50"
            }`}
          >
            <p className={`text-xs font-semibold uppercase ${isDark ? "text-blue-200" : "text-blue-700"}`}>
              Latest
            </p>
            <p className={`text-lg font-bold tabular-nums ${isDark ? "text-white" : "text-blue-950"}`}>
              {latestWeight.toFixed(2)} kg
            </p>
          </div>
        )}
      </div>

      <div className={`h-80 rounded-lg border p-3 ${isDark ? "border-slate-800 bg-slate-950" : "border-slate-100 bg-slate-50"}`}>
        {isLoading ? (
          <div className={`flex h-full items-center justify-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Loading weights...
          </div>
        ) : periodEntries.length ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className={`flex h-full items-center justify-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            No {selectedPerson} entries in this range.
          </div>
        )}
      </div>
    </div>
  );
}

