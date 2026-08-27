"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { CloudRain } from "lucide-react";
import type { AccumulationPoint } from "@/lib/helpers/tiempoHelpers";
import { CHART, AXIS_LEFT_MARGIN } from "./chartTheme";

type TooltipEntry = { name?: string; value?: number; color?: string };
type TooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: AccumulationPoint } & TooltipEntry>;
};

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-zinc-400">
        {p.dia} · {p.hora}
      </p>
      <p className="font-bold" style={{ color: CHART.rain }}>
        Lluvia esa hora: {p.mm.toFixed(1)} mm
      </p>
      <p className="font-bold" style={{ color: CHART.accent }}>
        Acumulado 48 h: {p.cumulative.toFixed(1)} mm
      </p>
    </div>
  );
}

export function RainAccumulationChart({ data }: { data: AccumulationPoint[] }) {
  if (data.length < 2) {
    return (
      <p className="py-6 text-center text-xs text-zinc-600">Sin datos horarios suficientes.</p>
    );
  }

  const spanLabel =
    data[0].dia && data[data.length - 1].dia
      ? `${data[0].dia} → ${data[data.length - 1].dia}`
      : "últimas 48 h";

  return (
    <div>
      <p className="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-wide text-zinc-500">
        <CloudRain size={12} /> Cómo se acumuló la lluvia · {spanLabel}
      </p>
      <ResponsiveContainer width="100%" height={190} minWidth={1} minHeight={1}>
        <ComposedChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: AXIS_LEFT_MARGIN }}>
          <defs>
            <linearGradient id="accum-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.accent} stopOpacity={0.35} />
              <stop offset="100%" stopColor={CHART.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
          <XAxis
            dataKey="hora"
            tick={CHART.axisTick}
            tickLine={CHART.tickLine}
            axisLine={CHART.axisLine}
            interval={5}
          />
          <YAxis
            yAxisId="mm"
            tick={CHART.axisTick}
            tickLine={CHART.tickLine}
            axisLine={CHART.axisLine}
            width={28}
          />
          <YAxis
            yAxisId="acc"
            orientation="right"
            tick={{ ...CHART.axisTick, fill: CHART.accent }}
            tickLine={CHART.tickLine}
            axisLine={CHART.axisLine}
            width={30}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: CHART.cursorFill }} />
          <Legend
            verticalAlign="top"
            height={22}
            wrapperStyle={{ fontSize: 10, color: "#a1a1aa" }}
          />
          <ReferenceLine
            yAxisId="mm"
            y={4}
            stroke={CHART.warn}
            strokeDasharray="3 2"
            strokeOpacity={0.6}
            label={{ value: "moderada", fill: CHART.warn, fontSize: 9, position: "insideTopLeft" }}
          />
          <ReferenceLine
            yAxisId="mm"
            y={12}
            stroke={CHART.danger}
            strokeDasharray="3 2"
            strokeOpacity={0.6}
            label={{ value: "intensa", fill: CHART.danger, fontSize: 9, position: "insideTopLeft" }}
          />
          <Bar
            yAxisId="mm"
            dataKey="mm"
            name="Lluvia horaria (mm)"
            fill={CHART.rain}
            fillOpacity={0.8}
            radius={[2, 2, 0, 0]}
            maxBarSize={10}
          />
          <Line
            yAxisId="acc"
            type="monotone"
            dataKey="cumulative"
            name="Acumulado 48 h (mm)"
            stroke={CHART.accent}
            strokeWidth={2}
            dot={false}
            fill="url(#accum-fill)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
