"use client";

import { CalendarDays, CheckCircle2, ChevronRight, Lock, MinusCircle, Target, TrendingUp, Trophy, Users, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { LeaderboardEntry, MundialMatch, Prediction } from "../types";
import { cn, finalScoreText, formatKickoff, normalizeKey, teamCode } from "../utils";
import { Flag } from "./Flag";

type PlayersViewProps = {
  leaderboard: LeaderboardEntry[];
  matches: MundialMatch[];
  predictions: Prediction[];
};

type PredictionScore = {
  points: number | null;
  kind: "exact" | "outcome" | "miss" | "pending";
};

const PODIUM_STYLES = [
  { card: "border-[#d5ff3f]/70 bg-[#10240b]", rank: "bg-[#d5ff3f] text-[#06121c]", pts: "text-[#d5ff3f]", bar: "bg-[#d5ff3f]" },
  { card: "border-[#62ffe6]/60 bg-[#071d2a]", rank: "bg-[#62ffe6] text-[#06121c]", pts: "text-[#62ffe6]", bar: "bg-[#62ffe6]" },
  { card: "border-[#ff6a3d]/60 bg-[#2a120b]", rank: "bg-[#ff6a3d] text-white", pts: "text-[#ffb15f]", bar: "bg-[#ff6a3d]" },
];

export function PlayersView({ leaderboard, matches, predictions }: PlayersViewProps) {
  const [selectedPlayerKey, setSelectedPlayerKey] = useState<string | null>(null);
  const matchById = useMemo(() => new Map(matches.map((match) => [match.id, match])), [matches]);
  const selectedEntry = leaderboard.find((entry) => entry.normalizedName === selectedPlayerKey) ?? null;

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
  const totalExact = leaderboard.reduce((sum, entry) => sum + entry.exactScores, 0);
  const totalOutcome = leaderboard.reduce((sum, entry) => sum + entry.correctOutcomes, 0);
  const totalScored = leaderboard.reduce((sum, entry) => sum + entry.scoredPredictions, 0);
  const leader = leaderboard[0];
  const leaderAccuracy = accuracyPct(leader);

  return (
    <section className="grid gap-4">
      <div className="overflow-hidden rounded-lg border border-[#9dff34]/55 bg-[#06140f] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
        <div className="bg-[#3151ff] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#d5ff3f]" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d5ff3f]">Tabla de posiciones</p>
              </div>
              <h2 className="mt-1 text-2xl font-black uppercase text-white sm:text-3xl">
                {leaderboard.length} <span className="text-white/65">jugadores</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 min-[520px]:grid-cols-4 lg:min-w-[560px]">
              <HeaderStat label="Lider" value={leader.playerName} tone="lime" />
              <HeaderStat label="Precision" value={`${leaderAccuracy}%`} tone="cyan" />
              <HeaderStat label="Exactos" value={totalExact} tone="lime" />
              <HeaderStat label="Resueltos" value={totalScored} tone="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Podium — horizontal scroll on mobile, 3-col grid on sm+ */}
      <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {leaderboard.slice(0, 3).map((entry, i) => {
          const style = PODIUM_STYLES[i];
          const barWidth = maxPts > 0 ? Math.round((entry.totalPoints / maxPts) * 100) : 0;
          const accuracy = accuracyPct(entry);
          const misses = Math.max(entry.scoredPredictions - entry.correctOutcomes, 0);

          return (
            <button
              type="button"
              key={entry.normalizedName}
              onClick={() => setSelectedPlayerKey(entry.normalizedName)}
              className={cn(
                "w-[72vw] shrink-0 rounded-lg border p-3.5 text-left shadow-[0_18px_52px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:ring-2 hover:ring-white/25 sm:w-auto sm:p-4",
                style.card,
                i === 0 && "ring-1 ring-[#d5ff3f]/45"
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className={cn("grid h-9 w-9 place-items-center rounded-lg text-lg font-black sm:h-10 sm:w-10 sm:text-xl", style.rank)}>
                  {i + 1}
                </span>
                <div className="text-right">
                  <span className={cn("text-xl font-black tabular-nums sm:text-2xl", style.pts)}>{entry.totalPoints}</span>
                  <span className="ml-1 text-xs font-bold text-white/55">pts</span>
                </div>
              </div>

              <p className="mb-1 truncate text-sm font-black text-white sm:text-base">{entry.playerName}</p>

              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-black/45">
                <div className={cn("h-full rounded-full", style.bar)} style={{ width: `${barWidth}%` }} />
              </div>

              <div className="grid grid-cols-4 gap-1">
                <MiniStat label="Exact." value={entry.exactScores} tone="lime" />
                <MiniStat label="Res." value={entry.correctOutcomes} tone="cyan" />
                <MiniStat label="Fallo" value={misses} tone="orange" />
                <MiniStat label="Prec." value={`${accuracy}%`} tone="white" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-lg border border-white/15 bg-[#071018] shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/15 bg-[#3151ff] text-xs">
                <th className="px-2 py-2.5 text-left font-black uppercase tracking-wide text-[#d5ff3f] sm:px-3 sm:py-3">#</th>
                <th className="px-2 py-2.5 text-left font-black uppercase tracking-wide text-white sm:px-3 sm:py-3">Jugador</th>
                <th className="px-2 py-2.5 text-right font-black uppercase tracking-wide text-white sm:px-3 sm:py-3">Pts</th>
                <th className="px-2 py-2.5 text-right font-black uppercase tracking-wide text-[#d5ff3f] sm:px-3 sm:py-3">Exact.</th>
                <th className="px-2 py-2.5 text-right font-black uppercase tracking-wide text-[#62ffe6] sm:px-3 sm:py-3">Res.</th>
                <th className="hidden px-3 py-2.5 text-right font-black uppercase tracking-wide text-[#ffb15f] sm:table-cell sm:py-3">Fallos</th>
                <th className="hidden px-3 py-2.5 text-right font-black uppercase tracking-wide text-white/70 md:table-cell sm:py-3">Prec.</th>
                <th className="hidden px-3 py-2.5 text-right font-black uppercase tracking-wide text-white/70 lg:table-cell sm:py-3">Picks</th>
                <th className="px-2 py-2.5 text-right font-black uppercase tracking-wide text-white/70 sm:px-3 sm:py-3">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {leaderboard.map((entry, i) => {
                const isFirst = i === 0;
                const isTied = i > 0 && entry.totalPoints === leaderboard[i - 1].totalPoints;
                const barWidth = maxPts > 0 ? Math.round((entry.totalPoints / maxPts) * 100) : 0;
                const misses = Math.max(entry.scoredPredictions - entry.correctOutcomes, 0);
                const pending = Math.max(entry.totalPredictions - entry.scoredPredictions, 0);

                return (
                  <tr
                    key={entry.normalizedName}
                    onClick={() => setSelectedPlayerKey(entry.normalizedName)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isFirst ? "bg-[#10240b]/65 hover:bg-[#10240b]/90" : "hover:bg-white/5"
                    )}
                  >
                    <td className="px-2 py-2.5 sm:px-3 sm:py-3">
                      <span className={cn("text-sm font-black tabular-nums", isTied ? "text-white/50" : "text-white")}>
                        {isTied ? "=" : i + 1}
                      </span>
                    </td>

                    <td className="px-2 py-2.5 sm:px-3 sm:py-3">
                      <div className="min-w-0">
                        <p className={cn("text-sm font-black sm:text-base", isFirst ? "text-[#d5ff3f]" : "text-white")}>
                          {entry.playerName}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 sm:mt-1 sm:gap-2">
                          <div className="h-1 w-14 overflow-hidden rounded-full bg-black/55 sm:w-20">
                            <div
                              className={cn("h-full rounded-full", isFirst ? "bg-[#d5ff3f]" : "bg-[#62ffe6]")}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          {pending > 0 && <span className="text-[9px] font-black text-white/45 sm:text-[10px]">{pending} pend.</span>}
                        </div>
                      </div>
                    </td>

                    <td className="px-2 py-2.5 text-right sm:px-3 sm:py-3">
                      <span className={cn("text-base font-black tabular-nums", isFirst ? "text-[#d5ff3f]" : "text-white")}>
                        {entry.totalPoints}
                      </span>
                    </td>

                    <td className="px-2 py-2.5 text-right sm:px-3 sm:py-3">
                      <span className={cn("font-black tabular-nums", entry.exactScores > 0 ? "text-[#d5ff3f]" : "text-white/25")}>
                        {entry.exactScores}
                      </span>
                    </td>

                    <td className="px-2 py-2.5 text-right sm:px-3 sm:py-3">
                      <span className={cn("font-black tabular-nums", entry.correctOutcomes > 0 ? "text-[#62ffe6]" : "text-white/25")}>
                        {entry.correctOutcomes}
                      </span>
                    </td>

                    <td className="hidden px-3 py-2.5 text-right sm:table-cell sm:py-3">
                      <span className={cn("font-black tabular-nums", misses > 0 ? "text-[#ffb15f]" : "text-white/25")}>
                        {misses}
                      </span>
                    </td>

                    <td className="hidden px-3 py-2.5 text-right md:table-cell sm:py-3">
                      <span className="text-xs font-black tabular-nums text-white/70">{accuracyPct(entry)}%</span>
                    </td>

                    <td className="hidden px-3 py-2.5 text-right lg:table-cell sm:py-3">
                      <span className="text-xs font-bold tabular-nums text-white/55">
                        {entry.scoredPredictions}/{entry.totalPredictions}
                      </span>
                    </td>

                    <td className="px-2 py-2.5 text-right sm:px-3 sm:py-3">
                      <ChevronRight className="ml-auto h-4 w-4 text-white/45" />
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
            <span>{totalOutcome} resultados acertados entre todos</span>
          </div>
        </div>
      </div>

      <StatBetsLeaderboard />

      {selectedEntry && (
        <PlayerPredictionsModal
          entry={selectedEntry}
          predictions={predictions.filter((prediction) => normalizeKey(prediction.playerName) === selectedEntry.normalizedName)}
          matchById={matchById}
          onClose={() => setSelectedPlayerKey(null)}
        />
      )}
    </section>
  );
}

type GlobalStatBetEntry = { playerName: string; earned: number; total: number };

function StatBetsLeaderboard() {
  const [entries, setEntries] = useState<GlobalStatBetEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/mundial/stat-bets?global=true")
      .then((r) => (r.ok ? r.json() : { leaderboard: [] }))
      .then((data) => {
        setEntries(data.leaderboard ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || !entries.length) return null;

  const max = Math.max(...entries.map((e) => e.earned), 1);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="overflow-hidden rounded-lg border border-[#f0b429]/25 bg-[#071018] shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
      <div className="border-b border-white/8 bg-gradient-to-r from-[#1a1030] to-[#0e1520] px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#f0b429]" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0b429]">Mini-Apuestas</p>
        </div>
        <p className="mt-0.5 text-sm font-black text-white">
          Tabla comparativa · {entries.length} jugadores
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-black/35 text-xs">
              <th className="px-3 py-2.5 text-left font-black uppercase tracking-wide text-white/40">#</th>
              <th className="px-3 py-2.5 text-left font-black uppercase tracking-wide text-white">Jugador</th>
              <th className="px-3 py-2.5 text-right font-black uppercase tracking-wide text-[#f0b429]">Pts ganados</th>
              <th className="px-3 py-2.5 text-right font-black uppercase tracking-wide text-white/50">Apostadas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {entries.map((entry, i) => {
              const barWidth = max > 0 ? Math.round((entry.earned / max) * 100) : 0;
              const isFirst = i === 0;
              return (
                <tr key={entry.playerName} className={cn(isFirst ? "bg-[#f0b429]/5" : "hover:bg-white/3", "transition-colors")}>
                  <td className="px-3 py-2.5">
                    {medals[i] ? (
                      <span className="text-base leading-none">{medals[i]}</span>
                    ) : (
                      <span className="text-xs font-black text-white/30">{i + 1}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <p className={cn("font-black", isFirst ? "text-[#f0b429]" : "text-white")}>
                      {entry.playerName}
                    </p>
                    <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-black/55">
                      <div
                        className={cn("h-full rounded-full", isFirst ? "bg-[#f0b429]" : "bg-emerald-500/50")}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={cn(
                      "font-black tabular-nums",
                      entry.earned > 0 ? (isFirst ? "text-[#f0b429]" : "text-emerald-400") : "text-white/25"
                    )}>
                      {entry.earned}
                    </span>
                    <span className="ml-0.5 text-[10px] text-white/30">pts</span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs font-bold tabular-nums text-white/40">{entry.total}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayerPredictionsModal({
  entry,
  predictions,
  matchById,
  onClose,
}: {
  entry: LeaderboardEntry;
  predictions: Prediction[];
  matchById: Map<string, MundialMatch>;
  onClose: () => void;
}) {
  const sortedPredictions = [...predictions].sort((a, b) => {
    const aMatch = matchById.get(a.matchId);
    const bMatch = matchById.get(b.matchId);
    return (bMatch?.sortOrder ?? -1) - (aMatch?.sortOrder ?? -1) || (b.matchNumber ?? -1) - (a.matchNumber ?? -1);
  });
  const scored = sortedPredictions
    .map((prediction) => computePredictionScore(matchById.get(prediction.matchId), prediction))
    .filter((score) => score.points !== null);
  const modalPoints = scored.reduce((sum, score) => sum + (score.points ?? 0), 0);
  const hiddenCount = Math.max(entry.totalPredictions - sortedPredictions.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-2 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-[#62ffe6]/45 bg-[#071018] shadow-[0_24px_90px_rgba(0,0,0,0.85)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/15 bg-[#3151ff] px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-black uppercase text-white">{entry.playerName}</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#d5ff3f]">
              {modalPoints} pts visibles / {entry.totalPredictions} picks / {accuracyPct(entry)}% precision
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle de jugador"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/20 bg-black/20 text-white/75 transition hover:border-[#d5ff3f] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-1.5 border-b border-white/10 bg-black/25 p-3 sm:grid-cols-5 sm:gap-2">
          <MiniStat label="Total" value={entry.totalPoints} tone="lime" />
          <MiniStat label="Exactos" value={entry.exactScores} tone="lime" />
          <MiniStat label="Result." value={entry.correctOutcomes} tone="cyan" />
          <MiniStat label="Fallos" value={Math.max(entry.scoredPredictions - entry.correctOutcomes, 0)} tone="orange" />
          <MiniStat label="Jugados" value={`${entry.scoredPredictions}/${entry.totalPredictions}`} tone="white" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {hiddenCount > 0 && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-[#f0b429]/30 bg-[#1a2206]/55 px-3 py-2.5 text-sm font-bold text-[#fff1b8]">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#f0b429]" />
              <p>
                {hiddenCount} {hiddenCount === 1 ? "pick esta oculto" : "picks estan ocultos"} hasta que guardes tu prediccion en esos partidos.
              </p>
            </div>
          )}

          {sortedPredictions.length ? (
            <div className="grid gap-2">
              {sortedPredictions.map((prediction) => {
                const match = matchById.get(prediction.matchId);
                const score = computePredictionScore(match, prediction);

                return (
                  <PredictionRow
                    key={prediction.id}
                    prediction={prediction}
                    match={match}
                    score={score}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-white/20 bg-black/35 p-6 text-center">
              {hiddenCount > 0 ? (
                <>
                  <Lock className="mx-auto h-10 w-10 text-[#f0b429]" />
                  <p className="mt-3 text-lg font-black text-white">Picks ocultos</p>
                  <p className="mt-2 text-sm font-bold text-white/55">
                    Guardá tu predicción en un partido para ver qué puso este jugador ahí.
                  </p>
                </>
              ) : (
                <>
                  <Users className="mx-auto h-10 w-10 text-[#62ffe6]" />
                  <p className="mt-3 text-lg font-black text-white">Sin predicciones guardadas</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PredictionRow({
  prediction,
  match,
  score,
}: {
  prediction: Prediction;
  match?: MundialMatch;
  score: PredictionScore;
}) {
  const status = score.kind;
  const statusClass =
    status === "exact"
      ? "border-[#d5ff3f]/60 bg-[#1a2206] text-[#d5ff3f]"
      : status === "outcome"
        ? "border-[#62ffe6]/60 bg-[#071d2a] text-[#62ffe6]"
        : status === "miss"
          ? "border-[#ff6a3d]/60 bg-[#2a120b] text-[#ffb15f]"
          : "border-white/15 bg-white/5 text-white/55";
  const statusLabel =
    status === "exact" ? "Exacto" : status === "outcome" ? "Resultado" : status === "miss" ? "Fallo" : "Pendiente";

  return (
    <article className="grid gap-3 rounded-lg border border-white/10 bg-black/35 p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-white/15 bg-black/35 px-2 py-1 text-xs font-black text-white">
            #{match?.number ?? prediction.matchNumber ?? "?"}
          </span>
          {match && (
            <span className="rounded-md border border-white/15 bg-black/35 px-2 py-1 text-xs font-black text-white/60">
              {match.group ? `Grupo ${match.group}` : match.stageLabel}
            </span>
          )}
          {match && (
            <span className="inline-flex min-w-0 items-center gap-1 text-xs font-bold text-white/55">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{formatKickoff(match.kickoffAt)}</span>
            </span>
          )}
        </div>

        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
          {match ? (
            <>
              <TeamChip team={match.homeTeam} />
              <span className="text-xs font-black text-white/45">VS</span>
              <TeamChip team={match.awayTeam} />
            </>
          ) : (
            <p className="font-black text-white">Partido no encontrado</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <span className="rounded-md border border-[#62ffe6]/45 bg-[#071d2a] px-3 py-2 text-sm font-black tabular-nums text-[#62ffe6]">
          Pick {prediction.homeScore}-{prediction.awayScore}
        </span>
        {prediction.winnerPick && match && (
          <span className="rounded-md border border-[#d5ff3f]/45 bg-[#1a2206] px-2 py-1 text-xs font-black text-[#d5ff3f]">
            pen. {prediction.winnerPick === "home" ? teamCode(match.homeTeam) : teamCode(match.awayTeam)}
          </span>
        )}
        <span className="rounded-md border border-white/15 bg-black/35 px-3 py-2 text-sm font-black text-white">
          {match ? finalScoreText(match) : "Resultado pendiente"}
        </span>
        <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-black", statusClass)}>
          {status === "exact" ? <Target className="h-3.5 w-3.5" /> : status === "outcome" ? <CheckCircle2 className="h-3.5 w-3.5" /> : status === "miss" ? <MinusCircle className="h-3.5 w-3.5" /> : null}
          {statusLabel}
          {score.points !== null && <span className="tabular-nums">+{score.points}</span>}
        </span>
      </div>
    </article>
  );
}

function HeaderStat({ label, value, tone }: { label: string; value: number | string; tone: "lime" | "cyan" | "white" }) {
  const color = tone === "lime" ? "text-[#d5ff3f]" : tone === "cyan" ? "text-[#62ffe6]" : "text-white";
  return (
    <div className="rounded-lg border border-white/15 bg-black/25 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-wider text-white/55">{label}</p>
      <p className={cn("mt-0.5 truncate text-sm font-black", color)}>{value}</p>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number | string; tone: "lime" | "cyan" | "orange" | "white" }) {
  const textClass =
    tone === "lime" ? "text-[#d5ff3f]" : tone === "cyan" ? "text-[#62ffe6]" : tone === "orange" ? "text-[#ffb15f]" : "text-white";

  return (
    <div className="rounded-md border border-white/10 bg-black/45 px-2 py-1.5 text-center">
      <p className="text-[10px] font-black uppercase tracking-wider text-white/55">{label}</p>
      <p className={cn("text-sm font-black", textClass)}>{value}</p>
    </div>
  );
}

function TeamChip({ team }: { team: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-[#3151ff] px-2 py-1">
      <Flag team={team} size="xs" />
      <span className="text-xs font-black text-white">{teamCode(team)}</span>
      <span className="hidden max-w-28 truncate text-xs font-bold text-white/70 sm:inline">{team}</span>
    </span>
  );
}

function accuracyPct(entry: LeaderboardEntry) {
  return entry.scoredPredictions > 0 ? Math.round((entry.correctOutcomes / entry.scoredPredictions) * 100) : 0;
}

function computePredictionScore(match: MundialMatch | undefined, prediction: Prediction): PredictionScore {
  if (!match || match.homeFinalScore === null || match.awayFinalScore === null) {
    return { points: null, kind: "pending" };
  }

  const isExact = prediction.homeScore === match.homeFinalScore && prediction.awayScore === match.awayFinalScore;
  const actualOutcome = getOutcome(match.homeFinalScore, match.awayFinalScore);
  const predictedOutcome = getOutcome(prediction.homeScore, prediction.awayScore);
  const correctOutcome = actualOutcome === predictedOutcome;

  if (isExact) return { points: 3, kind: "exact" };
  if (correctOutcome) return { points: 1, kind: "outcome" };
  return { points: 0, kind: "miss" };
}

function getOutcome(home: number, away: number) {
  if (home > away) return "home";
  if (away > home) return "away";
  return "draw";
}
