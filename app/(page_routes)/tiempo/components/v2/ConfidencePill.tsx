"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldQuestion, ChevronDown } from "lucide-react";
import type { ConfidenceScore } from "@/lib/types/tiempo-model";

const TONE: Record<ConfidenceScore["level"], { box: string; bar: string; Icon: typeof ShieldCheck }> = {
  alta: { box: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10", bar: "bg-emerald-400", Icon: ShieldCheck },
  media: { box: "text-amber-300 border-amber-500/30 bg-amber-500/10", bar: "bg-amber-400", Icon: ShieldAlert },
  baja: { box: "text-red-300 border-red-500/30 bg-red-500/10", bar: "bg-red-400", Icon: ShieldQuestion },
};

const LABEL: Record<ConfidenceScore["level"], string> = {
  alta: "Confianza alta",
  media: "Confianza media",
  baja: "Confianza baja",
};

export function ConfidencePill({
  score,
  label,
  className = "",
}: {
  score: ConfidenceScore;
  /** Qué se está midiendo, ej. "estado actual". */
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const t = TONE[score.level];
  const { Icon } = t;

  return (
    <div className={`rounded-xl border ${t.box} ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left"
      >
        <Icon size={15} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-wide">
              {LABEL[score.level]}
              {label ? <span className="ml-1 font-semibold opacity-70">· {label}</span> : null}
            </span>
            <span className="text-xs font-black tabular-nums">{score.score}<span className="opacity-60">/100</span></span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${score.score}%` }} />
          </div>
          <p className="mt-1 text-[11px] leading-4 opacity-80">{score.reason}</p>
        </div>
        {score.factors.length > 0 && (
          <ChevronDown size={13} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open && score.factors.length > 0 && (
        <div className="border-t border-current/15 px-3 py-2 space-y-1">
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Cómo se calcula</p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="opacity-70">Punto de partida</span>
            <span className="tabular-nums font-semibold">100</span>
          </div>
          {score.factors.map((f, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <span className="opacity-80">{f.label}</span>
              <span className={`tabular-nums font-semibold ${f.delta < 0 ? "text-red-300" : "text-emerald-300"}`}>
                {f.delta > 0 ? "+" : ""}{f.delta}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-current/15 pt-1 text-[11px] font-black">
            <span>Confianza</span>
            <span className="tabular-nums">{score.score}</span>
          </div>
        </div>
      )}
    </div>
  );
}
