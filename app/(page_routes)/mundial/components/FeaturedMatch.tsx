import { Loader2, Save } from "lucide-react";
import type { Draft, MundialMatch } from "../types";
import { formatKickoff, getCountryFlag, getWinnerPickOptions, isMatchClosed, predictionResult } from "../utils";
import { ScoreInput } from "./ScoreInput";

type FeaturedMatchProps = {
  match: MundialMatch;
  draft: Draft;
  savingId: string | null;
  isSavingBulk: boolean;
  nowMs: number;
  activeCountdown: string;
  onUpdateDraft: (matchId: string, patch: Partial<Draft>) => void;
  onSave: (match: MundialMatch) => Promise<void>;
};

export function FeaturedMatch({
  match,
  draft,
  savingId,
  isSavingBulk,
  nowMs,
  activeCountdown,
  onUpdateDraft,
  onSave,
}: FeaturedMatchProps) {
  const canEdit = !isMatchClosed(match, nowMs);
  const isSaving = savingId === match.id;
  const disabled = !canEdit || isSaving || isSavingBulk;
  const isKnockoutTie = match.stage !== "group" && draft.homeScore === draft.awayScore;

  const homeFlag = getCountryFlag(match.homeTeam);
  const awayFlag = getCountryFlag(match.awayTeam);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      {/* Match header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#070d16] via-[#0c1628] to-[#1a2e48]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-emerald-500/5 to-transparent" />
        </div>

        <div className="relative px-4 py-4 sm:px-6 sm:py-5">
          {/* Status + countdown in the same row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Partido abierto
              </span>
            </div>
            <div className="shrink-0 rounded-lg border border-amber-400/25 bg-amber-400/10 px-2.5 py-1.5 text-center sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-right">
              <p className="hidden text-[9px] font-black uppercase tracking-widest text-amber-300/60 sm:block">
                Cierra en
              </p>
              <p className="text-sm font-black tabular-nums text-amber-300 sm:mt-0.5 sm:text-xl">
                {activeCountdown}
              </p>
              <p className="hidden text-[10px] font-bold text-slate-500 sm:block">
                {formatKickoff(match.kickoffAt)}
              </p>
            </div>
          </div>

          {/* Team names full-width below */}
          <div className="mt-3 sm:mt-4">
            <h2 className="text-base font-black leading-snug text-white sm:text-2xl">
              {match.homeTeam} vs {match.awayTeam}
            </h2>
            <p className="mt-1 truncate text-xs font-bold text-slate-400">
              #{match.number} · {match.group ? `Grupo ${match.group}` : match.stageLabel}
              <span className="hidden sm:inline"> · {match.venue}</span>
            </p>
            <p className="mt-0.5 text-[10px] font-bold text-slate-500 sm:hidden">
              {formatKickoff(match.kickoffAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Score inputs — always 3 columns: home | VS | away */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-[1fr_40px_1fr] items-center gap-2 sm:grid-cols-[1fr_52px_1fr] sm:gap-3">
          {/* Home */}
          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-2 py-3 transition-colors focus-within:border-emerald-400 focus-within:bg-white sm:px-3">
            <span className="text-3xl leading-none sm:text-4xl" aria-hidden="true">{homeFlag}</span>
            <p className="text-center text-[11px] font-black leading-tight text-slate-500 uppercase tracking-wide">
              Local
            </p>
            <p className="text-center text-xs font-black leading-tight text-slate-900 sm:text-sm">
              {match.homeTeam}
            </p>
            <ScoreInput
              label={match.homeTeam}
              value={draft.homeScore}
              disabled={disabled}
              featured
              onChange={(value) => onUpdateDraft(match.id, { homeScore: value })}
            />
          </div>

          {/* VS */}
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-xs font-black text-slate-400">VS</span>
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-2 py-3 transition-colors focus-within:border-emerald-400 focus-within:bg-white sm:px-3">
            <span className="text-3xl leading-none sm:text-4xl" aria-hidden="true">{awayFlag}</span>
            <p className="text-center text-[11px] font-black leading-tight text-slate-500 uppercase tracking-wide">
              Visita
            </p>
            <p className="text-center text-xs font-black leading-tight text-slate-900 sm:text-sm">
              {match.awayTeam}
            </p>
            <ScoreInput
              label={match.awayTeam}
              value={draft.awayScore}
              disabled={disabled}
              featured
              onChange={(value) => onUpdateDraft(match.id, { awayScore: value })}
            />
          </div>
        </div>

        {/* Penalty tiebreaker */}
        {isKnockoutTie && (
          <select
            value={draft.winnerPick ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onUpdateDraft(match.id, {
                winnerPick:
                  event.target.value === "home" || event.target.value === "away"
                    ? event.target.value
                    : null,
              })
            }
            className="mt-3 h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-black text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400"
            aria-label={`Ganador por penales del partido ${match.number}`}
          >
            {getWinnerPickOptions(match).map((option) => (
              <option key={option.value || "none"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Save bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Tu predicción
            </p>
            <p className="mt-0.5 truncate text-base font-black text-slate-950 sm:text-lg">
              {predictionResult(match, draft)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onSave(match)}
            disabled={disabled || !draft.dirty}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 sm:h-11"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar pick
          </button>
        </div>
      </div>
    </section>
  );
}
