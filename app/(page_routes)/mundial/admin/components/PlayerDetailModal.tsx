"use client";

import { useEffect, useState } from "react";
import { Loader2, X, Target, TrendingUp, Clock } from "lucide-react";
import { Flag } from "../../components/Flag";
import { cn } from "../../utils";
import type { LeaderboardEntry } from "../adminTypes";

type PlayerMatchDetail = {
  matchId: string;
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  stage: string;
  stageLabel: string;
  homeFinalScore: number | null;
  awayFinalScore: number | null;
  predictedHome: number;
  predictedAway: number;
  winnerPick: "home" | "away" | null;
  points: number | null;
  isExact: boolean;
  correctOutcome: boolean;
  closed: boolean;
};

type PlayerDetailResponse = {
  playerName: string;
  predictions: PlayerMatchDetail[];
};

type Props = {
  entry: LeaderboardEntry;
  onClose: () => void;
};

function PointsBadge({ match }: { match: PlayerMatchDetail }) {
  if (!match.closed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-black text-slate-400">
        <Clock className="h-3 w-3" />
        Pendiente
      </span>
    );
  }
  if (match.homeFinalScore === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-black text-slate-400">
        Sin resultado
      </span>
    );
  }
  if (match.points === null) return null;

  if (match.isExact) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-black text-emerald-700">
        <Target className="h-3 w-3" />
        Exacto · {match.points}pts
      </span>
    );
  }
  if (match.correctOutcome) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-black text-sky-700">
        <TrendingUp className="h-3 w-3" />
        Resultado · {match.points}pts
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-xs font-black text-red-500">
      Incorrecto · 0pts
    </span>
  );
}

export function PlayerDetailModal({ entry, onClose }: Props) {
  const [data, setData] = useState<PlayerDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/mundial/admin/player?name=${encodeURIComponent(entry.normalizedName)}`);
        if (!res.ok) throw new Error();
        setData(await res.json());
      } catch {
        setError("No se pudo cargar el detalle del jugador.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [entry.normalizedName]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const predictions = data?.predictions ?? [];
  const scored = predictions.filter((p) => p.points !== null);
  const totalPts = scored.reduce((sum, p) => sum + (p.points ?? 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-2 pb-2 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[88vh]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detalle de jugador</p>
            <h2 className="truncate text-xl font-black leading-tight text-slate-950">
              {entry.playerName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Summary chips */}
        <div className="shrink-0 flex flex-wrap gap-2 border-b border-slate-100 px-5 py-3">
          <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">
            {entry.totalPoints} pts totales
          </span>
          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            {entry.exactScores} exactos
          </span>
          <span className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">
            {entry.correctOutcomes} resultados
          </span>
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-500">
            {entry.scoredPredictions}/{entry.totalPredictions} jugados
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="grid min-h-48 place-items-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-sm font-bold text-red-600">{error}</div>
          ) : predictions.length === 0 ? (
            <div className="grid min-h-48 place-items-center p-8">
              <p className="text-sm font-black text-slate-400">Sin predicciones registradas.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {predictions.map((match) => {
                const hasResult = match.homeFinalScore !== null;
                return (
                  <li key={match.matchId} className={cn(
                    "px-5 py-4",
                    match.isExact && "bg-emerald-50/40",
                    match.correctOutcome && !match.isExact && "bg-sky-50/30",
                    !match.closed && "bg-white"
                  )}>
                    {/* Match label + badge */}
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        #{match.matchNumber} · {match.stageLabel}
                      </span>
                      <PointsBadge match={match} />
                    </div>

                    {/* Teams + scores */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      {/* Home */}
                      <div className="flex items-center gap-2 min-w-0">
                        <Flag team={match.homeTeam} size="sm" className="shrink-0 rounded-sm" />
                        <span className="truncate text-sm font-black text-slate-800">{match.homeTeam}</span>
                      </div>

                      {/* Scores */}
                      <div className="flex flex-col items-center gap-0.5">
                        {/* Final score */}
                        {hasResult ? (
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "w-7 text-center text-base font-black tabular-nums",
                              match.isExact ? "text-emerald-700" : match.correctOutcome ? "text-sky-700" : "text-slate-900"
                            )}>
                              {match.homeFinalScore}
                            </span>
                            <span className="text-xs font-black text-slate-300">–</span>
                            <span className={cn(
                              "w-7 text-center text-base font-black tabular-nums",
                              match.isExact ? "text-emerald-700" : match.correctOutcome ? "text-sky-700" : "text-slate-900"
                            )}>
                              {match.awayFinalScore}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-black text-slate-300">vs</span>
                        )}
                        {/* Prediction */}
                        <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5">
                          <span className="text-[10px] font-black text-slate-400">pred:</span>
                          <span className="text-[11px] font-black tabular-nums text-slate-600">
                            {match.predictedHome}–{match.predictedAway}
                          </span>
                        </div>
                      </div>

                      {/* Away */}
                      <div className="flex items-center justify-end gap-2 min-w-0">
                        <span className="truncate text-right text-sm font-black text-slate-800">{match.awayTeam}</span>
                        <Flag team={match.awayTeam} size="sm" className="shrink-0 rounded-sm" />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
