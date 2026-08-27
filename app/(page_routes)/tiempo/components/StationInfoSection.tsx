import { SatelliteDish, Check, X } from "lucide-react";
import { ABBREVIATIONS } from "@/lib/types/tiempo-api";
import type { StationHealth } from "@/lib/types/tiempo-api";
import { StationHealthBadge } from "./StationHealthBadge";

const MEASURES = [
  "Lluvia caída cada hora (mm), un registro por hora.",
  "Acumulado del día en curso desde las 7:00 a.m. (SUM_lluv).",
  "Total del día anterior, de 7:00 a.m. a 7:00 a.m. (LLUV_ayer).",
  "Registro diario histórico para comparar contra lo normal.",
];

const NOT_MEASURED = [
  "Nivel o caudal del río: no hay limnímetro. El estado del río lo derivamos de la lluvia acumulada.",
  "Temperatura, humedad y viento: en esta página vienen del modelo Open-Meteo para Ciudad Quesada, no de la estación.",
  "Lluvia río abajo o en otros afluentes: la estación cubre solo su punto en la cuenca alta.",
];

const GLOSSARY: Array<{ term: string; desc: string; unit: string }> = [
  { term: "Lluvia", ...ABBREVIATIONS.Lluvia, desc: ABBREVIATIONS.Lluvia.desc },
  { term: "SUM_lluv", ...ABBREVIATIONS.SUM_lluv, desc: ABBREVIATIONS.SUM_lluv.desc },
  { term: "LLUV_ayer", ...ABBREVIATIONS.LLUV_ayer, desc: ABBREVIATIONS.LLUV_ayer.desc },
];

export function StationInfoSection({
  health,
  stationName,
}: {
  health: StationHealth | null;
  stationName?: string;
}) {
  return (
    <div id="estacion" className="scroll-mt-40 rounded-2xl border border-white/8 bg-white/[0.02] p-4 md:p-5 space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SatelliteDish size={14} className="text-teal-400" />
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
            La estación {stationName ?? "Montaña Sagrada (IMN)"}
          </span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Un pluviómetro del IMN en la Reserva Montaña Sagrada, en la cuenca alta que alimenta el
          Río La Vieja. Es el único sensor físico de esta página. Todas las horas están en hora de
          Costa Rica (UTC−6).
        </p>
      </div>

      <StationHealthBadge health={health} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-black/25 border border-white/8 p-3">
          <p className="text-[10px] uppercase tracking-widest text-emerald-300/80 font-bold mb-2">
            Qué mide
          </p>
          <ul className="space-y-1.5">
            {MEASURES.map((m) => (
              <li key={m} className="flex gap-2 text-xs leading-5 text-zinc-300">
                <Check size={13} className="mt-0.5 shrink-0 text-emerald-400" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-black/25 border border-white/8 p-3">
          <p className="text-[10px] uppercase tracking-widest text-red-300/80 font-bold mb-2">
            Qué NO mide aquí
          </p>
          <ul className="space-y-1.5">
            {NOT_MEASURED.map((m) => (
              <li key={m} className="flex gap-2 text-xs leading-5 text-zinc-300">
                <X size={13} className="mt-0.5 shrink-0 text-red-400" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl bg-black/25 border border-white/8 p-3">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">
          Cómo leer los números del IMN
        </p>
        <div className="divide-y divide-white/6">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="flex items-baseline gap-3 py-1.5 text-xs">
              <span className="w-20 shrink-0 font-mono font-bold text-teal-300">{g.term}</span>
              <span className="text-zinc-300 leading-5">
                {g.desc} <span className="text-zinc-500">({g.unit})</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-black/25 p-3">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5">
          Cómo convertimos el mm en un &ldquo;estado del río&rdquo;
        </p>
        <p className="text-xs leading-5 text-zinc-400">
          Sumamos la lluvia de las últimas 3, 6 y 24 horas. La estimación pasa a{" "}
          <strong className="text-amber-300">caudal puede subir</strong> alrededor de 10 mm/3 h,
          18 mm/6 h o 40 mm/24 h, y a{" "}
          <strong className="text-red-300">riesgo alto de crecida</strong> alrededor de 20 mm/3 h,
          35 mm/6 h o 70 mm/24 h. Es una regla de referencia: sin medir el río, el terreno, la
          saturación previa del suelo y la lluvia río arriba pueden cambiar el resultado real.
        </p>
      </div>

      <p className="text-[11px] leading-5 text-zinc-600">{ABBREVIATIONS.nota}</p>
    </div>
  );
}
