import { Clock3, Loader2, Save, Timer } from "lucide-react";
import type { Draft, MundialMatch } from "../types";
import { formatKickoff, getWinnerPickOptions, isMatchClosed, predictionResult } from "../utils";
import { Flag } from "./Flag";
import { ScoreInput } from "./ScoreInput";

type FeaturedMatchProps = {
  match: MundialMatch;
  draft: Draft;
  savingId: string | null;
  isSavingBulk: boolean;
  nowMs: number;
  activeCountdown?: string;
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

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-emerald-700/60 bg-[#0b130d] shadow-[0_0_24px_rgba(16,185,129,0.10)]">
      <div className="border-b border-[#263b27] bg-[#101911] px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                Partido #{match.number}
              </span>
              <span className="rounded-md border border-[#2c422c] bg-[#071007] px-2 py-0.5 text-xs font-black text-[#a9c7ad]">
                {match.group ? `Grupo ${match.group}` : match.stageLabel}
              </span>
            </div>
            <h2 className="text-2xl font-black leading-tight text-white sm:text-4xl">
              Pone tu marcador
            </h2>
            <p className="mt-1 text-sm font-bold text-[#9db59f]">
              {match.venue ? `${match.venue} - ` : ""}
              {formatKickoff(match.kickoffAt)}
            </p>
          </div>

          {activeCountdown && (
            <div className="rounded-lg border border-amber-600/50 bg-amber-950/30 px-4 py-3 text-left sm:min-w-[190px] sm:text-center">
              <div className="mb-1 flex items-center gap-2 sm:justify-center">
                <Timer className="h-4 w-4 text-amber-300" />
                <p className="text-xs font-black uppercase tracking-widest text-amber-300">Cierra en</p>
              </div>
              <p className="text-3xl font-black tabular-nums leading-none text-amber-200 sm:text-4xl">
                {activeCountdown}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-cyan-900/50 bg-cyan-950/20 px-3 py-2 text-cyan-100">
          <Clock3 className="h-4 w-4 shrink-0 text-cyan-200" />
          <p className="text-sm font-bold">
            El pick se bloquea cuando inicia el partido. Revisa y guarda antes del cierre.
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_2.25rem_minmax(0,1fr)] items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] sm:gap-4">
          <div className="flex min-w-0 flex-col items-center justify-between gap-3 rounded-lg border border-[#2b442c] bg-[#0f190f] px-3 py-4 transition-all focus-within:border-emerald-500 sm:px-5 sm:py-5">
            <div className="flex min-w-0 flex-col items-center gap-2">
              <Flag team={match.homeTeam} size="2xl" />
              <p className="max-w-full break-words text-center text-base font-black uppercase leading-tight text-white sm:text-xl">
                {match.homeTeam}
              </p>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#8ca58f]">Local</p>
            </div>
            <ScoreInput
              label={match.homeTeam}
              value={draft.homeScore}
              disabled={disabled}
              featured
              onChange={(value) => onUpdateDraft(match.id, { homeScore: value })}
            />
          </div>

          <div className="grid place-items-center">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[#314831] bg-[#070907] text-sm font-black text-[#a9c7ad] sm:h-14 sm:w-14 sm:text-lg">
              VS
            </span>
          </div>

          <div className="flex min-w-0 flex-col items-center justify-between gap-3 rounded-lg border border-[#2b442c] bg-[#0f190f] px-3 py-4 transition-all focus-within:border-emerald-500 sm:px-5 sm:py-5">
            <div className="flex min-w-0 flex-col items-center gap-2">
              <Flag team={match.awayTeam} size="2xl" />
              <p className="max-w-full break-words text-center text-base font-black uppercase leading-tight text-white sm:text-xl">
                {match.awayTeam}
              </p>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#8ca58f]">Visita</p>
            </div>
            <ScoreInput
              label={match.awayTeam}
              value={draft.awayScore}
              disabled={disabled}
              featured
              onChange={(value) => onUpdateDraft(match.id, { awayScore: value })}
            />
          </div>
        </div>

        {isKnockoutTie && (
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-amber-300">
              Desempate por penales
            </span>
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
              className="h-12 w-full rounded-lg border border-amber-600/50 bg-[#15110a] px-4 text-base font-black text-amber-200 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-40"
              aria-label={`Ganador por penales del partido ${match.number}`}
            >
              {getWinnerPickOptions(match).map((option) => (
                <option key={option.value || "none"} value={option.value} className="bg-[#0b130d] text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="mt-5 flex flex-col gap-3 rounded-lg border border-[#2b442c] bg-[#101711] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ca58f]">Resultado elegido</p>
            <p className="mt-1 break-words text-2xl font-black text-white sm:text-3xl">
              {predictionResult(match, draft)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onSave(match)}
            disabled={disabled || !draft.dirty}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-emerald-500 bg-emerald-700 px-6 text-base font-black text-white transition-all hover:border-emerald-200 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:border-[#273527] disabled:bg-[#111811] disabled:text-[#687a68] sm:w-auto sm:min-w-[11rem]"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Guardar pick
          </button>
        </div>
      </div>
    </section>
  );
}
