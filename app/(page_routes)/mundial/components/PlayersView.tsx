import { Target, TrendingUp, Trophy, Users } from "lucide-react";
import type { LeaderboardEntry } from "../types";
import { cn } from "../utils";

type PlayersViewProps = {
  leaderboard: LeaderboardEntry[];
};

const PODIUM_STYLES = [
  { card: "border-[#d5ff3f]/70 bg-[#10240b]", rank: "bg-[#d5ff3f] text-[#06121c]", pts: "text-[#d5ff3f]", bar: "bg-[#d5ff3f]" },
  { card: "border-[#62ffe6]/60 bg-[#071d2a]", rank: "bg-[#62ffe6] text-[#06121c]", pts: "text-[#62ffe6]", bar: "bg-[#62ffe6]" },
  { card: "border-[#ff6a3d]/60 bg-[#2a120b]", rank: "bg-[#ff6a3d] text-white", pts: "text-[#ffb15f]", bar: "bg-[#ff6a3d]" },
];

export function PlayersView({ leaderboard }: PlayersViewProps) {
  if (!leaderboard.length) {
    return (
      <section className="grid min-h-56 place-items-center rounded-lg border border-dashed border-white/20 bg-black/35 p-6 text-center sm:p-8">
        <div>
          <Users className="mx-auto h-12 w-12 text-[#62ffe6]" />
          <p className="mt-4 text-xl font-black text-white">Todavia no hay jugadores</p>
          <p className="mt-2 text-base font-bold text-white/60">Se el primero en guardar tu quiniela.</p>
        </div>
      </section>
    );
  }

  const maxPts = leaderboard[0].totalPoints;

  return (
    <section className="grid gap-4">
      <div className="overflow-hidden rounded-lg border border-[#9dff34]/55 bg-[#06140f] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
        <div className="bg-[#3151ff] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#d5ff3f]" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d5ff3f]">Tabla de posiciones</p>
          </div>
          <h2 className="mt-1 text-2xl font-black uppercase text-white sm:text-3xl">
            {leaderboard.length} <span className="text-white/65">jugadores</span>
          </h2>
        </div>
      </div>

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
              className={cn("rounded-lg border p-4 shadow-[0_18px_52px_rgba(0,0,0,0.22)]", style.card, i === 0 && "ring-1 ring-[#d5ff3f]/45")}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className={cn("grid h-10 w-10 place-items-center rounded-lg text-xl font-black", style.rank)}>
                  {i + 1}
                </span>
                <div className="text-right">
                  <span className={cn("text-2xl font-black tabular-nums", style.pts)}>{entry.totalPoints}</span>
                  <span className="ml-1 text-xs font-bold text-white/55">pts</span>
                </div>
              </div>

              <p className="mb-1 truncate text-base font-black text-white">{entry.playerName}</p>

              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-black/45">
                <div className={cn("h-full rounded-full", style.bar)} style={{ width: `${barWidth}%` }} />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <MiniStat label="Exactos" value={entry.exactScores} tone="lime" />
                <MiniStat label="Resul." value={entry.correctOutcomes} tone="cyan" />
                <MiniStat label="Prec." value={`${accuracy}%`} tone="white" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-lg border border-white/15 bg-[#071018] shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/15 bg-[#3151ff] text-xs">
                <th className="px-3 py-3 text-left font-black uppercase tracking-wide text-[#d5ff3f]">#</th>
                <th className="px-3 py-3 text-left font-black uppercase tracking-wide text-white">Jugador</th>
                <th className="px-3 py-3 text-right font-black uppercase tracking-wide text-white">Total</th>
                <th className="px-3 py-3 text-right font-black uppercase tracking-wide text-[#d5ff3f]">
                  <span className="flex items-center justify-end gap-1">
                    <Target className="h-3 w-3" />
                    <span className="hidden sm:inline">Exactos</span>
                  </span>
                </th>
                <th className="px-3 py-3 text-right font-black uppercase tracking-wide text-[#62ffe6]">
                  <span className="flex items-center justify-end gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className="hidden sm:inline">Result.</span>
                  </span>
                </th>
                <th className="hidden px-3 py-3 text-right font-black uppercase tracking-wide text-white/70 sm:table-cell">
                  Jugados
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {leaderboard.map((entry, i) => {
                const isFirst = i === 0;
                const isTied = i > 0 && entry.totalPoints === leaderboard[i - 1].totalPoints;
                const barWidth = maxPts > 0 ? Math.round((entry.totalPoints / maxPts) * 100) : 0;

                return (
                  <tr
                    key={entry.normalizedName}
                    className={cn(
                      "transition-colors",
                      isFirst ? "bg-[#10240b]/65" : "hover:bg-white/5"
                    )}
                  >
                    <td className="px-3 py-3">
                      <span className={cn("text-sm font-black tabular-nums", isTied ? "text-white/50" : "text-white")}>
                        {isTied ? "=" : i + 1}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="min-w-0">
                        <p className={cn("font-black", isFirst ? "text-[#d5ff3f]" : "text-white")}>
                          {entry.playerName}
                        </p>
                        <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-black/55">
                          <div
                            className={cn("h-full rounded-full", isFirst ? "bg-[#d5ff3f]" : "bg-[#62ffe6]")}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-right">
                      <span className={cn("text-base font-black tabular-nums", isFirst ? "text-[#d5ff3f]" : "text-white")}>
                        {entry.totalPoints}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-right">
                      <span className={cn("font-black tabular-nums", entry.exactScores > 0 ? "text-[#d5ff3f]" : "text-white/25")}>
                        {entry.exactScores}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-right">
                      <span className={cn("font-black tabular-nums", entry.correctOutcomes > 0 ? "text-[#62ffe6]" : "text-white/25")}>
                        {entry.correctOutcomes}
                      </span>
                    </td>

                    <td className="hidden px-3 py-3 text-right sm:table-cell">
                      <span className="text-xs font-bold tabular-nums text-white/55">
                        {entry.scoredPredictions}/{entry.totalPredictions}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-white/15 bg-black/35 px-4 py-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-white/60">
            <span className="flex items-center gap-1"><Target className="h-3 w-3 text-[#d5ff3f]" /> Exacto = 3 pts</span>
            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-[#62ffe6]" /> Resultado = 1 pt</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number | string; tone: "lime" | "cyan" | "white" }) {
  const textClass = tone === "lime" ? "text-[#d5ff3f]" : tone === "cyan" ? "text-[#62ffe6]" : "text-white";

  return (
    <div className="rounded-md border border-white/10 bg-black/45 px-2 py-1.5 text-center">
      <p className="text-[10px] font-black uppercase tracking-wider text-white/55">{label}</p>
      <p className={cn("text-sm font-black", textClass)}>{value}</p>
    </div>
  );
}
