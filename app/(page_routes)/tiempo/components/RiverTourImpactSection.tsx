import Link from "next/link";
import {
  Waves,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RiverTourImpact, RiverTourVerdict } from "@/lib/helpers/tiempoHelpers";

const VERDICT: Record<
  RiverTourVerdict,
  { tone: string; badge: string; icon: LucideIcon }
> = {
  favorable: {
    tone: "border-emerald-500/30 bg-emerald-500/[0.07]",
    badge: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
    icon: CheckCircle2,
  },
  vigilar: {
    tone: "border-amber-500/30 bg-amber-500/[0.07]",
    badge: "text-amber-300 bg-amber-500/15 border-amber-500/30",
    icon: AlertTriangle,
  },
  poco: {
    tone: "border-red-500/35 bg-red-500/[0.08]",
    badge: "text-red-300 bg-red-500/15 border-red-500/30",
    icon: XCircle,
  },
  "rio-manda": {
    tone: "border-white/10 bg-white/[0.03]",
    badge: "text-zinc-300 bg-white/5 border-white/15",
    icon: HelpCircle,
  },
};

function TrendMark({ trend }: { trend: string }) {
  if (trend === "subiendo") return <TrendingUp size={12} className="text-red-400" />;
  if (trend === "bajando") return <TrendingDown size={12} className="text-emerald-400" />;
  return <Minus size={12} className="text-zinc-500" />;
}

function Factor({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-black/25 border border-white/6 px-2.5 py-2">
      <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">{label}</p>
      <p className="mt-0.5 text-xs font-bold text-zinc-100 tabular-nums flex items-center gap-1">
        {children}
      </p>
    </div>
  );
}

export function RiverTourImpactSection({ impacts }: { impacts: RiverTourImpact[] }) {
  if (!impacts.length) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 md:p-5 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Waves size={14} className="text-teal-400" />
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
            Qué significa para sus tours de río
          </span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          La misma lluvia pesa distinto en cada recorrido. Un cañón con cruces de río se
          cierra mucho antes que una caminata por la orilla.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {impacts.map((t) => {
          const v = VERDICT[t.verdict];
          const Icon = v.icon;
          return (
            <div key={t.slug} className={`rounded-2xl border p-4 flex flex-col ${v.tone}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-white leading-tight">{t.name}</h3>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-zinc-500 font-bold">
                    {t.difficulty}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${v.badge}`}
                >
                  <Icon size={11} />
                  {t.verdictLabel}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-zinc-300">{t.reason}</p>

              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <Factor label="Lluvia 24 h">{t.factors.lluvia24h} mm</Factor>
                <Factor label="Lluvia 3 h">{t.factors.lluvia3h} mm</Factor>
                <Factor label="Crecida">
                  <span className="text-[11px] font-semibold">{t.factors.crecida}</span>
                </Factor>
                <Factor label="Tendencia">
                  <TrendMark trend={t.factors.tendencia} /> {t.factors.tendencia}
                </Factor>
              </div>

              {t.factors.probAM != null && (
                <p className="mt-2 text-[10px] text-zinc-500">
                  Prob. de lluvia mañana temprano: {t.factors.probAM}%
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="border-t border-white/8 pt-3 text-[11px] leading-5 text-zinc-500">
        Esto orienta la preparación, no confirma una salida. El guía valora el nivel real del
        río y el terreno en sitio.{" "}
        <Link href="/reservar" className="text-[#66ddcf] font-semibold hover:underline">
          Consulte al equipo
        </Link>{" "}
        si su tour depende del río.
      </p>
    </div>
  );
}
