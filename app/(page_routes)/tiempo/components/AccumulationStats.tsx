import { CloudRain, Clock, CalendarDays, AlertTriangle, Droplet } from "lucide-react";
import type { AccumulationStatsProps } from "@/lib/types/index";

export default function AccumulationStats({
  last1h,
  last3h,
  last6h,
  last24h,
  last48h,
  todayAccum,
  yesterday,
  forecastNextHour,
  confidence,
  wetHoursLast24,
  wetStreak,
  dryStreak,
  peakHour24h,
}: AccumulationStatsProps) {

  const mainItems = [
    {
      label:  "Última hora",
      value:  last1h,
      icon:   <CloudRain className="w-5 h-5 text-sky-400" />,
      color:  "text-sky-300",
      suffix: "mm",
    },
    {
      label:  "Últimas 3h",
      value:  last3h,
      icon:   <Clock className="w-5 h-5 text-violet-400" />,
      color:  "text-violet-300",
      suffix: "mm",
    },
    {
      label:  "Últimas 6h",
      value:  last6h,
      icon:   <Clock className="w-5 h-5 text-indigo-400" />,
      color:  "text-indigo-300",
      suffix: "mm",
    },
    {
      label:  "Últimas 24h",
      value:  last24h,
      icon:   <Clock className="w-5 h-5 text-blue-400" />,
      color:  "text-blue-300",
      suffix: "mm",
    },
    {
      label:  "Últimas 48h",
      value:  last48h,
      icon:   <Clock className="w-5 h-5 text-teal-400" />,
      color:  "text-teal-300",
      suffix: "mm",
    },
    {
      label:  "Hoy (desde 7 a.m.)",
      value:  todayAccum,
      icon:   <CalendarDays className="w-5 h-5 text-cyan-400" />,
      color:  "text-cyan-300",
      suffix: "mm",
    },
    {
      label:  "Ayer (completo)",
      value:  yesterday,
      icon:   <CalendarDays className="w-5 h-5 text-purple-400" />,
      color:  "text-purple-300",
      suffix: "mm",
    },
    {
      label:  "Próxima hora (est.)",
      value:  forecastNextHour,
      icon:   <Droplet className="w-5 h-5 text-amber-400" />,
      color:  "text-amber-300 italic",
      suffix: `mm · conf. ${confidence}`,
      warning: confidence === "baja" ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 inline ml-1" /> : null,
    },
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl md:text-2xl font-semibold mb-5 text-slate-200">
        Acumulados y pronóstico
      </h3>

      {/* Main accumulation grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {mainItems.map((item, index) => (
          <div
            key={index}
            className="bg-slate-900/50 rounded-xl p-3 md:p-4 text-center border border-slate-700/70 hover:border-slate-600 transition-all"
          >
            <div className="flex justify-center mb-1.5">{item.icon}</div>
            <p className="text-xs text-slate-400 mb-1">{item.label}</p>
            <p className={`text-xl md:text-2xl font-bold ${item.color}`}>
              {typeof item.value === "number" ? item.value.toFixed(1) : item.value}
              <span className="text-sm font-normal ml-0.5">mm</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {item.suffix}
              {"warning" in item && item.warning}
            </p>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-700/60">
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-0.5">Horas con lluvia (24h)</p>
          <p className="text-xl font-bold text-blue-300">{wetHoursLast24}<span className="text-sm font-normal text-slate-400 ml-1">h</span></p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-0.5">Racha húmeda actual</p>
          <p className="text-xl font-bold text-teal-300">{wetStreak}<span className="text-sm font-normal text-slate-400 ml-1">h</span></p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-0.5">Racha seca actual</p>
          <p className="text-xl font-bold text-amber-300">{dryStreak}<span className="text-sm font-normal text-slate-400 ml-1">h</span></p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-0.5">Pico 24h</p>
          <p className="text-xl font-bold text-rose-300">{peakHour24h.mm.toFixed(1)}<span className="text-sm font-normal text-slate-400 ml-1">mm</span></p>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{peakHour24h.fecha}</p>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-4 text-center italic">
        Hoy y ayer referidos al período 7 a.m. – 7 a.m. (hora local CR)
      </p>
    </div>
  );
}
