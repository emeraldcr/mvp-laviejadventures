"use client";

import {
  CloudRain, TrendingUp, TrendingDown, Minus, Droplets, Thermometer,
  Wind, CloudSun, Gauge, Waves,
} from "lucide-react";
import type { TiempoModel } from "@/lib/types/tiempo-model";
import type { RainData } from "@/lib/types/index";
import { ConfidencePill } from "./ConfidencePill";
import { MethodNote } from "./MethodNote";

type ZoneNow = {
  temp_c: number;
  hr_pct: number;
  wind_kmh: number;
  weather_label: string;
  precip_prob_next3h: number | null;
} | null;

function trendMark(t: string, size = 14) {
  if (t === "subiendo") return <TrendingUp size={size} className="text-red-400" />;
  if (t === "bajando") return <TrendingDown size={size} className="text-emerald-400" />;
  return <Minus size={size} className="text-zinc-400" />;
}

function Stat({
  label, value, sub, accent = "text-white",
}: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-xl bg-black/25 border border-white/8 px-3 py-2.5">
      <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">{label}</p>
      <p className={`mt-0.5 text-base font-black tabular-nums ${accent}`}>{value}</p>
      {sub ? <p className="text-[10px] text-zinc-600 leading-3">{sub}</p> : null}
    </div>
  );
}

export function NowModule({
  model, rain, zoneNow, lastUpdateISO,
}: {
  model: TiempoModel;
  rain: RainData;
  zoneNow: ZoneNow;
  lastUpdateISO?: string;
}) {
  const a = model.antecedent;
  const st = rain.stats;
  const intensity = rain.status?.intensity ?? "sin lluvia";
  const trend = rain.status?.trend ?? "estable";
  const updated = lastUpdateISO
    ? new Date(lastUpdateISO).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <section id="ahora" className="scroll-mt-40 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#66ddcf] font-bold mb-1.5">
            1 · Estado actual
          </p>
          <div className="flex items-center gap-2">
            <CloudRain size={22} className="text-sky-300" />
            <h2 className="text-2xl font-black text-white capitalize">Lluvia {intensity}</h2>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
            {trendMark(trend)} Tendencia {trend} · última lectura {updated}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-4xl font-black tabular-nums text-sky-300">{a.windows.h1.toFixed(1)}</div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">mm · última hora</div>
        </div>
      </div>

      <ConfidencePill score={model.confidence.now} label="estado actual" />

      {/* Lluvia medida — la verdad primaria */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
          <CloudRain size={12} /> Estación IMN · lluvia medida (ventanas móviles)
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Stat label="1 h" value={a.windows.h1.toFixed(1)} sub="mm" />
          <Stat label="3 h" value={a.windows.h3.toFixed(1)} sub="mm" />
          <Stat label="6 h" value={a.windows.h6.toFixed(1)} sub="mm" />
          <Stat label="12 h" value={a.windows.h12.toFixed(1)} sub="mm" />
          <Stat label="24 h" value={a.windows.h24.toFixed(1)} sub="mm" />
          <Stat label="48 h" value={a.windows.h48.toFixed(1)} sub="mm" />
        </div>
      </div>

      {/* Estado derivado de la cuenca */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl bg-black/25 border border-white/8 px-3 py-2.5">
          <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1">
            <Gauge size={10} /> Humedad de cuenca
          </p>
          <p className="mt-1 text-base font-black tabular-nums text-teal-300">{a.apiIndex}<span className="text-xs text-zinc-500">/100</span></p>
          <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-teal-400" style={{ width: `${a.apiIndex}%` }} />
          </div>
          <p className="text-[10px] text-zinc-600 mt-0.5">API {a.apiMm.toFixed(1)} mm</p>
        </div>
        <Stat label="Coef. escorrentía" value={a.runoffCoef.toFixed(2)} sub="fracción al río" accent="text-teal-300" />
        <Stat
          label="Racha lluvia"
          value={`${st?.wetStreak ?? 0} h`}
          sub={`${st?.wetHoursLast24 ?? 0} h mojadas / 24 h`}
          accent={(st?.wetStreak ?? 0) >= 4 ? "text-red-300" : "text-white"}
        />
        <Stat label="Racha seca" value={`${st?.dryStreak ?? 0} h`} sub="sin lluvia" />
      </div>

      {/* Índice de río ahora — enlace al módulo 3 */}
      <a href="#rio" className="flex items-center justify-between rounded-xl border border-white/8 bg-black/25 px-4 py-3 transition hover:border-teal-500/30">
        <div className="flex items-center gap-2">
          <Waves size={15} className="text-teal-400" />
          <span className="text-sm font-bold text-zinc-200">Índice de caudal en el tramo del tour</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tabular-nums text-teal-300">{model.river.indexNow.toFixed(0)}</span>
          <span className="text-[10px] text-zinc-500">/100 · {model.river.stateLabel}</span>
        </div>
      </a>

      {/* Base secundaria */}
      {zoneNow && (
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
            Base secundaria · Open-Meteo San Carlos (no medido en la estación)
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 opacity-90">
            <div className="rounded-xl bg-black/20 border border-white/6 px-3 py-2.5">
              <Thermometer size={11} className="text-orange-300 mb-1" />
              <p className="text-sm font-bold tabular-nums">{Math.round(zoneNow.temp_c)}°C</p>
              <p className="text-[9px] text-zinc-600">Temperatura</p>
            </div>
            <div className="rounded-xl bg-black/20 border border-white/6 px-3 py-2.5">
              <Droplets size={11} className="text-blue-300 mb-1" />
              <p className="text-sm font-bold tabular-nums">{Math.round(zoneNow.hr_pct)}%</p>
              <p className="text-[9px] text-zinc-600">Humedad</p>
            </div>
            <div className="rounded-xl bg-black/20 border border-white/6 px-3 py-2.5">
              <Wind size={11} className="text-teal-300 mb-1" />
              <p className="text-sm font-bold tabular-nums">{Math.round(zoneNow.wind_kmh)}</p>
              <p className="text-[9px] text-zinc-600">Viento km/h</p>
            </div>
            <div className="rounded-xl bg-black/20 border border-white/6 px-3 py-2.5">
              <CloudSun size={11} className="text-sky-300 mb-1" />
              <p className="text-sm font-bold tabular-nums">
                {zoneNow.precip_prob_next3h != null ? `${zoneNow.precip_prob_next3h}%` : "—"}
              </p>
              <p className="text-[9px] text-zinc-600">Lluvia próx. 3 h</p>
            </div>
          </div>
        </div>
      )}

      <MethodNote>
        <p>
          <strong className="text-zinc-300">Ventanas móviles:</strong> suma de la lluvia horaria del IMN
          hacia atrás desde la última lectura.
        </p>
        <p>
          <strong className="text-zinc-300">Humedad de cuenca (API):</strong> índice de precipitación
          antecedente con decaimiento exponencial —{" "}
          <code className="text-teal-300">APIₕ = Pₕ + k·APIₕ₋₁</code>, con k ={" "}
          {a.decayPerDay.toFixed(2)}/día. Normalizado 0–100 contra {90} mm (cuenca casi saturada).
        </p>
        <p>
          <strong className="text-zinc-300">Coef. de escorrentía:</strong> fracción de la lluvia que se
          convierte en caudal; sube de {0.12} (suelo seco) a {0.8} (saturado) con la humedad de cuenca.
        </p>
        <p className="text-zinc-500">
          Confianza del bloque = observación directa de la estación: penaliza por rezago de la última
          lectura y por registros horarios faltantes.
        </p>
      </MethodNote>
    </section>
  );
}
