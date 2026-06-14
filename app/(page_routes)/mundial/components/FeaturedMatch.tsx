import { Loader2, Save, Timer } from "lucide-react";
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
    <section
      className="overflow-hidden rounded-xl border border-green-700/50 bg-[#080f08]"
      style={{ boxShadow: "0 0 30px rgba(34,197,94,0.10), 0 0 0 1px rgba(34,197,94,0.06)" }}
    >
      {/* Banner header — hidden on mobile (hero already shows teams + countdown) */}
      <div
        className="relative hidden overflow-hidden sm:block"
        style={{ background: "linear-gradient(135deg, #050d05 0%, #0a1a0a 50%, #0d2010 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-32 w-32 rounded-full bg-green-500/5 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-32 w-32 rounded-full bg-green-600/5 blur-3xl" />
        </div>

        <div className="relative px-6 py-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">
                Partido #{match.number}
                {match.group ? ` · Grupo ${match.group}` : ` · ${match.stageLabel}`}
              </span>
            </div>
            <div
              className="shrink-0 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-center"
              style={{ boxShadow: "0 0 12px rgba(245,158,11,0.12)" }}
            >
              <div className="flex items-center gap-1.5">
                <Timer className="h-3 w-3 text-amber-500/60" />
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Cierra en</p>
              </div>
              <p className="mt-0.5 text-2xl font-black tabular-nums text-amber-400 leading-none">
                {activeCountdown}
              </p>
              <p className="mt-1 text-[10px] font-bold text-[#3a5a3a]">{formatKickoff(match.kickoffAt)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 flex-col items-center gap-2">
              <span className="text-6xl leading-none drop-shadow-lg" aria-hidden="true">{homeFlag}</span>
              <span className="text-center text-sm font-black uppercase tracking-wide text-[#d4f0d4]">{match.homeTeam}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2a4020]">Local</span>
            </div>
            <span className="text-2xl font-black text-[#1a3a1a]">VS</span>
            <div className="flex flex-1 flex-col items-center gap-2">
              <span className="text-6xl leading-none drop-shadow-lg" aria-hidden="true">{awayFlag}</span>
              <span className="text-center text-sm font-black uppercase tracking-wide text-[#d4f0d4]">{match.awayTeam}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2a4020]">Visita</span>
            </div>
          </div>

          {match.venue && (
            <p className="mt-3 text-center text-[11px] font-bold text-[#2a4020]">{match.venue}</p>
          )}
        </div>
      </div>

      {/* Mobile-only compact sub-header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#1a2e1a] px-4 py-2.5 sm:hidden">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" style={{ boxShadow: "0 0 4px rgba(74,222,128,0.8)" }} />
          <span className="text-[10px] font-black uppercase tracking-wider text-green-400">
            Partido #{match.number}{match.group ? ` · Grupo ${match.group}` : ` · ${match.stageLabel}`}
          </span>
        </div>
        <span className="text-[11px] font-black tabular-nums text-amber-400">{activeCountdown}</span>
      </div>

      {/* Score inputs panel */}
      <div className="p-3.5 sm:p-5">
        <p className="mb-3 text-center text-[10px] font-black uppercase tracking-widest text-[#3a5a3a]">
          Tu predicción de marcador
        </p>

        {/* 3-column: home box | separator | away box */}
        <div className="grid grid-cols-[1fr_28px_1fr] items-center gap-2 sm:gap-4">
          {/* Home */}
          <div
            className="flex flex-col items-center gap-2 rounded-xl border border-[#1e3a1e] bg-[#0a1408] px-2.5 py-3 transition-all focus-within:border-green-600/60 sm:gap-3 sm:p-4"
            style={{ boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)" }}
          >
            <span className="text-2xl leading-none sm:text-4xl" aria-hidden="true">{homeFlag}</span>
            <p className="text-center text-[10px] font-black uppercase leading-tight text-[#4a6e4a] sm:text-[11px]">
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

          {/* Separator */}
          <div className="flex items-center justify-center">
            <span className="text-base font-black text-[#1a3020]">—</span>
          </div>

          {/* Away */}
          <div
            className="flex flex-col items-center gap-2 rounded-xl border border-[#1e3a1e] bg-[#0a1408] px-2.5 py-3 transition-all focus-within:border-green-600/60 sm:gap-3 sm:p-4"
            style={{ boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)" }}
          >
            <span className="text-2xl leading-none sm:text-4xl" aria-hidden="true">{awayFlag}</span>
            <p className="text-center text-[10px] font-black uppercase leading-tight text-[#4a6e4a] sm:text-[11px]">
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
            className="mt-3 h-11 w-full rounded-xl border border-amber-700/40 bg-amber-950/20 px-3 text-sm font-black text-amber-300 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-40 appearance-none"
            aria-label={`Ganador por penales del partido ${match.number}`}
          >
            {getWinnerPickOptions(match).map((option) => (
              <option key={option.value || "none"} value={option.value} className="bg-[#0a1408] text-white">
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Save bar */}
        <div className="mt-3 flex flex-col gap-2.5 rounded-xl border border-[#1e3a1e] bg-[#0a1408] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:p-3.5">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#3a5a3a]">Tu predicción</p>
            <p className="mt-0.5 truncate text-base font-black text-[#d4f0d4] sm:text-lg">
              {predictionResult(match, draft)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onSave(match)}
            disabled={disabled || !draft.dirty}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-green-600 bg-green-700 px-6 text-sm font-black text-white transition-all hover:bg-green-500 hover:border-green-400 hover:shadow-[0_0_16px_rgba(34,197,94,0.3)] disabled:cursor-not-allowed disabled:opacity-30 disabled:border-[#1a2e1a] disabled:bg-transparent disabled:shadow-none sm:w-auto sm:shrink-0"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar pick
          </button>
        </div>
      </div>
    </section>
  );
}
