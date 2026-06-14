import { Trophy, UserRound, Users } from "lucide-react";
import { TOTAL_MATCHES } from "../constants";
import type { PlayerProgress } from "../types";
import { cn, formatUpdatedAt } from "../utils";

type PlayersViewProps = {
  players: PlayerProgress[];
};

const RANK_STYLES = [
  {
    card: "border-amber-600/60 bg-[#15110a]",
    badge: "border-amber-600/60 bg-amber-950/35 text-amber-200",
    bar: "bg-amber-400",
    accent: "text-amber-200",
  },
  {
    card: "border-cyan-800/50 bg-[#0b1315]",
    badge: "border-cyan-800/50 bg-cyan-950/25 text-cyan-200",
    bar: "bg-cyan-400",
    accent: "text-cyan-200",
  },
  {
    card: "border-emerald-700/50 bg-[#0b130d]",
    badge: "border-emerald-700/50 bg-emerald-950/25 text-emerald-200",
    bar: "bg-emerald-500",
    accent: "text-emerald-200",
  },
];

const DEFAULT_RANK_STYLE = {
  card: "border-[#263b27] bg-[#0b130d]",
  badge: "border-[#2b3d2b] bg-[#101711] text-[#a9c7ad]",
  bar: "bg-emerald-600",
  accent: "text-[#b7d5ba]",
};

export function PlayersView({ players }: PlayersViewProps) {
  const sorted = [...players].sort((a, b) => b.totalPredictions - a.totalPredictions);

  return (
    <section>
      <div className="mb-5 overflow-hidden rounded-lg border border-[#263b27] bg-[#0b130d]">
        <div className="border-b border-[#263b27] bg-[#101911] px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-300" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Tabla de posiciones</p>
              </div>
              <h2 className="text-3xl font-black text-white sm:text-5xl">
                {players.length} <span className="text-[#a9c7ad]">jugadores</span>
              </h2>
              <p className="mt-2 text-base font-bold text-[#8ca58f]">
                Ranking por cantidad de picks guardados.
              </p>
            </div>
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-amber-700/50 bg-amber-950/25">
              <Trophy className="h-8 w-8 text-amber-300" />
            </span>
          </div>
        </div>
      </div>

      {sorted.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((player, index) => {
            const pct = Math.round((player.totalPredictions / TOTAL_MATCHES) * 100);
            const style = RANK_STYLES[index] ?? DEFAULT_RANK_STYLE;

            return (
              <article key={player.key} className={cn("min-w-0 rounded-lg border p-4 transition-all", style.card)}>
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-lg border", style.badge)}>
                      {index === 0 ? <Trophy className="h-5 w-5" /> : <span className="text-base font-black">#{index + 1}</span>}
                    </div>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <UserRound className="h-4 w-4 shrink-0 text-[#8ca58f]" />
                        <p className="truncate text-lg font-black text-white">{player.playerName}</p>
                      </div>
                      <p className="mt-1 text-sm font-bold text-[#8ca58f]">{formatUpdatedAt(player.updatedAt)}</p>
                    </div>
                  </div>
                  <span className={cn("shrink-0 rounded-lg border px-3 py-2 text-base font-black tabular-nums", style.badge)}>
                    {pct}%
                  </span>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full border border-[#263b27] bg-[#070907]">
                  <div className={cn("h-full rounded-full transition-all", style.bar)} style={{ width: `${pct}%` }} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[#263b27] bg-[#101711] px-3 py-3">
                    <p className="text-[11px] font-black uppercase tracking-wider text-[#8ca58f]">Picks</p>
                    <p className={cn("mt-1 text-2xl font-black tabular-nums", style.accent)}>{player.totalPredictions}</p>
                  </div>
                  <div className="rounded-lg border border-[#263b27] bg-[#101711] px-3 py-3">
                    <p className="text-[11px] font-black uppercase tracking-wider text-[#8ca58f]">Cerrados</p>
                    <p className={cn("mt-1 text-2xl font-black tabular-nums", style.accent)}>{player.lockedPredictions}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid min-h-56 place-items-center rounded-lg border border-dashed border-[#2b3d2b] bg-[#0b130d] p-6 text-center sm:p-8">
          <div>
            <Users className="mx-auto h-12 w-12 text-[#8ca58f]" />
            <p className="mt-4 text-xl font-black text-white">Todavia no hay jugadores</p>
            <p className="mt-2 text-base font-bold text-[#8ca58f]">Se el primero en guardar tu quiniela.</p>
          </div>
        </div>
      )}
    </section>
  );
}
