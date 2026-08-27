"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";
import { CloudRain, Activity } from "lucide-react";
import type { RainNarrative } from "@/lib/helpers/tiempoHelpers";
import type { AccumulationPoint } from "@/lib/helpers/tiempoHelpers";
import type { RainBaseline } from "@/lib/types/tiempo-api";
import { CustomBarTooltip } from "./CustomBarTooltip";
import { AccumulationPanel } from "./AccumulationPanel";
import { RainAccumulationChart } from "./RainAccumulationChart";
import { CHART, AXIS_LEFT_MARGIN } from "./chartTheme";

type RiskEntry = { hora: string; "3h": number; "6h": number };
type WindowStat = { label: string; mm: number };

export function RainHistorySection({
  narrative,
  accumulationSeries,
  riskChart,
  baseline,
  windows,
  todayMm,
  yesterdayMm,
}: {
  narrative: RainNarrative;
  accumulationSeries: AccumulationPoint[];
  riskChart: RiskEntry[];
  baseline: RainBaseline | null;
  windows: WindowStat[];
  todayMm: number;
  yesterdayMm: number;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 md:p-5 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CloudRain size={14} className="text-sky-400" />
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
            ¿Cómo ha estado lloviendo?
          </span>
        </div>
        <h2 className="text-lg font-bold text-white">{narrative.headline}</h2>
        <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{narrative.summary}</p>
      </div>

      <AccumulationPanel
        windows={windows}
        todayMm={todayMm}
        yesterdayMm={yesterdayMm}
        baseline={baseline}
      />

      {accumulationSeries.length >= 2 && (
        <div className="rounded-xl bg-black/25 border border-white/8 p-3">
          <RainAccumulationChart data={accumulationSeries} />
        </div>
      )}

      {riskChart.length > 0 && (
        <div className="rounded-xl bg-black/25 border border-white/8 p-3">
          <p className="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-wide text-zinc-500">
            <Activity size={12} /> Lluvia acumulada en ventanas móviles de 3 h y 6 h
          </p>
          <ResponsiveContainer width="100%" height={130} minWidth={1} minHeight={1}>
            <AreaChart data={riskChart} margin={{ top: 4, right: 4, bottom: 0, left: AXIS_LEFT_MARGIN }}>
              <defs>
                <linearGradient id="rr3h" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART.caution} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART.caution} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rr6h" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART.danger} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={CHART.danger} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
              <XAxis
                dataKey="hora"
                tick={CHART.axisTick}
                tickLine={CHART.tickLine}
                axisLine={CHART.axisLine}
                interval={2}
              />
              <YAxis tick={CHART.axisTick} tickLine={CHART.tickLine} axisLine={CHART.axisLine} width={26} />
              <Tooltip content={<CustomBarTooltip />} />
              <ReferenceLine
                y={10}
                stroke={CHART.caution}
                strokeDasharray="3 2"
                strokeOpacity={0.6}
                label={{ value: "caución 10", fill: CHART.caution, fontSize: 9, position: "insideTopLeft" }}
              />
              <ReferenceLine
                y={20}
                stroke={CHART.danger}
                strokeDasharray="3 2"
                strokeOpacity={0.6}
                label={{ value: "riesgo 20", fill: CHART.danger, fontSize: 9, position: "insideTopLeft" }}
              />
              <Area type="monotone" dataKey="3h" name="Acum. 3h" stroke={CHART.caution} fill="url(#rr3h)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="6h" name="Acum. 6h" stroke={CHART.danger} fill="url(#rr6h)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
