"use client";

import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, Cell,
} from "recharts";
import type { ForecastHour } from "@/lib/types/tiempo-model";
import { CHART, AXIS_LEFT_MARGIN } from "../chartTheme";

type Row = {
  h: string;
  hour: number;
  mm: number;
  band: [number, number];
  prob: number;
  op: boolean;
};

function mmColor(mm: number): string {
  if (mm >= 12) return "#ef4444";
  if (mm >= 4) return "#f59e0b";
  if (mm >= 1) return "#facc15";
  if (mm > 0.15) return "#38bdf8";
  return "#3f6212";
}

function Tip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Row }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-zinc-400">{p.h}{p.op ? " · ventana del tour" : ""}</p>
      <p className="font-bold" style={{ color: CHART.rain }}>Esperado: {p.mm.toFixed(1)} mm</p>
      <p className="text-zinc-400">Rango p10–p90: {p.band[0].toFixed(1)}–{p.band[1].toFixed(1)} mm</p>
      <p className="font-bold text-teal-300">Prob. lluvia: {Math.round(p.prob * 100)}%</p>
    </div>
  );
}

export function HourlyForecastChart({
  hourly, opWindow,
}: {
  hourly: ForecastHour[];
  opWindow: [number, number];
}) {
  const data: Row[] = hourly.map((x) => ({
    h: `${String(x.hour).padStart(2, "0")}:00`,
    hour: x.hour,
    mm: x.expectedMm,
    band: [x.p10Mm, x.p90Mm],
    prob: x.rainProb,
    op: x.inOperatingWindow,
  }));

  return (
    <ResponsiveContainer width="100%" height={210} minWidth={1} minHeight={1}>
      <ComposedChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: AXIS_LEFT_MARGIN }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="h" tick={CHART.axisTick} tickLine={CHART.tickLine} axisLine={CHART.axisLine} interval={2} />
        <YAxis yAxisId="mm" tick={CHART.axisTick} tickLine={CHART.tickLine} axisLine={CHART.axisLine} width={26} />
        <YAxis
          yAxisId="p" orientation="right" domain={[0, 100]}
          tick={{ ...CHART.axisTick, fill: "#5eead4" }} tickLine={CHART.tickLine} axisLine={CHART.axisLine} width={30}
        />
        <Tooltip content={<Tip />} cursor={{ fill: CHART.cursorFill }} />
        <ReferenceArea
          yAxisId="mm"
          x1={`${String(opWindow[0]).padStart(2, "0")}:00`}
          x2={`${String(opWindow[1]).padStart(2, "0")}:00`}
          fill="#00C4B0" fillOpacity={0.06}
        />
        <Area
          yAxisId="mm" type="monotone" dataKey="band" name="p10–p90"
          stroke="none" fill="#38bdf8" fillOpacity={0.12} isAnimationActive={false}
        />
        <Bar yAxisId="mm" dataKey="mm" name="Lluvia esperada (mm)" radius={[2, 2, 0, 0]} maxBarSize={16}>
          {data.map((d, i) => <Cell key={i} fill={mmColor(d.mm)} fillOpacity={0.9} />)}
        </Bar>
        <Line
          yAxisId="p" type="monotone" dataKey={(d: Row) => d.prob * 100}
          name="Prob. lluvia (%)" stroke="#2dd4bf" strokeWidth={2} dot={false} isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
