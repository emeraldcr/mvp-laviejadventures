import { Star, Target, TrendingUp } from "lucide-react";
import type { LeaderboardEntry } from "../adminTypes";
import { cn } from "../../utils";

type AdminLeaderboardProps = {
  leaderboard: LeaderboardEntry[];
  onPlayerClick?: (entry: LeaderboardEntry) => void;
};

const PODIUM_COLORS = [
  { card: "border-amber-200 bg-gradient-to-br from-amber-50 to-white", medal: "🥇", pts: "text-amber-700", bar: "bg-amber-400" },
  { card: "border-slate-200 bg-gradient-to-br from-slate-50 to-white", medal: "🥈", pts: "text-slate-700", bar: "bg-slate-400" },
  { card: "border-orange-100 bg-gradient-to-br from-orange-50 to-white", medal: "🥉", pts: "text-orange-700", bar: "bg-orange-400" },
];

export function AdminLeaderboard({ leaderboard, onPlayerClick }: AdminLeaderboardProps) {
  if (!leaderboard.length) {
    return (
      <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-black text-slate-600">Todavia no hay predicciones guardadas para puntuar.</p>
      </div>
    );
  }

  const maxPts = leaderboard[0].totalPoints;

  return (
    <div className="grid gap-5">
      {/* Podium */}
      <div className="grid gap-3 sm:grid-cols-3">
        {leaderboard.slice(0, 3).map((entry, i) => {
          const color = PODIUM_COLORS[i];
          const barWidth = maxPts > 0 ? Math.round((entry.totalPoints / maxPts) * 100) : 0;
          const accuracy =
            entry.scoredPredictions > 0
              ? Math.round((entry.exactScores / entry.scoredPredictions) * 100)
              : 0;

          return (
            <div
              key={entry.normalizedName}
              onClick={() => onPlayerClick?.(entry)}
              className={cn(
                "rounded-xl border p-4 shadow-sm",
                color.card,
                i === 0 && "ring-2 ring-amber-200",
                onPlayerClick && "cursor-pointer transition-shadow hover:shadow-md hover:ring-2 hover:ring-slate-300"
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="text-3xl leading-none">{color.medal}</span>
                <div className="text-right">
                  <span className={cn("text-2xl font-black tabular-nums", color.pts)}>
                    {entry.totalPoints}
                  </span>
                  <span className="ml-1 text-xs font-bold text-slate-400">pts</span>
                </div>
              </div>

              <p className="mb-1 truncate text-base font-black text-slate-950">{entry.playerName}</p>

              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className={cn("h-full rounded-full", color.bar)} style={{ width: `${barWidth}%` }} />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div className="rounded-lg bg-white/60 px-2 py-1.5 text-center">
                  <p className="text-[10px] font-bold text-slate-400">Exactos</p>
                  <p className="text-sm font-black text-emerald-700">{entry.exactScores}</p>
                </div>
                <div className="rounded-lg bg-white/60 px-2 py-1.5 text-center">
                  <p className="text-[10px] font-bold text-slate-400">Resul.</p>
                  <p className="text-sm font-black text-sky-700">{entry.correctOutcomes}</p>
                </div>
                <div className="rounded-lg bg-white/60 px-2 py-1.5 text-center">
                  <p className="text-[10px] font-bold text-slate-400">Prec.</p>
                  <p className="text-sm font-black text-slate-700">{accuracy}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs">
                <th className="px-3 py-3 text-left font-black uppercase tracking-wide text-slate-400">#</th>
                <th className="px-3 py-3 text-left font-black uppercase tracking-wide text-slate-400">Jugador</th>
                <th className="px-3 py-3 text-right font-black uppercase tracking-wide text-slate-400">Total</th>
                <th className="px-3 py-3 text-right font-black uppercase tracking-wide text-slate-400">
                  <span className="hidden sm:inline">Predicc.</span>
                  <span className="sm:hidden">Pred.</span>
                </th>
                <th className="px-3 py-3 text-right font-black uppercase tracking-wide text-slate-400">
                  <span className="hidden sm:inline">Stats</span>
                  <span className="sm:hidden">St.</span>
                </th>
                <th className="px-3 py-3 text-right font-black uppercase tracking-wide text-emerald-600">
                  <span className="flex items-center justify-end gap-1">
                    <Target className="h-3 w-3" />
                    <span className="hidden sm:inline">Exactos</span>
                  </span>
                </th>
                <th className="px-3 py-3 text-right font-black uppercase tracking-wide text-sky-600">
                  <span className="flex items-center justify-end gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className="hidden sm:inline">Result.</span>
                  </span>
                </th>
                <th className="hidden px-3 py-3 text-right font-black uppercase tracking-wide text-slate-400 sm:table-cell">
                  Jugados
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((entry, i) => {
                const isFirst = i === 0;
                const isTied = i > 0 && entry.totalPoints === leaderboard[i - 1].totalPoints;
                const barWidth = maxPts > 0 ? Math.round((entry.totalPoints / maxPts) * 100) : 0;
                const medals = ["🥇", "🥈", "🥉"];

                return (
                  <tr
                    key={entry.normalizedName}
                    onClick={() => onPlayerClick?.(entry)}
                    className={cn(
                      "transition-colors",
                      isFirst ? "bg-amber-50" : "hover:bg-slate-50/70",
                      onPlayerClick && "cursor-pointer hover:bg-slate-100/80"
                    )}
                  >
                    {/* Rank */}
                    <td className="px-3 py-3">
                      {medals[i] ? (
                        <span className="text-base leading-none">{medals[i]}</span>
                      ) : (
                        <span className={cn("text-sm font-black tabular-nums", isTied ? "text-slate-400" : "text-slate-500")}>
                          {isTied ? "=" : i + 1}
                        </span>
                      )}
                    </td>

                    {/* Player */}
                    <td className="px-3 py-3">
                      <div className="min-w-0">
                        <p className={cn("font-black", isFirst ? "text-amber-900" : "text-slate-950")}>
                          {entry.playerName}
                        </p>
                        {/* Mini points bar */}
                        <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={cn("h-full rounded-full", isFirst ? "bg-amber-400" : "bg-slate-300")}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Total pts */}
                    <td className="px-3 py-3 text-right">
                      <span className={cn("text-base font-black tabular-nums", isFirst ? "text-amber-800" : "text-slate-950")}>
                        {entry.totalPoints}
                      </span>
                    </td>

                    {/* Prediction pts */}
                    <td className="px-3 py-3 text-right font-bold tabular-nums text-slate-600">
                      {entry.predictionPoints}
                    </td>

                    {/* Stat pts */}
                    <td className="px-3 py-3 text-right">
                      {entry.statPoints > 0 ? (
                        <span className="inline-flex items-center justify-end gap-1 font-bold tabular-nums text-purple-700">
                          <Star className="h-3 w-3 text-purple-400" />
                          {entry.statPoints}
                        </span>
                      ) : (
                        <span className="font-bold text-slate-300">—</span>
                      )}
                    </td>

                    {/* Exactos */}
                    <td className="px-3 py-3 text-right">
                      <span className={cn(
                        "font-black tabular-nums",
                        entry.exactScores > 0 ? "text-emerald-700" : "text-slate-300"
                      )}>
                        {entry.exactScores}
                      </span>
                    </td>

                    {/* Correctos */}
                    <td className="px-3 py-3 text-right">
                      <span className={cn(
                        "font-black tabular-nums",
                        entry.correctOutcomes > 0 ? "text-sky-700" : "text-slate-300"
                      )}>
                        {entry.correctOutcomes}
                      </span>
                    </td>

                    {/* Jugados/Scored */}
                    <td className="hidden px-3 py-3 text-right sm:table-cell">
                      <span className="text-xs font-bold tabular-nums text-slate-400">
                        {entry.scoredPredictions}/{entry.totalPredictions}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1"><Target className="h-3 w-3 text-emerald-500" /> Exacto = 3 pts · Exacto + pase = 4 pts</span>
            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-sky-500" /> Resultado = 1 pt · Resultado + pase = 2 pts</span>
            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-purple-400" /> Stat correcta = 1 pt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
