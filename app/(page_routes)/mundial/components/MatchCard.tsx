import { CheckCircle2, Clock3, Loader2, Lock, PencilLine, Save, Users } from "lucide-react";
import type { Draft, MundialMatch } from "../types";
import { cn, finalScoreText, formatKickoff, formatUpdatedAt, getWinnerPickOptions, isMatchClosed, predictionResult } from "../utils";
import { Flag } from "./Flag";
import { ScoreInput } from "./ScoreInput";

type MatchStatus = {
  label: string;
  className: string;
  icon: "lock" | "edit" | "saved" | "open" | "queue";
};

function getMatchStatus(draft: Draft, canEdit: boolean, closed: boolean): MatchStatus {
  if (closed) {
    return {
      label: "Cerrado",
      className: "border-red-800/60 bg-red-950/35 text-red-200",
      icon: "lock",
    };
  }
  if (canEdit && draft.dirty) {
    return {
      label: "Sin guardar",
      className: "border-amber-600/60 bg-amber-950/35 text-amber-200",
      icon: "edit",
    };
  }
  if (canEdit && draft.saved) {
    return {
      label: "Guardado",
      className: "border-emerald-600/60 bg-emerald-950/35 text-emerald-200",
      icon: "saved",
    };
  }
  if (canEdit) {
    return {
      label: "Abierto",
      className: "border-emerald-700/60 bg-emerald-950/25 text-emerald-300",
      icon: "open",
    };
  }
  return {
    label: "En cola",
    className: "border-[#2b3d2b] bg-[#101711] text-[#8ca58f]",
    icon: "queue",
  };
}

function StatusIcon({ icon }: { icon: MatchStatus["icon"] }) {
  const className = "h-3.5 w-3.5 shrink-0";

  if (icon === "lock") return <Lock className={className} />;
  if (icon === "edit") return <PencilLine className={className} />;
  if (icon === "saved") return <CheckCircle2 className={className} />;
  return <Clock3 className={className} />;
}

type MatchCardProps = {
  match: MundialMatch;
  draft: Draft;
  savingId: string | null;
  isSavingBulk: boolean;
  todayEditableMatchIds: Set<string>;
  nowMs: number;
  onUpdateDraft: (matchId: string, patch: Partial<Draft>) => void;
  onSave: (match: MundialMatch) => Promise<void>;
  onViewPicks?: () => void;
  isViewingPicks?: boolean;
};

export function MatchCard({ match, draft, savingId, isSavingBulk, todayEditableMatchIds, nowMs, onUpdateDraft, onSave, onViewPicks, isViewingPicks }: MatchCardProps) {
  const closed = isMatchClosed(match, nowMs);
  const canEdit = todayEditableMatchIds.has(match.id) && !closed;
  const isSaving = savingId === match.id;
  const disabled = !canEdit || isSaving || isSavingBulk;
  const isKnockoutTie = match.stage !== "group" && draft.homeScore === draft.awayScore;
  const status = getMatchStatus(draft, canEdit, closed);

  return (
    <article
      className={cn(
        "min-w-0 rounded-lg border bg-[#0b130d] p-4 transition-all duration-200",
        canEdit ? "border-emerald-500/70 shadow-[0_0_18px_rgba(16,185,129,0.14)]" : "border-[#263b27]"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-md border border-[#2b3d2b] bg-[#071007] px-2 py-1 text-xs font-black tabular-nums text-[#a9c7ad]">
              #{match.number}
            </span>
            <span className="rounded-md border border-[#2b3d2b] bg-[#101711] px-2 py-1 text-xs font-black text-[#8ca58f]">
              {match.group ? `Grupo ${match.group}` : match.stageLabel}
            </span>
          </div>
          <p className="mt-2 text-sm font-bold text-[#8ca58f]">{formatKickoff(match.kickoffAt)}</p>
        </div>
        <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-black", status.className)}>
          <StatusIcon icon={status.icon} />
          {status.label}
        </span>
      </div>

      <div className="grid gap-2.5">
        <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-[#263b27] bg-[#101711] p-2.5">
          <Flag team={match.homeTeam} size="md" />
          <span className="min-w-0 text-sm font-black leading-tight text-white">{match.homeTeam}</span>
          <ScoreInput
            label={match.homeTeam}
            value={draft.homeScore}
            disabled={disabled}
            onChange={(value) => onUpdateDraft(match.id, { homeScore: value })}
          />
        </div>
        <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-[#263b27] bg-[#101711] p-2.5">
          <Flag team={match.awayTeam} size="md" />
          <span className="min-w-0 text-sm font-black leading-tight text-white">{match.awayTeam}</span>
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
          className="mt-3 h-11 w-full rounded-lg border border-amber-700/50 bg-[#15110a] px-3 text-sm font-black text-amber-200 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
          aria-label={`Ganador por penales del partido ${match.number}`}
        >
          {getWinnerPickOptions(match).map((option) => (
            <option key={option.value || "none"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[#263b27] bg-[#101711] p-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8ca58f]">
            {closed ? "Resultado final" : "Tu pick"}
          </p>
          <p
            className={cn(
              "mt-1 min-w-0 break-words text-base font-black",
              closed ? "text-[#b7d5ba]" : draft.saved ? "text-emerald-200" : "text-white"
            )}
          >
            {closed ? finalScoreText(match) : predictionResult(match, draft)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {onViewPicks && (
            <button
              type="button"
              onClick={onViewPicks}
              title="Ver picks de otros jugadores"
              aria-label={`Ver picks del partido ${match.number}`}
              className={cn(
                "grid h-12 w-12 shrink-0 place-items-center rounded-lg border transition",
                isViewingPicks
                  ? "border-emerald-500/70 bg-emerald-950/40 text-emerald-300"
                  : "border-[#365136] bg-[#070907] text-[#607160] hover:border-emerald-600 hover:text-emerald-400"
              )}
            >
              <Users className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => void onSave(match)}
            disabled={disabled || !draft.dirty}
            title="Guardar"
            aria-label={`Guardar partido ${match.number}`}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-emerald-500 bg-emerald-700 text-white transition hover:border-emerald-200 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:border-[#273527] disabled:bg-[#111811] disabled:text-[#687a68]"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {draft.updatedAt && (
        <p className="mt-2 text-xs font-bold text-[#7f957f]">{formatUpdatedAt(draft.updatedAt)}</p>
      )}
    </article>
  );
}
