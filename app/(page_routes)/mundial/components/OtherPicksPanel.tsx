import { TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import type { MundialMatch, Prediction } from "../types";
import { cn, normalizeKey } from "../utils";
import { Flag } from "./Flag";

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
    let h = 0;
    let d = 0;
    let a = 0;

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
  const pctAway = awayWins > 0 ? 100 - pctHome - pctDraw : 0;

  const myKey = normalizeKey(playerName);

  const sorted = [...matchPicks].sort((a, b) => {
    const aIsMe = normalizeKey(a.playerName) === myKey;
    const bIsMe = normalizeKey(b.playerName) === myKey;
    if (aIsMe && !bIsMe) return -1;
    if (!aIsMe && bIsMe) return 1;
    return a.playerName.localeCompare(b.playerName);
  });

  const scoreCounts = new Map<string, number>();
  for (const p of matchPicks) {
    const key = `${p.homeScore}-${p.awayScore}`;
    scoreCounts.set(key, (scoreCounts.get(key) ?? 0) + 1);
  }
  const popularEntry = [...scoreCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const [popularScore, popularCount] = popularEntry ?? ["?", 0];

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-[#263b27] bg-[#0b130d]">
      <div className="border-b border-[#263b27] bg-[#101911] px-4 py-4 sm:px-5">
        <div className="flex flex-col items-stretch gap-3 min-[620px]:flex-row min-[620px]:items-center min-[620px]:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#2b3d2b] bg-[#070907]">
              <Users className="h-5 w-5 text-emerald-300" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Picks del partido</p>
              <h2 className="mt-1 text-xl font-black text-white">{total} {total === 1 ? "pick" : "picks"} guardados</h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 min-[620px]:justify-end">
            {popularCount > 1 && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-700/50 bg-amber-950/25 px-3 py-1.5 text-sm font-black text-amber-200">
                <TrendingUp className="h-4 w-4" />
                Mas popular: {popularScore}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-5 grid gap-3">
          <DistBar team={match.homeTeam} label={match.homeTeam} pct={pctHome} count={homeWins} color="green" />
          <DistBar label="Empate" pct={pctDraw} count={draws} color="amber" />
          <DistBar team={match.awayTeam} label={match.awayTeam} pct={pctAway} count={awayWins} color="red" />
        </div>

        <div className="mb-4 h-px bg-[#263b27]" />

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {sorted.map((p) => {
            const isMe = normalizeKey(p.playerName) === myKey;
            const outcome = getOutcome(p.homeScore, p.awayScore);

            return (
              <div
                key={p.id}
                className={cn(
                  "flex flex-col items-stretch gap-2 rounded-lg border px-3 py-3 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between min-[520px]:gap-3",
                  isMe ? "border-emerald-600/50 bg-emerald-950/25" : "border-[#263b27] bg-[#101711]"
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  {isMe && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)]" />}
                  <span className={cn("min-w-0 truncate text-base font-black", isMe ? "text-emerald-200" : "text-white")}>
                    {isMe ? "Vos" : p.playerName}
                  </span>
                </div>

                <div className="flex min-w-0 flex-wrap items-center gap-2 min-[520px]:shrink-0 min-[520px]:justify-end">
                  <Flag team={match.homeTeam} size="sm" />
                  <span
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-base font-black tabular-nums",
                      outcome === "home"
                        ? "border-emerald-700/50 bg-emerald-950/30 text-emerald-200"
                        : outcome === "draw"
                          ? "border-amber-700/50 bg-amber-950/30 text-amber-200"
                          : "border-red-800/50 bg-red-950/30 text-red-200"
                    )}
                  >
                    {p.homeScore}-{p.awayScore}
                  </span>
                  <Flag team={match.awayTeam} size="sm" />
                  {p.winnerPick && (
                    <span className="ml-1 min-w-0 break-words text-xs font-black text-[#8ca58f]">
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
  team,
  label,
  pct,
  count,
  color,
}: {
  team?: string;
  label: string;
  pct: number;
  count: number;
  color: "green" | "amber" | "red";
}) {
  const barClass =
    color === "green"
      ? "bg-emerald-500"
      : color === "amber"
        ? "bg-amber-500"
        : "bg-red-500";
  const textClass =
    color === "green"
      ? "text-emerald-200"
      : color === "amber"
        ? "text-amber-200"
        : "text-red-200";

  return (
    <div className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)_4rem] items-center gap-3 rounded-lg border border-[#263b27] bg-[#101711] p-3">
      {team ? <Flag team={team} size="md" /> : <span className="text-center text-xl font-black leading-none">X</span>}
      <div className="min-w-0">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-base font-black text-white">{label}</span>
          <span className="shrink-0 text-sm font-black text-[#8ca58f]">{count} picks</span>
        </div>
        <div className="h-3 min-w-0 overflow-hidden rounded-full border border-[#2b3d2b] bg-[#070907]">
          {pct > 0 && (
            <div className={cn("h-full rounded-full transition-all duration-500", barClass)} style={{ width: `${pct}%` }} />
          )}
        </div>
      </div>
      <span className={cn("text-right text-2xl font-black tabular-nums", textClass)}>{pct}%</span>
    </div>
  );
}
