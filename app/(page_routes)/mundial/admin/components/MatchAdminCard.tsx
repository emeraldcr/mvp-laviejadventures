"use client";

import { useState } from "react";
import { Check, Loader2, Lock, LockOpen, Save, Users } from "lucide-react";
import type { AdminMatch } from "../adminTypes";
import { cn, formatKickoff } from "../../utils";

type MatchAdminCardProps = {
  match: AdminMatch;
  onPatch: (matchId: string, patch: Record<string, unknown>) => Promise<void>;
};

export function MatchAdminCard({ match, onPatch }: MatchAdminCardProps) {
  const [homeScore, setHomeScore] = useState<string>(
    match.homeFinalScore !== null ? String(match.homeFinalScore) : ""
  );
  const [awayScore, setAwayScore] = useState<string>(
    match.awayFinalScore !== null ? String(match.awayFinalScore) : ""
  );
  const [actualWinner, setActualWinner] = useState<"home" | "away" | "">(
    match.actualWinner ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingClose, setIsTogglingClose] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isKnockout = match.stage !== "group";
  const parsedHome = homeScore === "" ? null : Number(homeScore);
  const parsedAway = awayScore === "" ? null : Number(awayScore);
  const isTied = parsedHome !== null && parsedAway !== null && parsedHome === parsedAway;
  const needsWinner = isKnockout && isTied;

  async function handleSaveScore() {
    setError("");
    setSaved(false);

    const patch: Record<string, unknown> = {
      homeFinalScore: parsedHome,
      awayFinalScore: parsedAway,
    };

    if (isKnockout) {
      patch.actualWinner = actualWinner === "home" || actualWinner === "away" ? actualWinner : null;
    }

    setIsSaving(true);
    try {
      await onPatch(match.id, patch);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleClose() {
    setError("");
    setIsTogglingClose(true);
    try {
      await onPatch(match.id, { forceClosed: !match.forceClosed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setIsTogglingClose(false);
    }
  }

  return (
    <article className={cn(
      "rounded-lg border bg-white p-4 shadow-sm",
      match.forceClosed ? "border-slate-300" : match.closed ? "border-slate-200" : "border-emerald-300"
    )}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-950 px-2 py-1 text-xs font-black tabular-nums text-white">
              #{match.number}
            </span>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-600">
              {match.group ? `Grupo ${match.group}` : match.stageLabel}
            </span>
            {match.predictorCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                <Users className="h-3 w-3" />
                {match.predictorCount}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-xs font-bold text-slate-500">
            {formatKickoff(match.kickoffAt)} · {match.venue}
          </p>
        </div>
        <span className={cn(
          "shrink-0 rounded-lg border px-2 py-1 text-xs font-black",
          match.forceClosed
            ? "border-slate-300 bg-slate-100 text-slate-600"
            : match.closed
              ? "border-slate-200 bg-slate-50 text-slate-500"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
        )}>
          {match.forceClosed ? "Forzado" : match.closed ? "Cerrado" : "Abierto"}
        </span>
      </div>

      {/* Teams */}
      <div className="mb-4 font-black text-slate-950">
        <span className="truncate">{match.homeTeam}</span>
        <span className="mx-2 font-bold text-slate-400">vs</span>
        <span className="truncate">{match.awayTeam}</span>
      </div>

      {/* Score inputs */}
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)] items-center gap-2">
        <div className="grid gap-1">
          <label className="text-xs font-black uppercase text-slate-500">
            {match.homeTeam}
          </label>
          <input
            type="number"
            min={0}
            max={30}
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            placeholder="—"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white text-center font-black tabular-nums text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          />
        </div>
        <p className="mt-5 text-center text-sm font-black text-slate-400">-</p>
        <div className="grid gap-1">
          <label className="text-xs font-black uppercase text-slate-500">
            {match.awayTeam}
          </label>
          <input
            type="number"
            min={0}
            max={30}
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            placeholder="—"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white text-center font-black tabular-nums text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Knockout winner pick */}
      {isKnockout && (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-black uppercase text-slate-500">
            {needsWinner ? "Pasa (requerido — empate)" : "Pasa (opcional)"}
          </label>
          <select
            value={actualWinner}
            onChange={(e) => setActualWinner(e.target.value as "home" | "away" | "")}
            className={cn(
              "h-10 w-full rounded-lg border bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100",
              needsWinner ? "border-amber-400" : "border-slate-300"
            )}
          >
            <option value="">Sin definir</option>
            <option value="home">{match.homeTeam}</option>
            <option value="away">{match.awayTeam}</option>
          </select>
        </div>
      )}

      {error && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void handleSaveScore()}
          disabled={isSaving}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-3 py-2 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? "Guardado" : "Guardar resultado"}
        </button>

        <button
          type="button"
          onClick={() => void handleToggleClose()}
          disabled={isTogglingClose}
          title={match.forceClosed ? "Reabrir partido" : "Forzar cierre"}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-black transition disabled:opacity-50",
            match.forceClosed
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          )}
        >
          {isTogglingClose ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : match.forceClosed ? (
            <LockOpen className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </button>
      </div>
    </article>
  );
}
