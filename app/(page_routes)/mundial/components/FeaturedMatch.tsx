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
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0d1b2a] to-[#1a2e48]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-emerald-500/5 to-transparent" />
        </div>

        <div className="relative px-5 py-6 sm:px-7">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-black text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Partido abierto — Ingresa tu predicción
          </div>

          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-4">
                <span className="text-6xl leading-none" aria-hidden="true">{homeFlag}</span>
                <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-xs font-black text-slate-500">
                  VS
                </div>
                <span className="text-6xl leading-none" aria-hidden="true">{awayFlag}</span>
              </div>
              <h2 className="mt-4 text-2xl font-black leading-tight text-white sm:text-3xl">
                {match.homeTeam} vs {match.awayTeam}
              </h2>
              <p className="mt-1.5 text-sm font-bold text-slate-400">
                #{match.number} · {match.group ? `Grupo ${match.group}` : match.stageLabel} · {match.venue}
              </p>
            </div>

            {/* Countdown */}
            <div className="shrink-0 rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-right">
              <p className="text-xs font-black uppercase tracking-wider text-amber-300/70">Cierra en</p>
              <p className="mt-1 text-2xl font-black tabular-nums text-amber-300">{activeCountdown}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">{formatKickoff(match.kickoffAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score inputs */}
      <div className="p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] lg:items-start">
          {/* Home team */}
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50/80 p-4 transition-colors focus-within:border-emerald-400 focus-within:bg-white hover:border-slate-300">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-4xl leading-none" aria-hidden="true">{homeFlag}</span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Local</p>
                <p className="text-lg font-black leading-tight text-slate-900">{match.homeTeam}</p>
              </div>
            </div>
            <div className="flex justify-center">
              <ScoreInput
                label={match.homeTeam}
                value={draft.homeScore}
                disabled={disabled}
                featured
                onChange={(value) => onUpdateDraft(match.id, { homeScore: value })}
              />
            </div>
          </div>

          {/* VS divider */}
          <div className="flex items-center justify-center lg:pt-10">
            <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-400">
              VS
            </div>
          </div>

          {/* Away team */}
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50/80 p-4 transition-colors focus-within:border-emerald-400 focus-within:bg-white hover:border-slate-300">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-4xl leading-none" aria-hidden="true">{awayFlag}</span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Visita</p>
                <p className="text-lg font-black leading-tight text-slate-900">{match.awayTeam}</p>
              </div>
            </div>
            <div className="flex justify-center">
              <ScoreInput
                label={match.awayTeam}
                value={draft.awayScore}
                disabled={disabled}
                featured
                onChange={(value) => onUpdateDraft(match.id, { awayScore: value })}
              />
            </div>
          </div>
        </div>

        {/* Penalty tiebreaker */}
        {isKnockoutTie && (
          <select
            value={draft.winnerPick ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onUpdateDraft(match.id, {
                winnerPick: event.target.value === "home" || event.target.value === "away" ? event.target.value : null,
              })
            }
            className="mt-4 h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-black text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500"
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
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Tu predicción</p>
            <p className="mt-1 truncate text-lg font-black text-slate-950">{predictionResult(match, draft)}</p>
          </div>
          <button
            type="button"
            onClick={() => void onSave(match)}
            disabled={disabled || !draft.dirty}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-6 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar pick
          </button>
        </div>
      </div>
    </section>
  );
}
