import { Users } from "lucide-react";
import { useMemo } from "react";
import type { MundialMatch, Prediction } from "../types";
import { cn, getCountryFlag, normalizeKey } from "../utils";

type Outcome = "home" | "draw" | "away";

function getOutcome(home: number, away: number): Outcome {
  if (home > away) return "home";
  if (away > home) return "away";
  return "draw";
}

type OtherPicksPanelProps = {
  match: MundialMatch;
  predictions: Prediction[];
  playerName: string;
};

export function OtherPicksPanel({ match, predictions, playerName }: OtherPicksPanelProps) {
  const matchPicks = useMemo(
    () => predictions.filter((p) => p.matchId === match.id),
    [predictions, match.id]
  );

  const { homeWins, draws, awayWins } = useMemo(() => {
    let h = 0, d = 0, a = 0;
    for (const p of matchPicks) {
      const o = getOutcome(p.homeScore, p.awayScore);
      if (o === "home") h++;
      else if (o === "draw") d++;
      else a++;
    }
    return { homeWins: h, draws: d, awayWins: a };
  }, [matchPicks]);

  const total = matchPicks.length;
  if (total === 0) return null;

  const pctHome = Math.round((homeWins / total) * 100);
  const pctDraw = Math.round((draws / total) * 100);
  const pctAway = total - homeWins - draws > 0 ? 100 - pctHome - pctDraw : 0;

  const myKey = normalizeKey(playerName);

  // Sort: my pick first, then by player name
  const sorted = [...matchPicks].sort((a, b) => {
    const aIsMe = normalizeKey(a.playerName) === myKey;
    const bIsMe = normalizeKey(b.playerName) === myKey;
    if (aIsMe && !bIsMe) return -1;
    if (!aIsMe && bIsMe) return 1;
    return a.playerName.localeCompare(b.playerName);
  });

  const homeFlag = getCountryFlag(match.homeTeam);
  const awayFlag = getCountryFlag(match.awayTeam);

  // Most common score for the top outcome
  const scoreCounts = new Map<string, number>();
  for (const p of matchPicks) {
    const key = `${p.homeScore}-${p.awayScore}`;
    scoreCounts.set(key, (scoreCounts.get(key) ?? 0) + 1);
  }
  const popularEntry = [...scoreCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const [popularScore, popularCount] = popularEntry ?? ["?", 0];

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[#1a2e1a] bg-[#080f08]">
      {/* Header */}
      <div className="flex flex-col items-stretch gap-2 border-b border-[#1a2e1a] px-3 py-3 min-[520px]:flex-row min-[520px]:items-center sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Users className="h-4 w-4 shrink-0 text-[#3a5a3a]" />
          <p className="min-w-0 truncate text-[11px] font-black uppercase tracking-widest text-[#4a6e4a]">
            Picks del partido
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 min-[520px]:ml-auto min-[520px]:justify-end">
          {popularCount > 1 && (
            <span className="rounded-md border border-amber-800/40 bg-amber-950/30 px-2 py-0.5 text-[11px] font-black text-amber-400">
              Más popular: {popularScore}
            </span>
          )}
          <span className="rounded-md border border-[#1a2e1a] bg-[#0c160c] px-2 py-0.5 text-[11px] font-black tabular-nums text-[#5a8a5a]">
            {total} {total === 1 ? "pick" : "picks"}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {/* Distribution bars */}
        <div className="mb-4 space-y-2">
          <DistBar
            flag={homeFlag}
            label={match.homeTeam}
            pct={pctHome}
            count={homeWins}
            color="green"
          />
          <DistBar
            flag="⚖️"
            label="Empate"
            pct={pctDraw}
            count={draws}
            color="amber"
          />
          <DistBar
            flag={awayFlag}
            label={match.awayTeam}
            pct={pctAway}
            count={awayWins}
            color="red"
          />
        </div>

        {/* Divider */}
        <div className="mb-3 border-t border-[#1a2e1a]" />

        {/* Individual picks */}
        <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {sorted.map((p) => {
            const isMe = normalizeKey(p.playerName) === myKey;
            const outcome = getOutcome(p.homeScore, p.awayScore);

            return (
              <div
                key={p.id}
                className={cn(
                  "flex flex-col items-stretch gap-2 rounded-lg border px-3 py-2 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-[420px]:gap-3",
                  isMe
                    ? "border-green-700/40 bg-green-950/20"
                    : "border-[#151f15] bg-[#0c160c]"
                )}
              >
                {/* Player name */}
                <div className="flex min-w-0 items-center gap-2">
                  {isMe && (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400"
                      style={{ boxShadow: "0 0 4px rgba(74,222,128,0.8)" }}
                    />
                  )}
                  <span
                    className={cn(
                      "min-w-0 truncate text-sm font-black",
                      isMe ? "text-green-400" : "text-[#a0c0a0]"
                    )}
                  >
                    {isMe ? "Vos" : p.playerName}
                  </span>
                </div>

                {/* Score */}
                <div className="flex min-w-0 flex-wrap items-center gap-1.5 min-[420px]:shrink-0 min-[420px]:justify-end">
                  <span className="text-lg leading-none">{homeFlag}</span>
                  <span
                    className={cn(
                      "text-sm font-black tabular-nums",
                      outcome === "home"
                        ? "text-green-400"
                        : outcome === "draw"
                          ? "text-amber-400"
                          : "text-red-400"
                    )}
                  >
                    {p.homeScore}–{p.awayScore}
                  </span>
                  <span className="text-lg leading-none">{awayFlag}</span>
                  {p.winnerPick && (
                    <span className="ml-1 min-w-0 break-words text-[10px] font-black text-[#3a5a3a]">
                      ({p.winnerPick === "home" ? match.homeTeam : match.awayTeam} pen.)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DistBar({
  flag,
  label,
  pct,
  count,
  color,
}: {
  flag: string;
  label: string;
  pct: number;
  count: number;
  color: "green" | "amber" | "red";
}) {
  const barClass =
    color === "green"
      ? "bg-green-500"
      : color === "amber"
        ? "bg-amber-500"
        : "bg-red-500";
  const textClass =
    color === "green"
      ? "text-green-400"
      : color === "amber"
        ? "text-amber-400"
        : "text-red-400";
  const glowColor =
    color === "green"
      ? "rgba(34,197,94,0.5)"
      : color === "amber"
        ? "rgba(245,158,11,0.5)"
        : "rgba(239,68,68,0.5)";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-5 shrink-0 text-center text-sm leading-none">{flag}</span>
      <span className="w-16 shrink-0 truncate text-[11px] font-bold text-[#4a6e4a] sm:w-20">{label}</span>
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full border border-[#1a2e1a] bg-[#0c160c]">
        {pct > 0 && (
          <div
            className={cn("h-full rounded-full transition-all duration-500", barClass)}
            style={{
              width: `${pct}%`,
              boxShadow: pct > 0 ? `0 0 6px ${glowColor}` : undefined,
            }}
          />
        )}
      </div>
      <span className={cn("w-8 shrink-0 text-right text-xs font-black tabular-nums", textClass)}>
        {pct}%
      </span>
      <span className="w-6 shrink-0 text-[11px] text-[#2a4020]">({count})</span>
    </div>
  );
}
