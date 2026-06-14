import { Clock3 } from "lucide-react";
import type { MundialMatch } from "../types";
import { cn, finalScoreText, formatKickoff, isMatchClosed } from "../utils";
import { Flag } from "./Flag";

type SlideCardProps = {
  match: MundialMatch;
  nowMs: number;
  activeMatchId: string | null;
};

export function SlideCard({ match, nowMs, activeMatchId }: SlideCardProps) {
  const closed = isMatchClosed(match, nowMs);
  const active = match.id === activeMatchId && !closed;
  const label = closed ? "Cerrado" : active ? "Activo" : "Siguiente";

  return (
    <article
      className={cn(
        "w-[78vw] max-w-[270px] shrink-0 snap-start rounded-lg border p-4 transition-all duration-200 sm:w-[250px]",
        active
          ? "border-emerald-500/70 bg-emerald-950/20 shadow-[0_0_18px_rgba(16,185,129,0.14)]"
          : closed
            ? "border-[#253425] bg-[#0d120d]"
            : "border-[#263b27] bg-[#101711]"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-md border border-[#2b3d2b] bg-[#070907] px-2 py-1 text-xs font-black tabular-nums text-[#a9c7ad]">
          #{match.number}
        </span>
        <span
          className={cn(
            "rounded-md border px-2 py-1 text-xs font-black",
            active
              ? "border-emerald-600/60 bg-emerald-950/35 text-emerald-200"
              : closed
                ? "border-red-800/50 bg-red-950/25 text-red-200"
                : "border-cyan-800/50 bg-cyan-950/20 text-cyan-200"
          )}
        >
          {label}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Flag team={match.homeTeam} size="lg" />
        <span className="text-xs font-black text-[#8ca58f]">VS</span>
        <Flag team={match.awayTeam} size="lg" />
      </div>

      <h3 className="mt-3 break-words text-base font-black leading-tight text-white">
        {match.homeTeam} vs {match.awayTeam}
      </h3>
      <p className="mt-2 flex items-start gap-1.5 text-sm font-bold leading-snug text-[#9db59f]">
        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#8ca58f]" />
        <span>{formatKickoff(match.kickoffAt)}</span>
      </p>
      <p className={cn("mt-3 text-sm font-black", closed ? "text-[#b7d5ba]" : "text-[#8ca58f]")}>
        {closed ? finalScoreText(match) : match.group ? `Grupo ${match.group}` : match.stageLabel}
      </p>
    </article>
  );
}
