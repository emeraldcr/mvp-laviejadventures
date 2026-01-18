// dashboard/components/HourlyRainChart.tsx
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type HourlyData = { fecha: string; timestampISO: string; lluvia_mm: number };

export default function HourlyRainChart({ hourly }: { hourly: HourlyData[] }) {
  const chartData = hourly
    .slice(0, 48)
    .reverse() // para que el tiempo vaya de izquierda (antiguo) → derecha (reciente)
    .map((item) => ({
      hora: item.timestampISO
        ? new Date(item.timestampISO).toLocaleTimeString("es-CR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : item.fecha.slice(11, 16),
      mm: item.lluvia_mm,
    }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="hora" stroke="#94a3b8" angle={-45} textAnchor="end" height={60} />
          <YAxis stroke="#94a3b8" unit=" mm" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
            labelStyle={{ color: "#e2e8f0" }}
            itemStyle={{ color: "#60a5fa" }}
          />
          <Area
            type="monotone"
            dataKey="mm"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorRain)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}