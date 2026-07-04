import { Sunrise, Umbrella } from "lucide-react";
import type { MorningSlot } from "@/lib/helpers/tiempoHelpers";

function slotTone(slot: MorningSlot): string {
  if (!slot.available) return "border-white/8 bg-white/[0.02]";
  const prob = slot.precip_prob ?? 0;
  const mm = slot.precip_mm ?? 0;
  if (prob >= 70 || mm >= 3) return "border-red-500/30 bg-red-500/10";
  if (prob >= 40 || mm >= 1) return "border-amber-500/30 bg-amber-500/10";
  return "border-emerald-500/25 bg-emerald-500/8";
}

function slotVerdict(slot: MorningSlot): string {
  if (!slot.available) return "Sin dato";
  const prob = slot.precip_prob ?? 0;
  const mm = slot.precip_mm ?? 0;
  if (prob >= 70 || mm >= 3) return "Lluvioso";
  if (prob >= 40 || mm >= 1) return "Posible llovizna";
  return "Seco";
}

export function TomorrowMorningSection({
  slots,
  summary,
}: {
  slots: MorningSlot[];
  summary: string;
}) {
  const tomorrowLabel = new Intl.DateTimeFormat("es-CR", {
    timeZone: "America/Costa_Rica",
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(new Date(Date.now() + 24 * 60 * 60 * 1000));

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-1">
        <Sunrise size={14} className="text-amber-300" />
        <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
          Mañana temprano
        </span>
      </div>
      <p className="text-[11px] text-zinc-500 mb-3 capitalize">{tomorrowLabel} · San Carlos</p>
      <p className="text-sm text-zinc-300 mb-4 leading-relaxed">{summary}</p>

      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot) => (
          <div
            key={slot.hour}
            className={`rounded-xl border p-3 text-center ${slotTone(slot)}`}
          >
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">
              {slot.label}
            </p>
            <p className="text-2xl leading-none mb-2">{slot.weather_icon}</p>
            {slot.available ? (
              <>
                <p className="text-sm font-bold text-white">
                  {slot.temp_c != null ? `${Math.round(slot.temp_c)}°C` : "—"}
                </p>
                <p className="text-[10px] text-teal-300 font-semibold mt-1 flex items-center justify-center gap-0.5">
                  <Umbrella size={9} />
                  {slot.precip_prob != null ? `${slot.precip_prob}%` : "—"}
                </p>
                {(slot.precip_mm ?? 0) >= 0.1 && (
                  <p className="text-[10px] text-zinc-400 mt-0.5">{slot.precip_mm?.toFixed(1)} mm</p>
                )}
                <p className="text-[10px] font-bold mt-1.5 text-zinc-300">{slotVerdict(slot)}</p>
              </>
            ) : (
              <p className="text-xs text-zinc-600 mt-4">Sin dato</p>
            )}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-zinc-600 mt-3 text-center">
        Pronóstico Open-Meteo · orientativo, no sustituye la estación IMN
      </p>
    </div>
  );
}