import type { Saturation } from "@/lib/helpers/tiempoHelpers";
import { Waves } from "lucide-react";

export function SaturationGauge({ saturation }: { saturation: Saturation }) {
  return (
    <div className="rounded-2xl bg-black/30 border border-white/8 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Waves size={14} className="text-teal-400" />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
            Saturación del río
          </span>
        </div>
        <span className={`text-sm font-black ${saturation.color}`}>
          {saturation.shortLabel}
        </span>
      </div>

      <div className="relative h-3 rounded-full bg-white/8 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${saturation.barColor}`}
          style={{ width: `${saturation.percent}%` }}
        />
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-base font-bold ${saturation.color}`}>{saturation.label}</p>
        <span className="text-xs text-zinc-500 tabular-nums">{saturation.percent}%</span>
      </div>
      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{saturation.description}</p>
    </div>
  );
}