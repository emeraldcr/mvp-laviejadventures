import { TOTAL_MATCHES } from "../constants";
import type { PlayerProgress } from "../types";
import { cn, formatUpdatedAt } from "../utils";

type PlayersViewProps = {
  players: PlayerProgress[];
};

const MEDALS = ["🥇", "🥈", "🥉"];

const RANK_STYLES = [
  {
    card: "border-amber-600/60 bg-[#0f0d08]",
    cardGlow: { boxShadow: "0 0 24px rgba(251,191,36,0.12), inset 0 0 30px rgba(251,191,36,0.02)" },
    badge: "bg-amber-950/60 border border-amber-700/50",
    pct: "bg-amber-950/50 border border-amber-700/40 text-amber-400",
    bar: "bg-amber-400",
    barGlow: { boxShadow: "0 0 8px rgba(251,191,36,0.5)" },
    rank: "border-amber-700/50 bg-amber-950/40",
    statBg: "border-[#2a1e0a] bg-[#0f0d08]",
    statText: "text-amber-300",
  },
  {
    card: "border-slate-500/40 bg-[#0c0d0f]",
    cardGlow: { boxShadow: "0 0 16px rgba(148,163,184,0.06)" },
    badge: "bg-slate-900/60 border border-slate-700/40",
    pct: "bg-slate-900/50 border border-slate-700/40 text-slate-300",
    bar: "bg-slate-400",
    barGlow: undefined,
    rank: "border-slate-700/40 bg-slate-900/40",
    statBg: "border-[#1e2030] bg-[#0c0d0f]",
    statText: "text-slate-300",
  },
  {
    card: "border-orange-900/40 bg-[#0d0c0a]",
    cardGlow: { boxShadow: "0 0 12px rgba(194,120,82,0.06)" },
    badge: "bg-orange-950/40 border border-orange-900/40",
    pct: "bg-orange-950/40 border border-orange-900/30 text-orange-400",
    bar: "bg-orange-600",
    barGlow: undefined,
    rank: "border-orange-900/30 bg-orange-950/30",
    statBg: "border-[#2a1a0a] bg-[#0d0c0a]",
    statText: "text-orange-400",
  },
];

const DEFAULT_RANK_STYLE = {
  card: "border-[#1a2e1a] bg-[#0c160c]",
  cardGlow: undefined,
  badge: "bg-[#080f08] border border-[#1a2e1a]",
  pct: "bg-[#080f08] border border-[#1a2e1a] text-[#6aab6a]",
  bar: "bg-green-600",
  barGlow: undefined,
  rank: "border-[#1a2e1a] bg-[#080f08]",
  statBg: "border-[#1a2e1a] bg-[#080f08]",
  statText: "text-[#6aab6a]",
};

export function PlayersView({ players }: PlayersViewProps) {
  const sorted = [...players].sort((a, b) => b.totalPredictions - a.totalPredictions);

  return (
    <section>
      {/* Leaderboard header */}
      <div
        className="mb-4 overflow-hidden rounded-xl border border-[#1e3a1e] p-4 sm:mb-5 sm:p-6"
        style={{
          background: "linear-gradient(135deg, #060d06 0%, #0a1808 60%, #0c2210 100%)",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#3a5a3a]">Tabla de posiciones</p>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              {players.length}{" "}
              <span className="font-bold text-[#3a5a3a]">jugadores</span>
            </h2>
            <p className="mt-2 text-sm font-bold text-[#3a5a3a]">
              Quien más picks guarda al cierre, gana.
            </p>
          </div>
          <p className="text-6xl leading-none drop-shadow-2xl">🏆</p>
        </div>
      </div>

      {sorted.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((player, index) => {
            const pct = Math.round((player.totalPredictions / TOTAL_MATCHES) * 100);
            const medal = MEDALS[index] ?? null;
            const style = RANK_STYLES[index] ?? DEFAULT_RANK_STYLE;

            return (
              <article
                key={player.key}
                className={cn("min-w-0 rounded-xl border p-3.5 transition-all sm:p-4", style.card)}
                style={style.cardGlow}
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-lg",
                        style.rank
                      )}
                    >
                      {medal ?? (
                        <span className="text-sm font-black text-[#3a5a3a]">#{index + 1}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-white">{player.playerName}</p>
                      <p className="mt-0.5 text-xs font-bold text-[#3a5a3a]">{formatUpdatedAt(player.updatedAt)}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-black",
                      style.pct
                    )}
                  >
                    {pct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#080f08] border border-[#1a2e1a]">
                  <div
                    className={cn("h-full rounded-full transition-all", style.bar)}
                    style={{
                      width: `${pct}%`,
                      ...(style.barGlow ?? {}),
                    }}
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className={cn("rounded-lg border px-3 py-2", style.statBg)}>
                    <p className="text-[10px] font-bold text-[#2a4020] uppercase tracking-wider">Picks</p>
                    <p className={cn("text-sm font-black", style.statText)}>{player.totalPredictions}</p>
                  </div>
                  <div className={cn("rounded-lg border px-3 py-2", style.statBg)}>
                    <p className="text-[10px] font-bold text-[#2a4020] uppercase tracking-wider">Cerrados</p>
                    <p className={cn("text-sm font-black", style.statText)}>{player.lockedPredictions}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-[#1a2e1a] bg-[#080f08] p-5 text-center sm:p-8">
          <div>
            <p className="text-5xl">🏆</p>
            <p className="mt-4 text-base font-black text-[#6aab6a]">Todavía no hay jugadores</p>
            <p className="mt-1 text-sm font-bold text-[#3a5a3a]">Sé el primero en guardar tu quiniela.</p>
          </div>
        </div>
      )}
    </section>
  );
}
