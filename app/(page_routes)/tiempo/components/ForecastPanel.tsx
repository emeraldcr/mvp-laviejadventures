import { Activity, TrendingUp, BarChart2, Layers, Scale } from "lucide-react";

type ForecastMethod = { value: number; label: string };

type ForecastMethods = {
  ema:               ForecastMethod;
  doubleEMA:         ForecastMethod;
  linearRegression:  ForecastMethod;
  movingAverage3h:   ForecastMethod;
  movingAverage6h:   ForecastMethod;
  weightedAverage6h: ForecastMethod;
};

interface ForecastPanelProps {
  methods:     ForecastMethods;
  consensusMm: number;
  confidence:  "alta" | "media" | "baja";
}

const METHOD_META: Record<keyof ForecastMethods, { icon: React.ReactNode; color: string }> = {
  ema:               { icon: <Activity   className="w-4 h-4 text-blue-400"   />, color: "text-blue-300"   },
  doubleEMA:         { icon: <Layers     className="w-4 h-4 text-amber-400"  />, color: "text-amber-300"  },
  linearRegression:  { icon: <TrendingUp className="w-4 h-4 text-purple-400" />, color: "text-purple-300" },
  movingAverage3h:   { icon: <BarChart2  className="w-4 h-4 text-cyan-400"   />, color: "text-cyan-300"   },
  movingAverage6h:   { icon: <BarChart2  className="w-4 h-4 text-teal-400"   />, color: "text-teal-300"   },
  weightedAverage6h: { icon: <Scale      className="w-4 h-4 text-pink-400"   />, color: "text-pink-300"   },
};

const CONFIDENCE_COLOR = { alta: "text-green-400", media: "text-yellow-400", baja: "text-red-400" } as const;

export default function ForecastPanel({ methods, consensusMm, confidence }: ForecastPanelProps) {
  const entries = Object.entries(methods) as [keyof ForecastMethods, ForecastMethod][];

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-semibold text-slate-200">
            Pronóstico próxima hora
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            6 métodos comparados — lluvia estimada en los próximos 60 min
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/60 rounded-2xl px-5 py-3 border border-slate-700/70 shrink-0">
          <div>
            <p className="text-xs text-slate-400 text-center">Consenso</p>
            <p className="text-3xl font-bold text-white text-center">{consensusMm.toFixed(1)}<span className="text-lg font-normal ml-1">mm</span></p>
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
  );
}
