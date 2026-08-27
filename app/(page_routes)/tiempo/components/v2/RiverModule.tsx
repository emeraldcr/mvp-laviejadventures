"use client";

import {
  Waves, AlertOctagon, TrendingUp, TrendingDown, Minus, Timer, ArrowDownToLine,
} from "lucide-react";
import type { TiempoModel } from "@/lib/types/tiempo-model";
import { ConfidencePill } from "./ConfidencePill";
import { MethodNote } from "./MethodNote";
import { RiverProjectionChart } from "./RiverProjectionChart";

const LEVEL_TONE: Record<
  TiempoModel["river"]["stateLevel"],
  { box: string; text: string; bar: string }
> = {
  bajo: { box: "border-emerald-500/30 bg-emerald-500/[0.08]", text: "text-emerald-300", bar: "bg-emerald-400" },
  moderado: { box: "border-yellow-500/30 bg-yellow-500/[0.08]", text: "text-yellow-200", bar: "bg-yellow-400" },
  alto: { box: "border-amber-500/35 bg-amber-500/[0.08]", text: "text-amber-300", bar: "bg-amber-400" },
  critico: { box: "border-red-500/40 bg-red-500/[0.10]", text: "text-red-300", bar: "bg-red-400" },
};

function trendMark(t: string) {
  if (t === "subiendo") return <TrendingUp size={14} className="text-red-400" />;
  if (t === "bajando") return <TrendingDown size={14} className="text-emerald-400" />;
  return <Minus size={14} className="text-zinc-400" />;
}

function MiniConf({ label, score }: { label: string; score: TiempoModel["confidence"]["now"] }) {
  const dot = score.level === "alta" ? "bg-emerald-400" : score.level === "media" ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="rounded-lg bg-black/25 border border-white/8 px-2.5 py-2">
      <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-zinc-200">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {score.score}<span className="text-zinc-600">/100</span>
      </p>
    </div>
  );
}

export function RiverModule({ model }: { model: TiempoModel }) {
  const r = model.river;
  const tone = LEVEL_TONE[r.stateLevel];
  const crecTone = LEVEL_TONE[r.crecida.level];
  const peakTime = r.peak?.tsISO
    ? new Intl.DateTimeFormat("es-CR", {
        timeZone: "America/Costa_Rica", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
      }).format(new Date(r.peak.tsISO))
    : null;

  return (
    <section id="rio" className="scroll-mt-40 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#66ddcf] font-bold mb-1.5">
            3 · Nivel del río · tramo del tour
          </p>
          <div className="flex items-center gap-2">
            <Waves size={22} className={tone.text} />
            <h2 className={`text-2xl font-black ${tone.text}`}>{r.stateLabel}</h2>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
            {trendMark(r.trend)} {r.trend} · variación {r.riseRateNowPerH > 0 ? "+" : ""}
            {r.riseRateNowPerH.toFixed(1)} pts/h
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-4xl font-black tabular-nums ${tone.text}`}>{r.indexNow.toFixed(0)}</div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">índice / 100</div>
        </div>
      </div>

      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${r.indexNow}%` }} />
      </div>

      <ConfidencePill score={model.confidence.river} label="nivel de río" />

      {/* Causa → efecto */}
      <div className="rounded-xl border border-white/8 bg-black/25 px-4 py-3">
        <p className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
          <Timer size={13} className="text-teal-400" /> Retardo estación → tramo del tour
        </p>
        <p className="mt-1 text-[13px] leading-5 text-zinc-400">{r.lagExplainer}</p>
      </div>

      {/* Proyección */}
      <div className="rounded-xl bg-black/25 border border-white/8 p-3">
        <p className="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-wide text-zinc-500">
          <Waves size={12} /> Índice de caudal · medido (sólido) + proyección 30 h (punteado) con banda p10–p90
        </p>
        <RiverProjectionChart river={r} />
        {r.peak && peakTime && (
          <p className="mt-2 text-[11px] text-zinc-400">
            {r.peak.exceedsNow ? (
              <>
                <span className="text-orange-300 font-bold">● Pico proyectado</span> {peakTime} · índice{" "}
                <strong className="tabular-nums">{r.peak.index.toFixed(0)}</strong>
                {r.peak.etaHours != null ? ` · en ~${r.peak.etaHours} h` : ""}
                {r.peak.fromForecastRain
                  ? " · depende de la lluvia pronosticada de mañana"
                  : " · por lluvia ya caída"}.
              </>
            ) : (
              <>
                El río viene <strong className="text-emerald-300">bajando</strong>. Máximo proyectado en
                30 h: índice <strong className="tabular-nums">{r.peak.index.toFixed(0)}</strong> ({peakTime}),
                por debajo del nivel actual salvo que llueva más de lo pronosticado.
              </>
            )}
          </p>
        )}
      </div>

      {/* Crecida */}
      <div className={`rounded-xl border px-4 py-3 ${crecTone.box}`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-300">Crecida estimada</p>
          {r.crecida.level === "critico"
            ? <AlertOctagon size={15} className={crecTone.text} />
            : <Waves size={15} className={crecTone.text} />}
        </div>
        <p className={`mt-1 text-lg font-black ${crecTone.text}`}>{r.crecida.label}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-300">{r.crecida.guidance}</p>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400 tabular-nums">
          <ArrowDownToLine size={11} />
          Base: {r.crecida.basisMm.toFixed(1)} mm/3 h medidos · ≈{r.crecida.triggerRainMm.toFixed(1)} mm más
          en 3 h llevarían el río a &ldquo;va a subir&rdquo;.
        </p>
      </div>

      {/* Confianza por horizonte */}
      <div className="grid grid-cols-3 gap-2">
        <MiniConf label="Ahora" score={r.confidence.now} />
        <MiniConf label="+6 h" score={r.confidence.plus6h} />
        <MiniConf label="+24 h" score={r.confidence.plus24h} />
      </div>

      <MethodNote>
        <p>
          <strong className="text-zinc-300">Cadena causal:</strong> lluvia en la estación → lluvia
          efectiva <code className="text-teal-300">Pe = P · C(API)</code> → se enruta al tramo del tour
          con un <strong>hidrograma unitario</strong> (función gamma, pico a {r.timeToPeakH} h, base{" "}
          {r.baseTimeH} h) → respuesta rápida. El flujo base sale de la recesión del API.
        </p>
        <p>
          <strong className="text-zinc-300">Índice 0–100</strong> ={" "}
          <code className="text-teal-300">0.6 · regla(3 h/6 h/24 h) + 0.4 · hidrograma</code>. La
          &ldquo;regla&rdquo; está anclada a los umbrales de crecida que ya usa el equipo
          (10/18/40 mm = vigilar; 20/35/70 mm = crítico).
        </p>
        <p>
          <strong className="text-zinc-300">Proyección:</strong> la cola de la lluvia ya medida sigue
          enrutándose (alta confianza las primeras {r.timeToPeakH}–6 h); más allá se alimenta del
          pronóstico horario de mañana, de ahí la banda p10–p90.
        </p>
        <p className="text-zinc-500">
          Sin limnímetro: es un índice derivado de la lluvia, no una medición de caudal. El nivel real
          lo confirma el guía en sitio.
        </p>
      </MethodNote>
    </section>
  );
}
