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
  const label = closed ? "Cerrado" : active ? "⚡ LIVE" : "Siguiente";

  const homeFlag = getCountryFlag(match.homeTeam);
  const awayFlag = getCountryFlag(match.awayTeam);

  return (
    <article
      className={cn(
        "w-[76vw] max-w-[230px] shrink-0 snap-start rounded-xl border p-3.5 transition-all duration-200 sm:w-[210px]",
        active
          ? "border-green-500 bg-[#0c1c0c]"
          : closed
            ? "border-[#1a2a1a] bg-[#080d08]"
            : "border-[#1a2a1a] bg-[#0c150c]"
      )}
      style={active ? { boxShadow: "0 0 18px rgba(34,197,94,0.18), inset 0 0 30px rgba(34,197,94,0.04)" } : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-md border border-[#1e3a1e] bg-[#050905] px-1.5 py-0.5 text-[11px] font-black tabular-nums text-[#5a8a5a]">
          #{match.number}
        </span>
        <span
          className={cn(
            "text-[11px] font-black tracking-wider",
            active ? "text-green-400" : closed ? "text-[#2a4020]" : "text-[#3a5a3a]"
          )}
        >
          {label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-2xl leading-none" aria-hidden="true">{homeFlag}</span>
        <span className="text-[10px] font-black text-[#2a4020]">VS</span>
        <span className="text-2xl leading-none" aria-hidden="true">{awayFlag}</span>
      </div>

      <h3 className={cn(
        "mt-2 break-words text-sm font-black leading-tight",
        active ? "text-white" : "text-[#c0d8c0]"
      )}>
        {match.homeTeam} vs {match.awayTeam}
      </h3>
      <p className="mt-1.5 text-[11px] font-bold text-[#3a5a3a]">{formatKickoff(match.kickoffAt)}</p>
      <p className={cn(
        "mt-2 text-[11px] font-black",
        closed ? "text-[#6aab6a]" : "text-[#3a5a3a]"
      )}>
        {closed ? finalScoreText(match) : match.group ? `Grupo ${match.group}` : match.stageLabel}
      </p>
    </article>
  );
}
