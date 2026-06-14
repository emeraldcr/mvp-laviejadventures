"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Loader2, Lock, LockOpen, Save, Users } from "lucide-react";
import type { AdminMatch } from "../adminTypes";
import { cn, formatKickoff, getCountryFlag } from "../../utils";
import { Flag } from "../../components/Flag";

type MatchAdminCardProps = {
  match: AdminMatch;
  onPatch: (matchId: string, patch: Record<string, unknown>) => Promise<void>;
};

function StatBar({
  label,
  count,
  total,
  barColor,
  textColor,
}: {
  label: string;
  count: number;
  total: number;
  barColor: string;
  textColor: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-[11px] font-black uppercase tracking-wide text-white/40">
        {label}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn("w-8 shrink-0 text-right text-xs font-black tabular-nums", textColor)}>
        {count}/{total}
      </span>
      <span className="w-8 shrink-0 text-right text-[11px] font-bold text-white/30">{pct}%</span>
    </div>
  );
}

export function MatchAdminCard({ match, onPatch }: MatchAdminCardProps) {
  const hasResult = match.homeFinalScore !== null && match.awayFinalScore !== null;
  const homeFlag = getCountryFlag(match.homeTeam);
  const awayFlag = getCountryFlag(match.awayTeam);

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
  const [showEdit, setShowEdit] = useState(!hasResult);

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

  const statusLabel = hasResult
    ? `${match.homeFinalScore}–${match.awayFinalScore}`
    : match.forceClosed
      ? "Forzado"
      : match.closed
        ? "Cerrado"
        : "Abierto";

  const statusClass = hasResult
    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
    : match.forceClosed
      ? "border-slate-300 bg-slate-100 text-slate-600"
      : match.closed
        ? "border-slate-200 bg-slate-50 text-slate-500"
        : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-white shadow-sm",
        hasResult
          ? "border-slate-200"
          : match.forceClosed
            ? "border-slate-300"
            : match.closed
              ? "border-slate-200"
              : "border-emerald-300 ring-1 ring-emerald-100"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-lg bg-slate-950 px-2 py-1 text-xs font-black tabular-nums text-white">
              #{match.number}
            </span>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-600">
              {match.group ? `Grupo ${match.group}` : match.stageLabel}
            </span>
            {match.predictorCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                <Users className="h-3 w-3" />
                {match.predictorCount}
              </span>
            )}
          </div>
          <p className="mt-1.5 truncate text-xs font-bold text-slate-400">
            {formatKickoff(match.kickoffAt)}
            {match.venue ? ` · ${match.venue}` : ""}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-lg border px-2.5 py-1 text-xs font-black tabular-nums", statusClass)}>
          {statusLabel}
        </span>
      </div>

      {/* ── SCORED: dark result panel ── */}
      {hasResult ? (
        <div className="mx-4 mb-1 overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800">
          {/* Score display */}
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <Flag team={match.homeTeam} size="lg" />
              <p className="text-center text-[11px] font-black leading-tight text-white/60">
                {match.homeTeam}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <span className="text-4xl font-black tabular-nums leading-none text-white">
                {match.homeFinalScore} – {match.awayFinalScore}
              </span>
              {match.actualWinner && (
                <span className="mt-1 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white/50">
                  Pasa {match.actualWinner === "home" ? match.homeTeam : match.awayTeam}
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <Flag team={match.awayTeam} size="lg" />
              <p className="text-center text-[11px] font-black leading-tight text-white/60">
                {match.awayTeam}
              </p>
            </div>
          </div>

          {/* Prediction stats */}
          {match.predictorCount > 0 && (
            <div className="border-t border-white/10 px-4 pb-4 pt-3">
              <div className="space-y-2">
                <StatBar
                  label="Exacto"
                  count={match.exactCount}
                  total={match.predictorCount}
                  barColor="bg-emerald-500"
                  textColor="text-emerald-400"
                />
                <StatBar
                  label="Resultado"
                  count={match.correctOutcomeCount}
                  total={match.predictorCount}
                  barColor="bg-sky-500"
                  textColor="text-sky-400"
                />
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-white/30">
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/50">
                  {homeFlag} {match.homeWinPicks}
                </span>
                <span>·</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/50">
                  Emp {match.drawPicks}
                </span>
                <span>·</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/50">
                  {awayFlag} {match.awayWinPicks}
                </span>
              </div>
            </div>
          )}

          {match.predictorCount === 0 && (
            <p className="border-t border-white/10 px-4 py-3 text-xs font-bold text-white/30">
              Sin predicciones registradas.
            </p>
          )}
        </div>
      ) : (
        /* UNSCORED: teams line */
        <div className="mx-4 mb-3 flex items-center gap-2">
          <span className="text-xl leading-none" aria-hidden="true">{homeFlag}</span>
          <span className="font-black text-slate-950">{match.homeTeam}</span>
          <span className="font-bold text-slate-300">vs</span>
          <span className="font-black text-slate-950">{match.awayTeam}</span>
          <span className="text-xl leading-none" aria-hidden="true">{awayFlag}</span>
        </div>
      )}

      {/* ── EDIT SECTION ── */}
      <div className={cn("border-t border-slate-100 px-4 pb-4", hasResult ? "pt-0" : "pt-3")}>
        {/* Toggle button for scored matches */}
        {hasResult && (
          <button
            type="button"
            onClick={() => setShowEdit((v) => !v)}
            className="flex w-full items-center justify-between gap-2 py-3 text-xs font-black text-slate-400 transition hover:text-slate-600"
          >
            <span>Editar resultado</span>
            {showEdit ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}

        {showEdit && (
          <>
            {/* Score inputs */}
            <div className="mb-3 grid grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)] items-end gap-2">
              <div className="grid gap-1">
                <label className="truncate text-xs font-black uppercase text-slate-500">
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
              <p className="pb-2.5 text-center text-sm font-black text-slate-300">-</p>
              <div className="grid gap-1">
                <label className="truncate text-xs font-black uppercase text-slate-500">
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

            {/* Knockout winner */}
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
          </>
        )}

        {/* For scored matches with hidden edit form: show lock/unlock always */}
        {hasResult && !showEdit && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void handleToggleClose()}
              disabled={isTogglingClose}
              title={match.forceClosed ? "Reabrir partido" : "Forzar cierre"}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black transition disabled:opacity-50",
                match.forceClosed
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              {isTogglingClose ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : match.forceClosed ? (
                <LockOpen className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              {match.forceClosed ? "Reabrir" : "Forzar cierre"}
            </button>
          </div>
        )}

        {/* Error outside edit form (for lock/unlock errors when form is hidden) */}
        {hasResult && !showEdit && error && (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
