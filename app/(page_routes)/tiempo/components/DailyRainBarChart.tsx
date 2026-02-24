"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

type DailyEntry = { fecha: string; lluvia_mm: number };

function getBarColor(mm: number): string {
  if (mm >= 50) return "#ef4444"; // red – extreme
  if (mm >= 20) return "#f59e0b"; // amber – heavy
  if (mm >= 5)  return "#3b82f6"; // blue – moderate
  return "#93c5fd";               // light blue – light/trace
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = getBarColor(d.mm);
  return (
    <div className="bg-slate-800/95 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
      <p className="text-slate-300 font-medium mb-1">{d.fecha}</p>
      <p style={{ color }}>
        Lluvia: <span className="font-bold">{d.mm.toFixed(1)} mm</span>
      </p>
    </div>
  );
};

export default function DailyRainBarChart({ daily }: { daily: DailyEntry[] }) {
  const chartData = daily
    .slice(0, 14)
    .reverse()
    .map((d) => ({
      fecha: d.fecha.length > 10 ? d.fecha.slice(0, 10) : d.fecha,
      mm: d.lluvia_mm,
    }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 65 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="fecha"
            stroke="#94a3b8"
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 11 }}
          />
          <YAxis stroke="#94a3b8" unit=" mm" width={45} tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={20}
            stroke="#f59e0b"
            strokeDasharray="4 2"
            label={{ value: "20 mm", fill: "#f59e0b", fontSize: 11, position: "right" }}
          />
          <ReferenceLine
            y={50}
            stroke="#ef4444"
            strokeDasharray="4 2"
            label={{ value: "50 mm", fill: "#ef4444", fontSize: 11, position: "right" }}
          />
          <Bar dataKey="mm" name="Lluvia diaria" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={getBarColor(entry.mm)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
