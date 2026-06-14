import { CalendarDays, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import type { MundialMatch, Prediction } from "../types";
import { cn, formatKickoff, normalizeKey } from "../utils";
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
  showEmpty?: boolean;
};

export function OtherPicksPanel({ match, predictions, playerName, showEmpty = false }: OtherPicksPanelProps) {
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
  if (total === 0 && !showEmpty) return null;

  const pctHome = total > 0 ? Math.round((homeWins / total) * 100) : 0;
  const pctDraw = total > 0 ? Math.round((draws / total) * 100) : 0;
  const pctAway = total > 0 && awayWins > 0 ? 100 - pctHome - pctDraw : 0;

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
      <div className="border-b border-[#263b27] bg-[#101911] px-4 py-3 sm:px-5">
        <div className="flex flex-col items-stretch gap-3 min-[620px]:flex-row min-[620px]:items-center min-[620px]:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#2b3d2b] bg-[#070907]">
              <Users className="h-4 w-4 text-emerald-300" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Picks de amigos</p>
              <h2 className="mt-1 text-lg font-black text-white sm:text-xl">
                {match.homeTeam} vs {match.awayTeam}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#8ca58f] sm:text-sm">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{formatKickoff(match.kickoffAt)}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 min-[620px]:justify-end">
            <span className="rounded-md border border-[#2b3d2b] bg-[#071007] px-3 py-1.5 text-sm font-black text-[#b7d5ba]">
              {total} {total === 1 ? "pick" : "picks"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {total > 0 ? (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-2 px-1">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ca58f]">Amigos</p>
                <span className="rounded-md border border-[#2b3d2b] bg-[#071007] px-2 py-1 text-xs font-black tabular-nums text-[#a9c7ad]">
                  {sorted.length}
                </span>
              </div>

              <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
                {sorted.map((p) => {
                  const isMe = normalizeKey(p.playerName) === myKey;
                  const outcome = getOutcome(p.homeScore, p.awayScore);

                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border px-3 py-2.5",
                        isMe ? "border-emerald-600/50 bg-emerald-950/25" : "border-[#263b27] bg-[#101711]"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {isMe && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.9)]" />}
                        <span className={cn("min-w-0 truncate text-base font-black", isMe ? "text-emerald-200" : "text-white")}>
                          {isMe ? "Vos" : p.playerName}
                        </span>
                      </div>

                      <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5">
                        <Flag team={match.homeTeam} size="xs" />
                        <span
                          className={cn(
                            "rounded-md border px-2 py-1 text-sm font-black tabular-nums sm:text-base",
                            outcome === "home"
                              ? "border-emerald-700/50 bg-emerald-950/30 text-emerald-200"
                              : outcome === "draw"
                                ? "border-amber-700/50 bg-amber-950/30 text-amber-200"
                                : "border-red-800/50 bg-red-950/30 text-red-200"
                          )}
                        >
                          {p.homeScore}-{p.awayScore}
                        </span>
                        <Flag team={match.awayTeam} size="xs" />
                        {p.winnerPick && (
                          <span className="hidden max-w-28 truncate text-xs font-black text-[#8ca58f] min-[560px]:inline">
                            pen. {p.winnerPick === "home" ? match.homeTeam : match.awayTeam}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside className="min-w-0 rounded-lg border border-[#263b27] bg-[#0f1710] p-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="inline-flex min-w-0 items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#8ca58f]">
                  <TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  <span className="truncate">Stats</span>
                </p>
                {popularCount > 1 && (
                  <span className="shrink-0 rounded-md border border-amber-700/50 bg-amber-950/25 px-2 py-1 text-[11px] font-black text-amber-200">
                    {popularScore}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <DistBar team={match.homeTeam} label={match.homeTeam} pct={pctHome} count={homeWins} color="green" />
                <DistBar label="Empate" pct={pctDraw} count={draws} color="amber" />
                <DistBar team={match.awayTeam} label={match.awayTeam} pct={pctAway} count={awayWins} color="red" />
              </div>
            </aside>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#263b27] bg-[#101711] p-6 text-center">
            <Users className="mx-auto h-10 w-10 text-[#8ca58f]" />
            <p className="mt-3 text-lg font-black text-white">Sin marcadores guardados</p>
            <p className="mt-2 text-sm font-bold text-[#8ca58f]">
              Cuando otros jugadores guarden este partido, van a aparecer aqui.
            </p>
          </div>
        )}
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
    <div className="rounded-md border border-[#263b27] bg-[#101711] p-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid h-6 w-7 shrink-0 place-items-center rounded border border-[#2b3d2b] bg-[#070907]">
          {team ? <Flag team={team} size="xs" /> : <span className="text-xs font-black leading-none">X</span>}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-black text-white">{label}</span>
        <span className={cn("shrink-0 text-sm font-black tabular-nums", textClass)}>{pct}%</span>
      </div>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="h-1.5 min-w-0 overflow-hidden rounded-full border border-[#2b3d2b] bg-[#070907]">
          {pct > 0 && (
            <div className={cn("h-full rounded-full transition-all duration-500", barClass)} style={{ width: `${pct}%` }} />
          )}
        </div>
        <span className="text-[10px] font-black text-[#8ca58f]">{count} picks</span>
      </div>
    </div>
  );
}
