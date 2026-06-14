import { Clock3 } from "lucide-react";
import type { MundialMatch } from "../types";
import { cn, finalScoreText, formatKickoff, isMatchClosed, teamCode } from "../utils";
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
          ? "border-[#62ffe6]/70 bg-[#071d2a] shadow-[0_0_22px_rgba(98,255,230,0.18)]"
          : closed
            ? "border-[#ffb15f]/45 bg-[#2a120b]/70"
            : "border-white/15 bg-black/35"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-md border border-white/15 bg-black/35 px-2 py-1 text-xs font-black tabular-nums text-white">
          #{match.number}
        </span>
        <span
          className={cn(
            "rounded-md border px-2 py-1 text-xs font-black",
            active
              ? "border-[#62ffe6]/60 bg-[#071d2a] text-[#62ffe6]"
              : closed
                ? "border-[#ffb15f]/50 bg-[#2a120b] text-[#ffb15f]"
                : "border-[#d5ff3f]/45 bg-[#1a2206] text-[#d5ff3f]"
          )}
        >
          {label}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <MiniTeam team={match.homeTeam} />
        <span className="text-xs font-black text-white/55">VS</span>
        <MiniTeam team={match.awayTeam} />
      </div>

      <h3 className="mt-3 break-words text-base font-black uppercase leading-tight text-white">
        {match.homeTeam} vs {match.awayTeam}
      </h3>
      <p className="mt-2 flex items-start gap-1.5 text-sm font-bold leading-snug text-white/60">
        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#62ffe6]" />
        <span>{formatKickoff(match.kickoffAt)}</span>
      </p>
      <p className={cn("mt-3 text-sm font-black", closed ? "text-[#d5ff3f]" : "text-white/60")}>
        {closed ? finalScoreText(match) : match.group ? `Grupo ${match.group}` : match.stageLabel}
      </p>
    </article>
  );
}

function MiniTeam({ team }: { team: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-[#3151ff] px-2 py-1">
      <Flag team={team} size="xs" />
      <span className="text-sm font-black text-white">{teamCode(team)}</span>
    </span>
  );
}
