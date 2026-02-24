"use client";

import { Activity, TrendingUp, BarChart2, Layers, Scale, Combine, AlertTriangle } from "lucide-react";

type ForecastMethod = { value: number; label: string };

type ForecastMethods = {
  ema:               ForecastMethod;
  doubleEMA:         ForecastMethod;
  linearRegression:  ForecastMethod;
  movingAverage3h:   ForecastMethod;
  movingAverage6h:   ForecastMethod;
  weightedAverage6h: ForecastMethod;
};

type ExtendedHour = {
  horizon:           number;
  label:             string;
  imnForecast_mm:    number;
  modelForecast_mm:  number | null;
  blended_mm:        number;
  imnWeight:         number;
  modelWeight:       number | null;
  hasModel:          boolean;
};

interface ForecastPanelProps {
  methods:        ForecastMethods;
  consensusMm:    number;
  confidence:     "alta" | "media" | "baja";
  extended?:      ExtendedHour[];
  modelSource?:   string;
  modelAvailable?: boolean;
}

const METHOD_META: Record<keyof ForecastMethods, { icon: React.ReactNode; color: string }> = {
  ema:               { icon: <Activity   className="w-4 h-4 text-blue-400"   />, color: "text-blue-300"   },
  doubleEMA:         { icon: <Layers     className="w-4 h-4 text-amber-400"  />, color: "text-amber-300"  },
  linearRegression:  { icon: <TrendingUp className="w-4 h-4 text-purple-400" />, color: "text-purple-300" },
  movingAverage3h:   { icon: <BarChart2  className="w-4 h-4 text-cyan-400"   />, color: "text-cyan-300"   },
  movingAverage6h:   { icon: <BarChart2  className="w-4 h-4 text-teal-400"   />, color: "text-teal-300"   },
  weightedAverage6h: { icon: <Scale      className="w-4 h-4 text-pink-400"   />, color: "text-pink-300"   },
};

const CONFIDENCE_COLOR = {
  alta:  "text-green-400",
  media: "text-yellow-400",
  baja:  "text-red-400",
} as const;

/** Returns Tailwind color classes based on mm intensity */
function intensityStyle(mm: number): { ring: string; text: string; bg: string } {
  if (mm >= 12) return { ring: "border-red-500/60",    text: "text-red-300",    bg: "bg-red-500/10"    };
  if (mm >= 4)  return { ring: "border-amber-500/60",  text: "text-amber-300",  bg: "bg-amber-500/10"  };
  if (mm >= 1)  return { ring: "border-blue-500/60",   text: "text-blue-300",   bg: "bg-blue-500/10"   };
  if (mm >= 0.2)return { ring: "border-sky-500/40",    text: "text-sky-300",    bg: "bg-sky-500/5"     };
  return               { ring: "border-slate-600/40",  text: "text-slate-400",  bg: "bg-slate-800/20"  };
}

/** Narrow bar proportional to mm (max bar = 15 mm = 100% height) */
function RainBar({ mm }: { mm: number }) {
  const pct = Math.min(100, (mm / 15) * 100);
  if (pct < 2) return <div className="w-full h-1 bg-slate-700/40 rounded-full" />;
  const color =
    mm >= 12 ? "bg-red-500" :
    mm >= 4  ? "bg-amber-400" :
    mm >= 1  ? "bg-blue-400" :
               "bg-sky-300";
  return (
    <div className="w-full h-1.5 bg-slate-700/40 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function BlendedHourCard({ h, index }: { h: ExtendedHour; index: number }) {
  const style = intensityStyle(h.blended_mm);
  const imnPct  = Math.round(h.imnWeight  * 100);
  const ometPct = h.modelWeight !== null ? Math.round(h.modelWeight * 100) : 0;

  return (
    <div
      className={`relative flex flex-col gap-2 rounded-2xl border p-4 transition-all
        ${style.ring} ${style.bg} hover:border-opacity-80`}
    >
      {/* Horizon label */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          {h.label}
        </span>
        {/* Blend donut indicator */}
        {h.hasModel && (
          <span className="text-[9px] text-slate-500 font-medium">
            {imnPct}% obs · {ometPct}% modelo
          </span>
        )}
      </div>

      {/* Main value */}
      <div className="text-center">
        <span className={`text-3xl font-extrabold tabular-nums ${style.text}`}>
          {h.blended_mm.toFixed(1)}
        </span>
        <span className="text-sm text-slate-400 ml-1">mm</span>
      </div>

      {/* Progress bar */}
      <RainBar mm={h.blended_mm} />

      {/* IMN vs model breakdown */}
      {h.hasModel ? (
        <div className="grid grid-cols-2 gap-1 mt-1 text-center text-[10px]">
          <div className="bg-slate-900/50 rounded-lg py-1 px-1.5 border border-slate-700/40">
            <p className="text-slate-500 leading-none">Obs. IMN</p>
            <p className="text-slate-300 font-semibold mt-0.5">{h.imnForecast_mm.toFixed(1)} mm</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg py-1 px-1.5 border border-slate-700/40">
            <p className="text-slate-500 leading-none">Modelo</p>
            <p className="text-teal-300 font-semibold mt-0.5">{h.modelForecast_mm!.toFixed(1)} mm</p>
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-slate-500 text-center mt-1">Solo estadístico (sin modelo)</p>
      )}

      {/* Horizon step indicator dots */}
      <div className="flex justify-center gap-1 mt-0.5">
        {[0, 1, 2, 3].map((dot) => (
          <span
            key={dot}
            className={`inline-block rounded-full transition-all ${
              dot <= index
                ? `w-2 h-2 ${style.text.replace("text-", "bg-")}`
                : "w-1.5 h-1.5 bg-slate-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function ForecastPanel({
  methods,
  consensusMm,
  confidence,
  extended,
  modelSource,
  modelAvailable,
}: ForecastPanelProps) {
  const entries = Object.entries(methods) as [keyof ForecastMethods, ForecastMethod][];

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl space-y-8">

      {/* ── Section 1: h+1 – 6 statistical methods ───────────────────────── */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold text-slate-200">
              Pronóstico próxima hora
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              6 métodos estadísticos comparados — lluvia estimada en los próximos 60 min
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/60 rounded-2xl px-5 py-3 border border-slate-700/70 shrink-0">
            <div>
              <p className="text-xs text-slate-400 text-center">Consenso</p>
              <p className="text-3xl font-bold text-white text-center">
                {consensusMm.toFixed(1)}
                <span className="text-lg font-normal ml-1">mm</span>
              </p>
            </div>
            <div className={`text-sm font-semibold ${CONFIDENCE_COLOR[confidence]} border-l border-slate-600 pl-3`}>
              Confianza<br />{confidence}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {entries.map(([key, method]) => {
            const meta = METHOD_META[key];
            return (
              <div
                key={key}
                className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/70 hover:border-slate-600 transition-all text-center"
              >
                <div className="flex justify-center mb-2">{meta.icon}</div>
                <p className="text-[11px] text-slate-400 leading-tight mb-2 min-h-[2.5rem] flex items-center justify-center">
                  {method.label}
                </p>
                <p className={`text-2xl font-bold ${meta.color}`}>
                  {method.value.toFixed(1)}
                  <span className="text-sm font-normal ml-1">mm</span>
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 mt-5 italic">
          Estimaciones basadas en los últimos 12 registros horarios. Solo orientativo — no sustituye el pronóstico oficial del IMN.
        </p>
      </div>

      {/* ── Section 2: h+1 → h+4 blended forecast ────────────────────────── */}
      {extended && extended.length > 0 && (
        <div>
          <div className="border-t border-slate-700/60 pt-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <Combine className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-xl font-semibold text-slate-200">
                    Horizonte 4 horas — pronóstico combinado
                  </h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Combina observaciones IMN y modelo numérico{modelSource ? ` (${modelSource})` : ""}
                  </p>
                </div>
              </div>
              {!modelAvailable && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Modelo no disponible — solo estadístico
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {extended.map((h, i) => (
                <BlendedHourCard key={h.horizon} h={h} index={i} />
              ))}
            </div>

            {/* Blend weight legend */}
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-0.5 rounded bg-blue-400" />
                Obs. IMN: 70 % → 10 % (se reduce con el horizonte)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-0.5 rounded bg-teal-400" />
                Modelo NWP: 30 % → 90 % (aumenta con el horizonte)
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-3 italic">
              A mayor horizonte temporal, el modelo numérico es más confiable que la extrapolación estadística de observaciones pasadas.
              Los valores son estimaciones — el margen de error crece con la distancia al tiempo presente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
