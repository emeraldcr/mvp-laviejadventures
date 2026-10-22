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
import { localizeHref, tourDifficulty, type Locale } from "@/lib/i18n";

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

export function RiverTourImpactSection({ impacts, locale = "es" }: { impacts: RiverTourImpact[]; locale?: Locale }) {
  if (!impacts.length) return null;
  const isEnglish = locale === "en";
  const copy = isEnglish
    ? {
        title: "What this means for river tours",
        intro: "The same rain affects every route differently. A canyon with river crossings closes much sooner than a walk beside the river.",
        rain24: "Rain 24 h",
        rain3: "Rain 3 h",
        rise: "Rise",
        trend: "Trend",
        tomorrow: "Early rain probability tomorrow",
        note: "This helps with preparation; it does not confirm a departure. The guide checks the real river level and trail conditions on site.",
        ask: "Ask the team",
      }
    : {
        title: "Qué significa para sus tours de río",
        intro: "La misma lluvia pesa distinto en cada recorrido. Un cañón con cruces de río se cierra mucho antes que una caminata por la orilla.",
        rain24: "Lluvia 24 h",
        rain3: "Lluvia 3 h",
        rise: "Crecida",
        trend: "Tendencia",
        tomorrow: "Prob. de lluvia mañana temprano",
        note: "Esto orienta la preparación, no confirma una salida. El guía valora el nivel real del río y el terreno en sitio.",
        ask: "Consulte al equipo",
      };

  const tourNames: Record<string, string> = {
    "tour-ciudad-esmeralda": "Ciudad Esmeralda Canyon",
    "rapel-canon-del-rio": "La Vieja River rappel canyon",
    "cascadas-secretas-rio-la-vieja": "Secret waterfalls",
  };
  const verdictLabels: Record<RiverTourVerdict, string> = {
    favorable: "Favorable",
    vigilar: "Watch closely",
    poco: "Not favorable",
    "rio-manda": "River decides",
  };
  const trendLabels: Record<string, string> = { subiendo: "rising", bajando: "falling", estable: "steady" };
  const floodLabels: Record<string, string> = { "va a subir": "likely to rise", estable: "steady", bajando: "falling" };

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 md:p-5 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Waves size={14} className="text-teal-400" />
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
            {copy.title}
          </span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">{copy.intro}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {impacts.map((t) => {
          const v = VERDICT[t.verdict];
          const Icon = v.icon;
          return (
            <div key={t.slug} className={`rounded-2xl border p-4 flex flex-col ${v.tone}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-white leading-tight">{isEnglish ? tourNames[t.slug] ?? t.name : t.name}</h3>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-zinc-500 font-bold">
                    {tourDifficulty(t.difficulty, locale)}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${v.badge}`}
                >
                  <Icon size={11} />
                  {isEnglish ? verdictLabels[t.verdict] : t.verdictLabel}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-zinc-300">
                {isEnglish
                  ? t.verdict === "favorable"
                    ? `Low recent rainfall (${t.factors.lluvia24h} mm in 24 h) and a ${trendLabels[t.factors.tendencia] ?? t.factors.tendencia} trend. Good baseline conditions; the guide confirms on site.`
                    : t.verdict === "poco"
                      ? "Current conditions are not favorable for this route. The guide may modify or reschedule the departure for safety."
                      : t.verdict === "vigilar"
                        ? `Recent rainfall requires close attention (${t.factors.lluvia24h} mm in 24 h). Confirm the river with the team on the morning of the tour.`
                        : "Fresh operating data is limited. The guide makes the final decision on site."
                  : t.reason}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <Factor label={copy.rain24}>{t.factors.lluvia24h} mm</Factor>
                <Factor label={copy.rain3}>{t.factors.lluvia3h} mm</Factor>
                <Factor label={copy.rise}>
                  <span className="text-[11px] font-semibold">{isEnglish ? floodLabels[t.factors.crecida] ?? t.factors.crecida : t.factors.crecida}</span>
                </Factor>
                <Factor label={copy.trend}>
                  <TrendMark trend={t.factors.tendencia} /> {isEnglish ? trendLabels[t.factors.tendencia] ?? t.factors.tendencia : t.factors.tendencia}
                </Factor>
              </div>

              {t.factors.probAM != null && (
                <p className="mt-2 text-[10px] text-zinc-500">
                  {copy.tomorrow}: {t.factors.probAM}%
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="border-t border-white/8 pt-3 text-[11px] leading-5 text-zinc-500">
        {copy.note}{" "}
        <Link href={localizeHref("/reservar", locale)} className="text-[#66ddcf] font-semibold hover:underline">
          {copy.ask}
        </Link>{" "}
        si su tour depende del río.
      </p>
    </div>
  );
}
