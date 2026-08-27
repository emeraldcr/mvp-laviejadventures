import { Layers } from "lucide-react";
import type { RainBaseline } from "@/lib/types/tiempo-api";
import { mmToColor } from "@/lib/helpers/tiempoHelpers";

type WindowStat = { label: string; mm: number };

function baselineLine(b: RainBaseline | null): string {
  if (!b || b.todayVsAvgPct == null || b.sampleDays < 3) {
    return "Aún no hay suficiente histórico reciente para comparar con lo normal.";
  }
  const avg = b.dailyAvgMm.toFixed(1);
  const tail = `promedio ${avg} mm/día, últimos ${b.sampleDays} días`;
  if (b.todayVsAvgPct >= 100) {
    return `En lo que va del día ya cayó ${(b.todayVsAvgPct / 100).toFixed(1)}× un día normal (${tail}).`;
  }
  return `En lo que va del día lleva ${b.todayVsAvgPct}% de un día normal (${tail}).`;
}

function CompareBar({
  label,
  mm,
  max,
  tone,
}: {
  label: string;
  mm: number;
  max: number;
  tone: string;
}) {
  const pct = max > 0 ? Math.max(2, Math.round((mm / max) * 100)) : 2;
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-[10px] uppercase tracking-wide text-zinc-500 font-bold">
        {label}
      </span>
      <div className="relative h-4 flex-1 rounded-md bg-white/6 overflow-hidden">
        <div className={`h-full rounded-md ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-14 shrink-0 text-right text-xs font-bold tabular-nums text-zinc-200">
        {mm.toFixed(1)} mm
      </span>
    </div>
  );
}

export function AccumulationPanel({
  windows,
  todayMm,
  yesterdayMm,
  baseline,
}: {
  windows: WindowStat[];
  todayMm: number;
  yesterdayMm: number;
  baseline: RainBaseline | null;
}) {
  const typicalMm = baseline?.dailyAvgMm ?? 0;
  const max = Math.max(todayMm, yesterdayMm, typicalMm, 1);

  return (
    <div className="rounded-xl bg-black/25 border border-white/8 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Layers size={13} className="text-teal-400" />
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
          Acumulación de lluvia
        </span>
      </div>

      {/* Ventanas móviles */}
      <div className="grid grid-cols-5 gap-1.5">
        {windows.map((w) => (
          <div
            key={w.label}
            className="rounded-lg bg-white/[0.03] border border-white/8 px-1.5 py-2 text-center"
          >
            <p className="text-[9px] uppercase tracking-wide text-zinc-500 font-bold">{w.label}</p>
            <p
              className="mt-1 text-sm font-black tabular-nums"
              style={{ color: mmToColor(w.mm) }}
            >
              {w.mm.toFixed(1)}
            </p>
            <p className="text-[8px] text-zinc-600">mm</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-zinc-600 -mt-1">Ventana móvil hacia atrás desde la última lectura.</p>

      {/* Hoy vs ayer vs típico */}
      <div className="space-y-1.5 border-t border-white/8 pt-3">
        <CompareBar label="Hoy" mm={todayMm} max={max} tone="bg-[#00C4B0]" />
        <CompareBar label="Ayer" mm={yesterdayMm} max={max} tone="bg-sky-500/70" />
        <CompareBar label="Típico" mm={typicalMm} max={max} tone="bg-zinc-500/60" />
      </div>
      <p className="text-[11px] leading-4 text-zinc-400">{baselineLine(baseline)}</p>
      <p className="text-[10px] text-zinc-600">
        &ldquo;Hoy&rdquo; y &ldquo;ayer&rdquo; van de 7 a.m. a 7 a.m., como los reporta el IMN.
      </p>
    </div>
  );
}
