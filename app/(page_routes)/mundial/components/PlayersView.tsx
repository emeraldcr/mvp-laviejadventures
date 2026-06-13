import { TOTAL_MATCHES } from "../constants";
import type { PlayerProgress } from "../types";
import { cn, formatUpdatedAt } from "../utils";

type PlayersViewProps = {
  players: PlayerProgress[];
};

const MEDALS = ["🥇", "🥈", "🥉"];

export function PlayersView({ players }: PlayersViewProps) {
  const sorted = [...players].sort((a, b) => b.totalPredictions - a.totalPredictions);

  return (
    <section>
      {/* Leaderboard header */}
      <div className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d1b2a] to-[#1a2e48] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Tabla de posiciones</p>
            <h2 className="mt-1 text-3xl font-black text-white">
              {players.length} <span className="font-bold text-slate-400">jugadores</span>
            </h2>
            <p className="mt-2 text-sm font-bold text-slate-400">
              Quien más picks guarda al cierre, gana.
            </p>
          </div>
          <p className="text-6xl leading-none">🏆</p>
        </div>
      </div>

      {sorted.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sorted.map((player, index) => {
            const pct = Math.round((player.totalPredictions / TOTAL_MATCHES) * 100);
            const medal = MEDALS[index] ?? null;
            const isFirst = index === 0;

            return (
              <article
                key={player.key}
                className={cn(
                  "rounded-xl border bg-white p-4 shadow-sm",
                  isFirst
                    ? "border-amber-300 ring-2 ring-amber-100"
                    : index === 1
                      ? "border-slate-300 ring-1 ring-slate-100"
                      : "border-slate-200"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg",
                        isFirst ? "bg-amber-50" : "bg-slate-100"
                      )}
                    >
                      {medal ?? (
                        <span className="text-sm font-black text-slate-500">#{index + 1}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-slate-950">{player.playerName}</p>
                      <p className="mt-0.5 text-xs font-bold text-slate-400">{formatUpdatedAt(player.updatedAt)}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-black",
                      isFirst ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                    )}
                  >
                    {pct}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isFirst ? "bg-amber-400" : "bg-emerald-500"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-xs font-bold text-slate-400">Picks</p>
                    <p className="text-sm font-black text-slate-900">{player.totalPredictions}</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-xs font-bold text-slate-400">Cerrados</p>
                    <p className="text-sm font-black text-slate-900">{player.lockedPredictions}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <div>
            <p className="text-5xl">🏆</p>
            <p className="mt-4 text-base font-black text-slate-700">Todavía no hay jugadores</p>
            <p className="mt-1 text-sm font-bold text-slate-400">Sé el primero en guardar tu quiniela.</p>
          </div>
        </div>
      )}
    </section>
  );
}
