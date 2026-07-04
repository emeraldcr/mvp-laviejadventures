"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { CloudRain } from "lucide-react";
import type { RainNarrative } from "@/lib/helpers/tiempoHelpers";
import { CustomBarTooltip } from "./CustomBarTooltip";
import { StatPill } from "./StatPill";

type ChartEntry = { hora: string; lluvia: number; fill: string };

export function RainHistorySection({
  narrative,
  chartData,
}: {
  narrative: RainNarrative;
  chartData: ChartEntry[];
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 space-y-4">
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

      <div className="grid grid-cols-3 gap-2">
        <StatPill label="Hoy" value={narrative.todayMm.toFixed(1)} unit="mm" highlight />
        <StatPill label="Ayer" value={narrative.yesterdayMm.toFixed(1)} unit="mm" />
        <StatPill label="Últimas 6h" value={narrative.last6hMm.toFixed(1)} unit="mm" />
      </div>

      {chartData.length > 0 ? (
        <div>
          <p className="text-[10px] text-zinc-600 mb-2 uppercase tracking-wide">
            Hora por hora · estación IMN
          </p>
          <ResponsiveContainer width="100%" height={110} minWidth={1} minHeight={1}>
            <BarChart data={chartData} barSize={16} margin={{ top: 4, right: 0, bottom: 0, left: -22 }}>
              <XAxis dataKey="hora" tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fontSize: 9, fill: "#71717a" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="lluvia" name="Lluvia" radius={[3, 3, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-xs text-zinc-600 text-center py-6">Sin datos de lluvia reciente</p>
      )}
    </div>
  );
}