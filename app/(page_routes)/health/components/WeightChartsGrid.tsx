"use client";

import { TIMEFRAMES } from "../constants";
import { WeightChartCard } from "./WeightChartCard";

export function WeightChartsGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {TIMEFRAMES.map((timeframe) => (
        <WeightChartCard key={timeframe.key} timeframe={timeframe} />
      ))}
    </div>
  );
}

