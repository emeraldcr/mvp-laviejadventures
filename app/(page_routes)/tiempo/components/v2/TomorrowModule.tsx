"use client";

import { useState } from "react";
import { CalendarClock, Sunrise, CloudRain, Umbrella, ChevronDown } from "lucide-react";
import type { TiempoModel, ForecastBlock } from "@/lib/types/tiempo-model";
import { ConfidencePill } from "./ConfidencePill";
import { MethodNote } from "./MethodNote";
import { HourlyForecastChart } from "./HourlyForecastChart";

const VERDICT_TONE: Record<ForecastBlock["verdict"], { box: string; label: string }> = {
  seco: { box: "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300", label: "Seco" },
  llovizna: { box: "border-yellow-500/30 bg-yellow-500/[0.08] text-yellow-200", label: "Llovizna" },
  lluvia: { box: "border-amber-500/30 bg-amber-500/[0.08] text-amber-300", label: "Lluvia" },
  "lluvia-fuerte": { box: "border-red-500/35 bg-red-500/[0.08] text-red-300", label: "Lluvia fuerte" },
};

const CONF_DOT: Record<"alta" | "media" | "baja", string> = {
  alta: "bg-emerald-400", media: "bg-amber-400", baja: "bg-red-400",
};

function bestWindow(model: TiempoModel): { from: number; to: number; mm: number; prob: number } | null {
  const op = model.tomorrow.hourly.filter((h) => h.inOperatingWindow);
  if (op.length < 3) return null;
  let best: { from: number; to: number; score: number; mm: number; prob: number } | null = null;
  for (let i = 0; i + 2 < op.length; i++) {
    const w = op.slice(i, i + 3);
    const mm = w.reduce((a, x) => a + x.expectedMm, 0);
    const prob = Math.max(...w.map((x) => x.rainProb));
    const score = mm + 4 * prob;
    if (!best || score < best.score) {
      best = { from: w[0].hour, to: w[2].hour + 1, score, mm, prob };
    }
  }
  return best ? { from: best.from, to: best.to, mm: best.mm, prob: best.prob } : null;
}

export function TomorrowModule({ model }: { model: TiempoModel }) {
  const [openTable, setOpenTable] = useState(false);
  const t = model.tomorrow;
  const dateLabel = new Intl.DateTimeFormat("es-CR", {
    timeZone: "America/Costa_Rica", weekday: "long", day: "numeric", month: "long",
  }).format(new Date(`${t.dateISO}T12:00:00-06:00`));

  const best = bestWindow(model);
  const focusHours = t.hourly.filter((h) => h.hour >= 4 && h.hour <= 19);

  return (
    <section id="manana" className="scroll-mt-40 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#66ddcf] font-bold mb-1.5">
          2 · Estado de mañana · hora por hora
        </p>
        <div className="flex items-center gap-2">
          <CalendarClock size={20} className="text-amber-300" />
          <h2 className="text-2xl font-black text-white capitalize">{dateLabel}</h2>
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          Lluvia total esperada <strong className="text-white tabular-nums">{t.dailyExpectedMm.toFixed(1)} mm</strong>
          <span className="text-zinc-500"> (rango {t.dailyP10Mm.toFixed(0)}–{t.dailyP90Mm.toFixed(0)} mm)</span>
        </p>
      </div>

      <ConfidencePill score={model.confidence.tomorrow} label="estado de mañana" />

      {/* Bloques del día */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {t.blocks.map((b) => {
          const v = VERDICT_TONE[b.verdict];
          return (
            <div key={b.key} className={`rounded-xl border p-3 ${v.box}`}>
              <p className="text-[9px] uppercase tracking-widest font-bold opacity-70">{b.label}</p>
              <p className="mt-0.5 text-sm font-black">{v.label}</p>
              <p className="mt-1 text-[11px] tabular-nums opacity-80">
                {b.expectedMm.toFixed(1)} mm · {Math.round(b.rainProbMax * 100)}%
              </p>
              <p className="mt-1.5 flex items-center gap-1 text-[10px] opacity-70">
                <span className={`h-1.5 w-1.5 rounded-full ${CONF_DOT[b.confidence.level]}`} />
                conf. {b.confidence.score}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mejor ventana */}
      {best && (
        <div className="rounded-xl border border-teal-500/25 bg-teal-500/[0.06] px-4 py-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-teal-200">
            <Sunrise size={13} /> Mejor ventana para salir
          </p>
          <p className="mt-1 text-sm text-zinc-200">
            <strong className="tabular-nums">
              {String(best.from).padStart(2, "0")}:00–{String(best.to).padStart(2, "0")}:00
            </strong>{" "}
            — la franja más seca dentro del horario de operación
            <span className="text-zinc-500 tabular-nums"> ({best.mm.toFixed(1)} mm, prob. máx {Math.round(best.prob * 100)}%)</span>.
          </p>
        </div>
      )}

      {/* Gráfico horario */}
      <div className="rounded-xl bg-black/25 border border-white/8 p-3">
        <p className="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-wide text-zinc-500">
          <CloudRain size={12} /> Lluvia esperada por hora · banda p10–p90 · prob. (%) en el eje derecho ·
          franja teal = horario del tour
        </p>
        <HourlyForecastChart hourly={t.hourly} opWindow={[6, 16]} />
      </div>

      {/* Tabla horaria */}
      <div className="rounded-xl bg-black/25 border border-white/8">
        <button
          onClick={() => setOpenTable((v) => !v)}
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
        >
          <Umbrella size={13} className="text-sky-300" />
          <span className="flex-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            Detalle hora por hora (04:00–19:00)
          </span>
          <ChevronDown size={13} className={`text-zinc-500 transition-transform ${openTable ? "rotate-180" : ""}`} />
        </button>
        {openTable && (
          <div className="overflow-x-auto border-t border-white/8">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-zinc-600">
                  <th className="px-3 py-1.5 text-left font-bold">Hora</th>
                  <th className="px-2 py-1.5 text-right font-bold">Esper.</th>
                  <th className="px-2 py-1.5 text-right font-bold">p10–p90</th>
                  <th className="px-2 py-1.5 text-right font-bold">Prob.</th>
                  <th className="px-3 py-1.5 text-right font-bold">Tour</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 tabular-nums">
                {focusHours.map((h) => (
                  <tr key={h.hour} className={h.inOperatingWindow ? "bg-teal-500/[0.04]" : ""}>
                    <td className="px-3 py-1.5 text-left font-semibold text-zinc-300">
                      {String(h.hour).padStart(2, "0")}:00
                    </td>
                    <td className="px-2 py-1.5 text-right text-zinc-200">{h.expectedMm.toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right text-zinc-500">
                      {h.p10Mm.toFixed(1)}–{h.p90Mm.toFixed(1)}
                    </td>
                    <td className="px-2 py-1.5 text-right text-teal-300 font-semibold">
                      {Math.round(h.rainProb * 100)}%
                    </td>
                    <td className="px-3 py-1.5 text-right text-zinc-600">{h.inOperatingWindow ? "sí" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MethodNote>
        <p>
          <strong className="text-zinc-300">Ensemble de {t.secondaryAvailable ? "4" : "3"} métodos</strong>{" "}
          (pesos): climatología {t.methodWeights.climatology.toFixed(2)} · persistencia{" "}
          {t.methodWeights.persistence.toFixed(2)} · análogos {t.methodWeights.analog.toFixed(2)}
          {t.secondaryAvailable ? ` · Open-Meteo ${t.methodWeights.secondary.toFixed(2)}` : " · Open-Meteo 0 (no disponible)"}.
        </p>
        <p>
          <strong className="text-zinc-300">Climatología horaria:</strong> lluvia media por hora del día
          del histórico de la propia estación ({model.climatology.sampleHours} h, mes de{" "}
          {model.climatology.monthLabel}). Define la forma del día.
        </p>
        <p>
          <strong className="text-zinc-300">Persistencia AR(1):</strong> el total de hoy arrastra al de
          mañana con φ = {model.climatology.lag1Autocorr.toFixed(2)} sobre log-lluvia; media diaria
          histórica {model.climatology.dailyMeanMm.toFixed(1)} mm.
        </p>
        {t.analogs.length > 0 && (
          <div>
            <strong className="text-zinc-300">Días análogos</strong> (antecedente parecido al de hoy → lo que cayó al día siguiente):
            <ul className="mt-1 space-y-0.5">
              {t.analogs.map((an, i) => (
                <li key={i} className="tabular-nums text-zinc-500">
                  {an.dateISO ?? "—"}: {an.priorMm.toFixed(1)} mm → <span className="text-zinc-300">{an.nextMm.toFixed(1)} mm</span>{" "}
                  (peso {an.weight.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
        )}
        <p>
          <strong className="text-zinc-300">Banda p10–p90:</strong>{" "}
          <code className="text-teal-300">σ² = σ²ₘⁱₑₘᵇʳₒₛ + (0.6·esperado + 0.15)²</code>; agregación
          diaria con correlación intradía ρ = 0.45.
        </p>
      </MethodNote>
    </section>
  );
}
