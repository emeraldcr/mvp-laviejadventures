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
  ReferenceLine,
  Legend,
} from "recharts";
import { format, parseISO, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import type { HourlyRainEntry } from "@/lib/types/index";

type HourlyTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: ChartEntry }>;
};

type ChartEntry = {
  time: string;
  horaLabel: string;
  mm: number;
  acumulado: number;
  fullDate: string;
};


function HourlyTooltip({ active, payload }: HourlyTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800/95 border border-slate-600 rounded-lg p-3 shadow-xl text-sm">
        <p className="text-slate-300 font-medium mb-2">{data.fullDate}</p>
        <p className="text-blue-400">
          Lluvia: <span className="font-bold">{data.mm.toFixed(1)} mm</span>
        </p>
        <p className="text-teal-400">
          Acumulado: <span className="font-bold">{data.acumulado.toFixed(1)} mm</span>
        </p>
      </div>
    );
  }

  return null;
}

export default function HourlyRainChart({ hourly }: { hourly: HourlyRainEntry[] }) {
  // Prepare data: reverse to show oldest → newest (left to right)
  const chartData: ChartEntry[] = hourly
    .slice(0, 72) // máx 72 horas para no saturar el gráfico
    .reverse()
    .reduce<ChartEntry[]>((acc, item, index) => {
      let parsedTime: Date | null = null;

      if (item.timestampISO) {
        parsedTime = parseISO(item.timestampISO);
      } else if (item.fecha) {
        // fallback parsing si timestampISO falla
        parsedTime = parseIMNDateFallback(item.fecha);
      }

      const horaLabel = parsedTime
        ? format(parsedTime, "HH:mm", { locale: es })
        : (typeof item.fecha === 'string' && item.fecha.length >= 16
        ? item.fecha.slice(11, 16)
        : "??:??");

      const fullDate = parsedTime
        ? format(parsedTime, "dd MMM HH:mm", { locale: es })
        : item.fecha;

      const mm = item.lluvia_mm;

      // Calcular acumulado progresivo
      const acumulado = index === 0 ? mm : acc[index - 1].acumulado + mm;

      acc.push({
        time: horaLabel,
        horaLabel,
        mm,
        acumulado,
        fullDate,
      });

      return acc;
    }, []);

  // Función auxiliar de fallback (similar a la que usas en el API)
  function parseIMNDateFallback(str: string): Date | null {
    const cleaned = str.trim().replace(/\s+/g, " ");
    const patterns = [
      "dd/MM/yyyy hh:mm:ss a",
      "dd/MM/yyyy hh:mm a",
      "dd/MM/yyyy HH:mm",
    ];

    for (const pattern of patterns) {
      const dt = parse(cleaned, pattern, new Date(), { locale: es });
      if (isValid(dt)) return dt;
    }
    return null;
  }


  return (
    <div className="h-[320px] md:h-[400px] w-full">
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
        >
          <defs>
            <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorAccum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

          <XAxis
            dataKey="horaLabel"
            stroke="#94a3b8"
            angle={-45}
            textAnchor="end"
            height={70}
            interval="preserveStartEnd"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            yAxisId="left"
            stroke="#94a3b8"
            unit=" mm"
            tickFormatter={(value) => `${value}`}
            width={40}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#14b8a6"
            unit=" mm"
            tickFormatter={(value) => `${value}`}
            width={50}
          />

          <Tooltip content={<HourlyTooltip />} />

          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: "13px", color: "#cbd5e1" }}
          />

          {/* Umbrales de referencia útiles para crecida */}
          <ReferenceLine
            yAxisId="left"
            y={4}
            stroke="#facc15"
            strokeDasharray="3 3"
            label={{
              value: "Moderada",
              position: "right",
              fill: "#facc15",
              fontSize: 12,
            }}
          />
          <ReferenceLine
            yAxisId="left"
            y={12}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{
              value: "Intensa",
              position: "right",
              fill: "#ef4444",
              fontSize: 12,
            }}
          />

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="mm"
            name="Lluvia horaria"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRain)"
            dot={{ r: 3, strokeWidth: 2 }}
            activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
          />

          <Area
            yAxisId="right"
            type="monotone"
            dataKey="acumulado"
            name="Acumulado"
            stroke="#14b8a6"
            strokeWidth={2}
            fillOpacity={0.4}
            fill="url(#colorAccum)"
            dot={false}
            activeDot={{ r: 6, stroke: "#14b8a6", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}