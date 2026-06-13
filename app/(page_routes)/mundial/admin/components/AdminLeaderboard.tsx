import { Medal, Star, Target, Zap } from "lucide-react";
import type { LeaderboardEntry } from "../adminTypes";
import { cn } from "../../utils";

type AdminLeaderboardProps = {
  leaderboard: LeaderboardEntry[];
};

export function AdminLeaderboard({ leaderboard }: AdminLeaderboardProps) {
  if (!leaderboard.length) {
    return (
      <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-black text-slate-600">Todavia no hay predicciones guardadas para puntuar.</p>
      </div>
    );
  }

  const leader = leaderboard[0];

  return (
    <div className="grid gap-4">
      {/* Top 3 podium */}
      {leaderboard.length >= 1 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {leaderboard.slice(0, 3).map((entry, i) => {
            const pct = leader.totalPoints > 0 ? Math.round((entry.totalPoints / leader.totalPoints) * 100) : 0;
            const medals = ["🥇", "🥈", "🥉"];
            const colors = [
              "border-amber-200 bg-amber-50",
              "border-slate-200 bg-slate-50",
              "border-orange-100 bg-orange-50",
            ];

            return (
              <div key={entry.normalizedName} className={cn("rounded-lg border p-4 shadow-sm", colors[i])}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="text-2xl">{medals[i]}</span>
                  <span className="rounded-lg bg-slate-950 px-2 py-1 text-xs font-black tabular-nums text-white">
                    {entry.totalPoints} pts
                  </span>
                </div>
                <p className="truncate text-lg font-black text-slate-950">{entry.playerName}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-emerald-600" />
                    {entry.exactScores} exactos
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-sky-600" />
                    {entry.statPoints} stats
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-500">#</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-500">Jugador</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">Total</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">Predicc.</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">Stats</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">Exactos</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">Correctos</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">Jugados</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => {
                const isFirst = i === 0;
                const isTied = i > 0 && entry.totalPoints === leaderboard[i - 1].totalPoints;

                return (
                  <tr
                    key={entry.normalizedName}
                    className={cn(
                      "border-b border-slate-100 transition-colors",
                      isFirst ? "bg-amber-50" : "hover:bg-slate-50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className={cn("text-sm font-black tabular-nums", isFirst ? "text-amber-700" : "text-slate-500")}>
                        {isTied ? "=" : i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isFirst && <Medal className="h-4 w-4 shrink-0 text-amber-500" />}
                        {i === 1 && <Medal className="h-4 w-4 shrink-0 text-slate-400" />}
                        {i === 2 && <Medal className="h-4 w-4 shrink-0 text-orange-400" />}
                        <span className="font-black text-slate-950">{entry.playerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("text-base font-black tabular-nums", isFirst ? "text-amber-700" : "text-slate-950")}>
                        {entry.totalPoints}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-700">
                      {entry.predictionPoints}
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-700">
                      {entry.statPoints > 0 ? (
                        <span className="flex items-center justify-end gap-1">
                          <Star className="h-3 w-3 text-purple-500" />
                          {entry.statPoints}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-emerald-700">
                      {entry.exactScores}
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-sky-700">
                      {entry.correctOutcomes}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-bold tabular-nums text-slate-500">
                      {entry.scoredPredictions}/{entry.totalPredictions}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Points legend */}
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-bold text-slate-500">
            Puntos: marcador exacto = 3 pts · exacto + pase correcto = 4 pts · resultado correcto = 1 pt · resultado + pase = 2 pts · stat correcta = 1 pt
          </p>
        </div>
      </div>
    </div>
  );
}
