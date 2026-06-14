import { Target, TrendingUp, Trophy, Users } from "lucide-react";
import type { LeaderboardEntry } from "../types";
import { cn } from "../utils";

type PlayersViewProps = {
  leaderboard: LeaderboardEntry[];
};

const PODIUM_STYLES = [
  { card: "border-amber-700/60 bg-[#15110a]", medal: "🥇", pts: "text-amber-300", bar: "bg-amber-400", sub: "text-amber-200/70" },
  { card: "border-[#2a3f55] bg-[#0b1119]", medal: "🥈", pts: "text-cyan-300", bar: "bg-cyan-400", sub: "text-cyan-200/60" },
  { card: "border-emerald-700/50 bg-[#0b130d]", medal: "🥉", pts: "text-emerald-300", bar: "bg-emerald-500", sub: "text-emerald-200/60" },
];

export function PlayersView({ leaderboard }: PlayersViewProps) {
  if (!leaderboard.length) {
    return (
      <section className="grid min-h-56 place-items-center rounded-lg border border-dashed border-[#2b3d2b] bg-[#0b130d] p-6 text-center sm:p-8">
        <div>
          <Users className="mx-auto h-12 w-12 text-[#8ca58f]" />
          <p className="mt-4 text-xl font-black text-white">Todavia no hay jugadores</p>
          <p className="mt-2 text-base font-bold text-[#8ca58f]">Se el primero en guardar tu quiniela.</p>
        </div>
      </section>
    );
  }

  const maxPts = leaderboard[0].totalPoints;

  return (
    <section className="grid gap-4">
      {/* Header */}
      <div className="overflow-hidden rounded-lg border border-[#263b27] bg-[#0b130d]">
        <div className="border-b border-[#263b27] bg-[#101911] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-300" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Tabla de posiciones</p>
          </div>
          <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
            {leaderboard.length} <span className="text-[#a9c7ad]">jugadores</span>
          </h2>
        </div>
      </div>

      {/* Podium top 3 */}
      <div className="grid gap-3 sm:grid-cols-3">
        {leaderboard.slice(0, 3).map((entry, i) => {
          const style = PODIUM_STYLES[i];
          const barWidth = maxPts > 0 ? Math.round((entry.totalPoints / maxPts) * 100) : 0;
          const accuracy =
            entry.scoredPredictions > 0
              ? Math.round((entry.exactScores / entry.scoredPredictions) * 100)
              : 0;

          return (
            <div
              key={entry.normalizedName}
              className={cn("rounded-lg border p-4", style.card, i === 0 && "ring-1 ring-amber-700/50")}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="text-3xl leading-none">{style.medal}</span>
                <div className="text-right">
                  <span className={cn("text-2xl font-black tabular-nums", style.pts)}>{entry.totalPoints}</span>
                  <span className="ml-1 text-xs font-bold text-[#8ca58f]">pts</span>
                </div>
              </div>

              <p className="mb-1 truncate text-base font-black text-white">{entry.playerName}</p>

              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#263b27]">
                <div className={cn("h-full rounded-full", style.bar)} style={{ width: `${barWidth}%` }} />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div className="rounded-md border border-[#263b27] bg-[#070907] px-2 py-1.5 text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#8ca58f]">Exactos</p>
                  <p className="text-sm font-black text-emerald-400">{entry.exactScores}</p>
                </div>
                <div className="rounded-md border border-[#263b27] bg-[#070907] px-2 py-1.5 text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#8ca58f]">Resul.</p>
                  <p className="text-sm font-black text-cyan-400">{entry.correctOutcomes}</p>
                </div>
                <div className="rounded-md border border-[#263b27] bg-[#070907] px-2 py-1.5 text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#8ca58f]">Prec.</p>
                  <p className="text-sm font-black text-[#b7d5ba]">{accuracy}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="overflow-hidden rounded-lg border border-[#263b27] bg-[#0b130d]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#263b27] bg-[#101911] text-xs">
                <th className="px-3 py-3 text-left font-black uppercase tracking-wide text-[#8ca58f]">#</th>
                <th className="px-3 py-3 text-left font-black uppercase tracking-wide text-[#8ca58f]">Jugador</th>
                <th className="px-3 py-3 text-right font-black uppercase tracking-wide text-[#8ca58f]">Total</th>
                <th className="px-3 py-3 text-right font-black uppercase tracking-wide text-emerald-400">
                  <span className="flex items-center justify-end gap-1">
                    <Target className="h-3 w-3" />
                    <span className="hidden sm:inline">Exactos</span>
                  </span>
                </th>
                <th className="px-3 py-3 text-right font-black uppercase tracking-wide text-cyan-400">
                  <span className="flex items-center justify-end gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className="hidden sm:inline">Result.</span>
                  </span>
                </th>
                <th className="hidden px-3 py-3 text-right font-black uppercase tracking-wide text-[#8ca58f] sm:table-cell">
                  Jugados
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2a1b]">
              {leaderboard.map((entry, i) => {
                const isFirst = i === 0;
                const isTied = i > 0 && entry.totalPoints === leaderboard[i - 1].totalPoints;
                const barWidth = maxPts > 0 ? Math.round((entry.totalPoints / maxPts) * 100) : 0;
                const medals = ["🥇", "🥈", "🥉"];

                return (
                  <tr
                    key={entry.normalizedName}
                    className={cn(
                      "transition-colors",
                      isFirst ? "bg-amber-950/20" : "hover:bg-[#101711]"
                    )}
                  >
                    <td className="px-3 py-3">
                      {medals[i] ? (
                        <span className="text-base leading-none">{medals[i]}</span>
                      ) : (
                        <span className={cn("text-sm font-black tabular-nums", isTied ? "text-[#8ca58f]" : "text-[#a9c7ad]")}>
                          {isTied ? "=" : i + 1}
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <div className="min-w-0">
                        <p className={cn("font-black", isFirst ? "text-amber-200" : "text-white")}>
                          {entry.playerName}
                        </p>
                        <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-[#1a2a1b]">
                          <div
                            className={cn("h-full rounded-full", isFirst ? "bg-amber-400" : "bg-emerald-600")}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-right">
                      <span className={cn("text-base font-black tabular-nums", isFirst ? "text-amber-300" : "text-white")}>
                        {entry.totalPoints}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-right">
                      <span className={cn("font-black tabular-nums", entry.exactScores > 0 ? "text-emerald-400" : "text-[#3a5040]")}>
                        {entry.exactScores}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-right">
                      <span className={cn("font-black tabular-nums", entry.correctOutcomes > 0 ? "text-cyan-400" : "text-[#2a3f50]")}>
                        {entry.correctOutcomes}
                      </span>
                    </td>

                    <td className="hidden px-3 py-3 text-right sm:table-cell">
                      <span className="text-xs font-bold tabular-nums text-[#8ca58f]">
                        {entry.scoredPredictions}/{entry.totalPredictions}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#263b27] bg-[#101911] px-4 py-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-[#8ca58f]">
            <span className="flex items-center gap-1"><Target className="h-3 w-3 text-emerald-400" /> Exacto = 3 pts</span>
            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-cyan-400" /> Resultado = 1 pt</span>
          </div>
        </div>
      </div>
    </section>
  );
}
