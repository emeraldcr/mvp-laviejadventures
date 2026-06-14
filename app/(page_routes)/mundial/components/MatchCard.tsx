import { Loader2, Save } from "lucide-react";
import type { Draft, MundialMatch } from "../types";
import { cn, finalScoreText, formatKickoff, formatUpdatedAt, getCountryFlag, getWinnerPickOptions, isMatchClosed, predictionResult } from "../utils";
import { ScoreInput } from "./ScoreInput";

type MatchStatus = { label: string; className: string };

function getMatchStatus(draft: Draft, canEdit: boolean, closed: boolean): MatchStatus {
  if (closed) return { label: "Cerrado", className: "border-red-900/60 bg-red-950/40 text-red-400" };
  if (canEdit && draft.dirty) return { label: "Editando", className: "border-amber-600/50 bg-amber-950/40 text-amber-400" };
  if (canEdit && draft.saved) return { label: "Guardado", className: "border-green-700/50 bg-green-950/40 text-green-400" };
  if (canEdit) return { label: "Abierto", className: "border-green-800/50 bg-green-950/30 text-green-500" };
  return { label: "En fila", className: "border-[#1e3a1e] bg-[#0a140a] text-[#3a5a3a]" };
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
        "min-w-0 rounded-xl border bg-[#0c160c] p-3 transition-all duration-200 sm:p-3.5",
        canEdit
          ? "border-green-600/70"
          : "border-[#1a2e1a]"
      )}
      style={canEdit ? { boxShadow: "0 0 14px rgba(34,197,94,0.12)" } : undefined}
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="shrink-0 rounded-md border border-[#1e3a1e] bg-[#050a05] px-1.5 py-0.5 text-[11px] font-black tabular-nums text-[#5a8a5a]">
            #{match.number}
          </span>
          <span className="min-w-0 truncate rounded-md border border-[#1a2e1a] bg-[#080d08] px-1.5 py-0.5 text-[11px] font-black text-[#3a5a3a]">
            {match.group ? `Grupo ${match.group}` : match.stageLabel}
          </span>
        </div>
        <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-black", status.className)}>
          {status.label}
        </span>
      </div>

      <p className="mb-2.5 text-[11px] font-bold text-[#3a5a3a]">
        {formatKickoff(match.kickoffAt)}
      </p>

      {/* Score rows */}
      <div className="grid gap-2">
        <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_52px] items-center gap-2 rounded-lg border border-[#1a2e1a] bg-[#080d08] p-2 min-[380px]:grid-cols-[1.5rem_minmax(0,1fr)_58px]">
          <span className="text-xl leading-none" aria-hidden="true">{homeFlag}</span>
          <span className="min-w-0 truncate text-sm font-black text-[#d4f0d4]">{match.homeTeam}</span>
          <ScoreInput
            label={match.homeTeam}
            value={draft.homeScore}
            disabled={disabled}
            onChange={(value) => onUpdateDraft(match.id, { homeScore: value })}
          />
        </div>
        <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_52px] items-center gap-2 rounded-lg border border-[#1a2e1a] bg-[#080d08] p-2 min-[380px]:grid-cols-[1.5rem_minmax(0,1fr)_58px]">
          <span className="text-xl leading-none" aria-hidden="true">{awayFlag}</span>
          <span className="min-w-0 truncate text-sm font-black text-[#d4f0d4]">{match.awayTeam}</span>
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
          className="mt-2 h-10 w-full rounded-lg border border-[#2a4a2a] bg-[#080d08] px-3 text-sm font-bold text-[#d4f0d4] outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none"
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
        <span className={cn(
          "min-w-0 truncate text-xs font-black",
          closed ? "text-[#5a8a5a]" : draft.saved ? "text-green-400" : "text-[#3a5a3a]"
        )}>
          {closed ? finalScoreText(match) : predictionResult(match, draft)}
        </span>
        <button
          type="button"
          onClick={() => void onSave(match)}
          disabled={disabled || !draft.dirty}
          title="Guardar"
          aria-label={`Guardar partido ${match.number}`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-green-600 bg-green-700 text-white transition hover:bg-green-500 hover:border-green-400 disabled:cursor-not-allowed disabled:opacity-30 disabled:border-[#1a2e1a] disabled:bg-transparent"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        </button>
      </div>
      {draft.updatedAt && (
        <p className="mt-2 text-xs font-bold text-[#2a4020]">{formatUpdatedAt(draft.updatedAt)}</p>
      )}
    </article>
  );
}
