"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import type { RollingRiskEntry } from "@/lib/types";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800/95 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
      <p className="text-slate-300 font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value?.toFixed(1)} mm</span>
        </p>
      ))}
    </div>
  );
};

export default function RollingRiskChart({ data }: { data: RollingRiskEntry[] }) {
  const chartData = data.map((d) => {
    let label = d.fecha;
    if (d.timestampISO) {
      try { label = format(parseISO(d.timestampISO), "HH:mm", { locale: es }); } catch {}
    }
    return { label, r3h: d.r3h, r6h: d.r6h };
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 10, right: 60, left: 10, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="label"
            stroke="#94a3b8"
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 11 }}
          />
          <YAxis stroke="#94a3b8" unit=" mm" width={45} tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: "12px", color: "#cbd5e1" }} />

          {/* 3h thresholds */}
          <ReferenceLine
            y={10}
            stroke="#facc15"
            strokeDasharray="4 2"
            label={{ value: "3h caución", fill: "#facc15", fontSize: 10, position: "insideTopRight" }}
          />
          <ReferenceLine
            y={20}
            stroke="#ef4444"
            strokeDasharray="4 2"
            label={{ value: "3h riesgo", fill: "#ef4444", fontSize: 10, position: "insideTopRight" }}
          />

          <Line
            type="monotone"
            dataKey="r3h"
            name="Acum. 3h móvil"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="r6h"
            name="Acum. 6h móvil"
            stroke="#34d399"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
