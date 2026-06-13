import { Loader2, Save } from "lucide-react";
import type { Draft, MundialMatch } from "../types";
import { cn, finalScoreText, formatKickoff, formatUpdatedAt, getCountryFlag, getWinnerPickOptions, isMatchClosed, predictionResult } from "../utils";
import { ScoreInput } from "./ScoreInput";

type MatchStatus = { label: string; className: string };

function getMatchStatus(draft: Draft, canEdit: boolean, closed: boolean): MatchStatus {
  if (closed) return { label: "Cerrado", className: "border-slate-200 bg-slate-100 text-slate-500" };
  if (canEdit && draft.dirty) return { label: "Editando", className: "border-amber-200 bg-amber-50 text-amber-800" };
  if (canEdit && draft.saved) return { label: "Guardado", className: "border-sky-200 bg-sky-50 text-sky-700" };
  if (canEdit) return { label: "Abierto", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  return { label: "En fila", className: "border-slate-200 bg-slate-50 text-slate-500" };
}

type MatchCardProps = {
  match: MundialMatch;
  draft: Draft;
  savingId: string | null;
  isSavingBulk: boolean;
  activeMatchId: string | null;
  nowMs: number;
  onUpdateDraft: (matchId: string, patch: Partial<Draft>) => void;
  onSave: (match: MundialMatch) => Promise<void>;
};

export function MatchCard({ match, draft, savingId, isSavingBulk, activeMatchId, nowMs, onUpdateDraft, onSave }: MatchCardProps) {
  const closed = isMatchClosed(match, nowMs);
  const canEdit = match.id === activeMatchId && !closed;
  const isSaving = savingId === match.id;
  const disabled = !canEdit || isSaving || isSavingBulk;
  const isKnockoutTie = match.stage !== "group" && draft.homeScore === draft.awayScore;
  const status = getMatchStatus(draft, canEdit, closed);

  const homeFlag = getCountryFlag(match.homeTeam);
  const awayFlag = getCountryFlag(match.awayTeam);

  return (
    <article
      className={cn(
        "rounded-xl border bg-white p-3.5 shadow-sm transition",
        canEdit ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-200"
      )}
    >
      {/* Header */}
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-lg bg-slate-950 px-2 py-1 text-xs font-black tabular-nums text-white">
            #{match.number}
          </span>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-600">
            {match.group ? `Grupo ${match.group}` : match.stageLabel}
          </span>
        </div>
        <span className={cn("shrink-0 rounded-lg border px-2 py-1 text-xs font-black", status.className)}>
          {status.label}
        </span>
      </div>

      <p className="mb-3 text-xs font-bold text-slate-400">
        {formatKickoff(match.kickoffAt)}
      </p>

      {/* Score rows */}
      <div className="grid gap-2">
        <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_58px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
          <span className="text-xl leading-none" aria-hidden="true">{homeFlag}</span>
          <span className="min-w-0 truncate text-sm font-black text-slate-900">{match.homeTeam}</span>
          <ScoreInput
            label={match.homeTeam}
            value={draft.homeScore}
            disabled={disabled}
            onChange={(value) => onUpdateDraft(match.id, { homeScore: value })}
          />
        </div>
        <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_58px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
          <span className="text-xl leading-none" aria-hidden="true">{awayFlag}</span>
          <span className="min-w-0 truncate text-sm font-black text-slate-900">{match.awayTeam}</span>
          <ScoreInput
            label={match.awayTeam}
            value={draft.awayScore}
            disabled={disabled}
            onChange={(value) => onUpdateDraft(match.id, { awayScore: value })}
          />
        </div>
      </div>

      {isKnockoutTie && canEdit && (
        <select
          value={draft.winnerPick ?? ""}
          onChange={(event) =>
            onUpdateDraft(match.id, {
              winnerPick: event.target.value === "home" || event.target.value === "away" ? event.target.value : null,
            })
          }
          className="mt-2 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
          aria-label={`Ganador por penales del partido ${match.number}`}
        >
          {getWinnerPickOptions(match).map((option) => (
            <option key={option.value || "none"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-xs font-black text-slate-600">
          {closed ? finalScoreText(match) : predictionResult(match, draft)}
        </span>
        <button
          type="button"
          onClick={() => void onSave(match)}
          disabled={disabled || !draft.dirty}
          title="Guardar"
          aria-label={`Guardar partido ${match.number}`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-emerald-600 bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        </button>
      </div>
      {draft.updatedAt && (
        <p className="mt-2 text-xs font-bold text-slate-400">{formatUpdatedAt(draft.updatedAt)}</p>
      )}
    </article>
  );
}
