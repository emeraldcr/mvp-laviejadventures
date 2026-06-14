import { Trophy } from "lucide-react";
import type { MundialMatch } from "../types";
import { cn, teamCode } from "../utils";
import { Flag } from "./Flag";

type BroadcastScorebugProps = {
  match: MundialMatch;
  homeScore?: number;
  awayScore?: number;
  timeLabel?: string;
  detailLabel?: string;
  compact?: boolean;
  className?: string;
};

export function BroadcastScorebug({
  match,
  homeScore = 0,
  awayScore = 0,
  timeLabel = "00:00",
  detailLabel,
  compact = false,
  className,
}: BroadcastScorebugProps) {
  return (
    <div className={cn("w-full min-w-0", className)}>
      <div
        className={cn(
          "mx-auto flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-lg bg-black/65 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] ring-1 ring-white/15",
          compact ? "text-sm" : "text-base sm:text-lg"
        )}
      >
        <span className="rounded-md bg-white px-3 py-2 font-black tabular-nums text-black shadow-[inset_0_-3px_0_rgba(0,0,0,0.12)]">
          {timeLabel}
        </span>

        <TeamPlate team={match.homeTeam} align="left" compact={compact} />
        <ScorePlate value={homeScore} compact={compact} />

        <span className="grid min-h-11 min-w-12 place-items-center rounded-md border border-white/30 bg-white px-2 text-black shadow-[0_0_0_2px_rgba(153,255,30,0.28)]">
          <Trophy className={cn("text-[#1d256b]", compact ? "h-4 w-4" : "h-5 w-5")} />
          <span className="mt-0.5 text-[9px] font-black leading-none tracking-tight">WC26</span>
        </span>

        <ScorePlate value={awayScore} compact={compact} />
        <TeamPlate team={match.awayTeam} align="right" compact={compact} />
      </div>

      {detailLabel && (
        <p className="mx-auto mt-2 max-w-full truncate text-center text-xs font-black uppercase tracking-[0.22em] text-[#d5ff3f]">
          {detailLabel}
        </p>
      )}
    </div>
  );
}

function TeamPlate({ team, align, compact }: { team: string; align: "left" | "right"; compact: boolean }) {
  return (
    <span
      className={cn(
        "flex min-h-11 min-w-0 items-center gap-2 rounded-md bg-[#07070d] px-2.5 py-2 text-white ring-1 ring-white/10",
        compact ? "max-w-24" : "max-w-32 sm:max-w-40",
        align === "right" && "flex-row-reverse"
      )}
    >
      <Flag team={team} size={compact ? "xs" : "sm"} className="shrink-0 rounded-sm" />
      <span className={cn("truncate font-black tracking-wide", compact ? "text-base" : "text-lg sm:text-xl")}>
        {teamCode(team)}
      </span>
    </span>
  );
}

function ScorePlate({ value, compact }: { value: number; compact: boolean }) {
  return (
    <span
      className={cn(
        "grid min-h-11 place-items-center rounded-md bg-[#62ffe6] px-3 font-black tabular-nums text-[#06121c] shadow-[inset_0_-4px_0_rgba(0,0,0,0.14)]",
        compact ? "min-w-10 text-2xl" : "min-w-12 text-3xl sm:text-4xl"
      )}
    >
      {value}
    </span>
  );
}
