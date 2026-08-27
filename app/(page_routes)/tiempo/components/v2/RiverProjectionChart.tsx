"use client";

import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceDot,
} from "recharts";
import type { RiverModel } from "@/lib/types/tiempo-model";
import { CHART, AXIS_LEFT_MARGIN } from "../chartTheme";

type Row = {
  k: number;
  label: string;
  full: string;
  idxObs: number | null;
  idxProj: number | null;
  band: [number, number] | null;
  observed: boolean;
};

function Tip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Row }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const v = p.observed ? p.idxObs : p.idxProj;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 text-zinc-400">{p.full} · {p.observed ? "medido" : "proyección"}</p>
      <p className="font-bold text-teal-300">Índice de caudal: {v?.toFixed(0) ?? "—"}/100</p>
      {!p.observed && p.band && (
        <p className="text-zinc-400">Rango p10–p90: {p.band[0].toFixed(0)}–{p.band[1].toFixed(0)}</p>
      )}
    </div>
  );
}

export function RiverProjectionChart({ river }: { river: RiverModel }) {
  const s = river.series;
  const lastObsIdx = (() => {
    let idx = 0;
    s.forEach((r, i) => { if (r.observed) idx = i; });
    return idx;
  })();

  const data: Row[] = s.map((r, i) => {
    const d = new Date(r.tsISO);
    const label = new Intl.DateTimeFormat("es-CR", {
      timeZone: "America/Costa_Rica", hour: "2-digit", hour12: false,
    }).format(d);
    const full = new Intl.DateTimeFormat("es-CR", {
      timeZone: "America/Costa_Rica", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(d);
    return {
      k: i,
      label,
      full,
      idxObs: r.observed || i === lastObsIdx ? r.index : null,
      idxProj: !r.observed || i === lastObsIdx ? r.index : null,
      band: r.observed ? null : [r.p10, r.p90],
      observed: r.observed,
    };
  });

  const peakK = river.peak
    ? s.findIndex((r) => r.tsISO === river.peak?.tsISO)
    : -1;

  return (
    <ResponsiveContainer width="100%" height={220} minWidth={1} minHeight={1}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: AXIS_LEFT_MARGIN }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="k" type="number" domain={["dataMin", "dataMax"]}
          tickFormatter={(k: number) => data[k]?.label ?? ""}
          tick={CHART.axisTick} tickLine={CHART.tickLine} axisLine={CHART.axisLine}
          interval={5}
        />
        <YAxis
          domain={[0, 100]} tick={CHART.axisTick} tickLine={CHART.tickLine}
          axisLine={CHART.axisLine} width={26}
        />
        <Tooltip content={<Tip />} />

        <ReferenceLine y={44} stroke="#f59e0b" strokeDasharray="3 2" strokeOpacity={0.55}
          label={{ value: "vigilar 44", fill: "#f59e0b", fontSize: 9, position: "insideBottomLeft" }} />
        <ReferenceLine y={62} stroke="#f97316" strokeDasharray="3 2" strokeOpacity={0.55}
          label={{ value: "alto 62", fill: "#f97316", fontSize: 9, position: "insideBottomLeft" }} />
        <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 2" strokeOpacity={0.55}
          label={{ value: "crítico 80", fill: "#ef4444", fontSize: 9, position: "insideBottomLeft" }} />

        <ReferenceLine x={lastObsIdx} stroke="#a1a1aa" strokeDasharray="2 2" strokeOpacity={0.7}
          label={{ value: "ahora", fill: "#a1a1aa", fontSize: 9, position: "top" }} />

        <Area
          type="monotone" dataKey="band" name="p10–p90"
          stroke="none" fill="#2dd4bf" fillOpacity={0.14} isAnimationActive={false} connectNulls
        />
        <Line
          type="monotone" dataKey="idxObs" name="Medido"
          stroke="#2dd4bf" strokeWidth={2.5} dot={false} isAnimationActive={false} connectNulls
        />
        <Line
          type="monotone" dataKey="idxProj" name="Proyección"
          stroke="#5eead4" strokeWidth={2} strokeDasharray="5 3" dot={false}
          isAnimationActive={false} connectNulls
        />
        {peakK >= 0 && river.peak && (
          <ReferenceDot x={peakK} y={river.peak.index} r={4} fill="#f97316" stroke="#0d0f0f" />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
