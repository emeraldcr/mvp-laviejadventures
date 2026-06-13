import type { MundialMatch } from "../types";
import { cn, finalScoreText, formatKickoff, getCountryFlag, isMatchClosed } from "../utils";

type SlideCardProps = {
  match: MundialMatch;
  nowMs: number;
  activeMatchId: string | null;
};

export function SlideCard({ match, nowMs, activeMatchId }: SlideCardProps) {
  const closed = isMatchClosed(match, nowMs);
  const active = match.id === activeMatchId && !closed;
  const label = closed ? "Cerrado" : active ? "⚡ Ahora" : "Siguiente";

  const homeFlag = getCountryFlag(match.homeTeam);
  const awayFlag = getCountryFlag(match.awayTeam);

  return (
    <article
      className={cn(
        "w-[240px] shrink-0 snap-start rounded-xl border p-3.5 shadow-sm transition",
        active
          ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white ring-1 ring-emerald-100"
          : closed
            ? "border-slate-200 bg-slate-50"
            : "border-slate-200 bg-white"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-lg px-2 py-1 text-xs font-black tabular-nums",
            active ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"
          )}
        >
          #{match.number}
        </span>
        <span
          className={cn(
            "text-xs font-black",
            active ? "text-emerald-700" : closed ? "text-slate-400" : "text-slate-500"
          )}
        >
          {label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-2xl leading-none" aria-hidden="true">{homeFlag}</span>
        <span className="text-xs font-black text-slate-400">vs</span>
        <span className="text-2xl leading-none" aria-hidden="true">{awayFlag}</span>
      </div>

      <h3 className="mt-2 text-sm font-black leading-tight text-slate-900">
        {match.homeTeam} vs {match.awayTeam}
      </h3>
      <p className="mt-1.5 text-xs font-bold text-slate-400">{formatKickoff(match.kickoffAt)}</p>
      <p className="mt-2 text-xs font-black text-slate-600">
        {closed ? finalScoreText(match) : match.group ? `Grupo ${match.group}` : match.stageLabel}
      </p>
    </article>
  );
}
