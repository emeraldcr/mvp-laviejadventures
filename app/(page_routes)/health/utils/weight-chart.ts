import type { ChartData, ChartOptions } from "chart.js";
import { BAR_GROUP_INTERVAL_MS, TIMEFRAMES } from "../constants";
import type { Person, Theme, Timeframe, WeightEntry } from "../types";

export class WeightChartHelper {
  static getDomain(entries: WeightEntry[]) {
    const weights = entries.map((entry) => entry.weight);
    const average = weights.length
      ? weights.reduce((total, value) => total + value, 0) / weights.length
      : 70;
    const minWeight = weights.length ? Math.min(...weights) : average;
    const maxWeight = weights.length ? Math.max(...weights) : average;
    const spreadPadding = (maxWeight - minWeight) / 2 + 3;
    const radius = Math.max(8, Math.min(14, average * 0.16), spreadPadding);
    const min = Math.max(0, Math.floor((average - radius) / 5) * 5);
    let max = Math.ceil((average + radius) / 5) * 5;

    if (max - min < 16) {
      max = min + 16;
    }

    return { min, max };
  }

  static getMedian(entries: WeightEntry[]) {
    const weights = entries
      .map((entry) => entry.weight)
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);

    if (!weights.length) return null;

    const middle = Math.floor(weights.length / 2);
    return weights.length % 2 === 0
      ? (weights[middle - 1] + weights[middle]) / 2
      : weights[middle];
  }

  static getVisibleEntries(entries: WeightEntry[]) {
    const median = WeightChartHelper.getMedian(entries);

    if (median === null) {
      return entries;
    }

    const allowedDistance = Math.max(12, median * 0.35);
    return entries.filter((entry) => Math.abs(entry.weight - median) <= allowedDistance);
  }

  static groupForBars(entries: WeightEntry[], timeframe: Timeframe) {
    const interval = BAR_GROUP_INTERVAL_MS[timeframe];
    const groups = new Map<number, WeightEntry[]>();

    entries.forEach((entry) => {
      const time = new Date(entry.timestamp).getTime();
      const bucket = Math.floor(time / interval) * interval;
      groups.set(bucket, [...(groups.get(bucket) ?? []), entry]);
    });

    return Array.from(groups.entries())
      .map(([bucket, group]) => {
        const averageWeight =
          group.reduce((total, entry) => total + entry.weight, 0) / group.length;

        return {
          id: `${timeframe}-${bucket}`,
          name: group[0].name,
          weight: averageWeight,
          timestamp: new Date(bucket + interval / 2).toISOString(),
        };
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  static getChartData(params: {
    entries: WeightEntry[];
    timeframe: Timeframe;
    selectedPerson: Person;
    theme: Theme;
  }): ChartData<"bar", { x: string; y: number }[]> {
    const groupedEntries = WeightChartHelper.groupForBars(
      WeightChartHelper.getVisibleEntries(params.entries),
      params.timeframe
    );
    const domain = WeightChartHelper.getDomain(groupedEntries);
    const isDark = params.theme === "dark";

    return {
      datasets: [
        {
          label: `${params.selectedPerson}'s Weight (kg)`,
          data: groupedEntries.map((entry) => ({ x: entry.timestamp, y: entry.weight })),
          base: domain.min,
          backgroundColor: isDark ? "#60a5fa" : "#2563eb",
          borderColor: isDark ? "#bfdbfe" : "#1d4ed8",
          borderRadius: 8,
          borderSkipped: false,
          borderWidth: 2,
          barPercentage: 0.95,
          categoryPercentage: 0.98,
          maxBarThickness: 56,
          minBarLength: 18,
        },
      ],
    };
  }

  static getChartOptions(params: {
    entries: WeightEntry[];
    timeframe: Timeframe;
    latestEntryTime?: number;
    theme: Theme;
  }): ChartOptions<"bar"> {
    const groupedEntries = WeightChartHelper.groupForBars(
      WeightChartHelper.getVisibleEntries(params.entries),
      params.timeframe
    );
    const domain = WeightChartHelper.getDomain(groupedEntries);
    const frame = TIMEFRAMES.find((item) => item.key === params.timeframe);
    const frameStart =
      frame?.hours && params.latestEntryTime
        ? params.latestEntryTime - frame.hours * 60 * 60 * 1000
        : undefined;
    const isDark = params.theme === "dark";
    const gridColor = isDark ? "rgba(148, 163, 184, 0.22)" : "rgba(148, 163, 184, 0.28)";
    const borderColor = isDark ? "#334155" : "#cbd5e1";
    const tickColor = isDark ? "#cbd5e1" : "#475569";
    const titleColor = isDark ? "#e2e8f0" : "#334155";

    return {
      responsive: true,
      maintainAspectRatio: false,
      parsing: {
        xAxisKey: "x",
        yAxisKey: "y",
      },
      interaction: {
        intersect: false,
        mode: "nearest",
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? "#020617" : "#111827",
          borderColor: isDark ? "#60a5fa" : "#2563eb",
          borderWidth: 1,
          bodyColor: "#f9fafb",
          displayColors: false,
          padding: 12,
          titleColor: "#bfdbfe",
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              return typeof value === "number" ? `${value.toFixed(2)} kg` : "";
            },
          },
        },
      },
      scales: {
        x: {
          type: "time",
          min: frameStart,
          max: frame?.hours ? params.latestEntryTime : undefined,
          time: { unit: frame?.unit ?? "day" },
          grid: {
            color: gridColor,
            drawTicks: true,
          },
          border: {
            color: borderColor,
          },
          ticks: {
            color: tickColor,
            maxRotation: 0,
            autoSkip: true,
          },
          title: {
            display: true,
            text: "Date & Time",
            color: titleColor,
            font: { weight: 600 },
          },
        },
        y: {
          stacked: true,
          grid: {
            color: gridColor,
          },
          border: {
            color: borderColor,
          },
          ticks: {
            color: tickColor,
            padding: 8,
            callback: (value) => `${value} kg`,
          },
          title: {
            display: true,
            text: "Weight (kg)",
            color: titleColor,
            font: { weight: 600 },
          },
          min: domain.min,
          max: domain.max,
        },
      },
    };
  }
}

