import { SatelliteDish } from "lucide-react";
import type { StationHealth } from "@/lib/types/tiempo-api";

const TONE: Record<StationHealth["quality"], string> = {
  alta: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  media: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  baja: "text-red-300 border-red-500/30 bg-red-500/10",
};

const QUALITY_LABEL: Record<StationHealth["quality"], string> = {
  alta: "Datos al día",
  media: "Datos con rezago",
  baja: "Datos poco confiables",
};

function ageLabel(min: number | null): string {
  if (min == null) return "sin hora válida";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `hace ${h} h ${m} min` : `hace ${h} h`;
}

export function StationHealthBadge({
  health,
  compact = false,
}: {
  health: StationHealth | null;
  compact?: boolean;
}) {
  if (!health) return null;

  if (compact) {
    return (
      <span
        className={`hidden md:inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${TONE[health.quality]}`}
        title={health.qualityReason}
      >
        <SatelliteDish size={11} />
        Estación · {ageLabel(health.minutesSinceReading)}
      </span>
    );
  }

  return (
    <div className={`rounded-xl border px-3 py-2.5 ${TONE[health.quality]}`}>
      <div className="flex items-center gap-2">
        <SatelliteDish size={13} />
        <span className="text-xs font-bold uppercase tracking-wide">
          {QUALITY_LABEL[health.quality]}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-4 opacity-90">
        Última lectura {ageLabel(health.minutesSinceReading)} ·{" "}
        {health.hourlyRows24h}/{health.expectedRows24h} registros horarios en 24 h
      </p>
      {health.quality !== "alta" && (
        <p className="mt-0.5 text-[11px] leading-4 opacity-75">{health.qualityReason}</p>
      )}
    </div>
  );
}
