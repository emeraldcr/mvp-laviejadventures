import { Clock3, Lock, Loader2, Save, Timer, Zap } from "lucide-react";
import type { Draft, MundialMatch } from "../types";
import {
  cn,
  formatKickoff,
  getWinnerPickOptions,
  hasFinalScore,
  isMatchClosed,
  isMatchLive,
  liveScoreText,
  liveStatusLabel,
  predictionResult,
  teamCode,
} from "../utils";
import { BroadcastScorebug } from "./BroadcastScorebug";
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
  const isClosed = isMatchClosed(match, nowMs);
  const isLive = isMatchLive(match);
  const isActive = !!activeCountdown;
  const canEdit = !isClosed;
  const isSaving = savingId === match.id;
  const disabled = !canEdit || isSaving || isSavingBulk;
  const isKnockoutTie = match.stage !== "group" && draft.homeScore === draft.awayScore;
  const hasLiveDetail = isLive || match.liveEvents.length > 0 || Boolean(match.liveNote);
  const scorebugHome = isLive
    ? match.homeLiveScore ?? 0
    : hasFinalScore(match)
      ? match.homeFinalScore ?? draft.homeScore
      : draft.homeScore;
  const scorebugAway = isLive
    ? match.awayLiveScore ?? 0
    : hasFinalScore(match)
      ? match.awayFinalScore ?? draft.awayScore
      : draft.awayScore;

  return (
    <section
      className={cn(
        "relative min-w-0 overflow-hidden rounded-lg border bg-[#071018] shadow-[0_24px_70px_rgba(0,0,0,0.32)]",
        isLive ? "border-[#9dff34]/70" : isClosed ? "border-[#ffb15f]/55" : isActive ? "border-[#62ffe6]/55" : "border-white/20"
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_50%_0%,rgba(49,81,255,0.28),transparent_38%),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:100%_100%,72px_72px,72px_72px]" />

      <div className="relative border-b border-white/12 bg-black/40 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {isLive ? (
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#9dff34] shadow-[0_0_10px_rgba(157,255,52,0.9)]" />
            ) : isClosed ? (
              <Lock className="h-3 w-3 shrink-0 text-[#ffb15f]" />
            ) : (
              <Clock3 className="h-3 w-3 shrink-0 text-[#62ffe6]" />
            )}
            <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.18em] text-white/80">
              {isLive ? "En vivo" : isClosed ? "Cerrado" : "Pendiente"}
            </span>
            <span className="text-white/30">·</span>
            <span className="shrink-0 text-[11px] font-bold text-white/50">
              {match.group ? `Grupo ${match.group}` : match.stageLabel}
            </span>
          </div>
          {isActive && !isLive && (
            <div className="flex shrink-0 items-center gap-1.5">
              <Timer className="h-3.5 w-3.5 text-[#d5ff3f]" />
              <span className="text-sm font-black tabular-nums text-[#62ffe6]">{activeCountdown}</span>
            </div>
          )}
          <p className="min-w-0 truncate text-[11px] font-bold text-white/40 sm:shrink-0">
            {formatKickoff(match.kickoffAt)}
          </p>
        </div>
      </div>

      <div className="relative p-4 sm:p-6">
        <BroadcastScorebug
          match={match}
          homeScore={scorebugHome}
          awayScore={scorebugAway}
          timeLabel={isLive ? liveStatusLabel(match) : activeCountdown ?? (isClosed ? "FT" : "PEND")}
          detailLabel={isLive ? "Marcador live" : hasFinalScore(match) ? "Resultado final" : isClosed ? "Marcador guardado" : "Marcador elegido"}
          className="mb-4"
        />

        {isLive ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#9dff34]/45 bg-[#10240b]/75 px-3 py-2 text-[#e7ffc0]">
            <Zap className="h-4 w-4 shrink-0 text-[#d5ff3f]" />
            <p className="min-w-0 text-sm font-bold">
              {liveScoreText(match)}
              {match.liveNote ? <span className="text-white/70"> / {match.liveNote}</span> : null}
            </p>
          </div>
        ) : isClosed ? (
          hasFinalScore(match) ? (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#ffb15f]/45 bg-[#2a120b]/70 px-3 py-2 text-[#ffd9a8]">
              <Lock className="h-4 w-4 shrink-0 text-[#ffb15f]" />
              <p className="text-sm font-bold">
                Resultado final:{" "}
                <span className="font-black text-white">
                  {match.homeTeam} {match.homeFinalScore} - {match.awayFinalScore} {match.awayTeam}
                </span>
              </p>
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#ffb15f]/45 bg-[#2a120b]/70 px-3 py-2 text-[#ffd9a8]">
              <Lock className="h-4 w-4 shrink-0 text-[#ffb15f]" />
              <p className="text-sm font-bold">Partido en juego; resultado pendiente.</p>
            </div>
          )
        ) : (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#62ffe6]/35 bg-[#071d2a]/75 px-3 py-2 text-[#c7fffa]">
            <Clock3 className="h-4 w-4 shrink-0 text-[#62ffe6]" />
            <p className="text-sm font-bold">
              El pick se bloquea cuando inicia el partido. Revisa y guarda antes del cierre.
            </p>
          </div>
        )}

        {hasLiveDetail && <LiveTimeline match={match} />}

        <div className="grid grid-cols-[minmax(0,1fr)_2.25rem_minmax(0,1fr)] items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] sm:gap-4">
          <TeamPickCard
            label="Local"
            team={match.homeTeam}
            value={draft.homeScore}
            disabled={disabled}
            onChange={(value) => onUpdateDraft(match.id, { homeScore: value })}
          />

          <div className="grid place-items-center">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 bg-black text-sm font-black text-[#d5ff3f] sm:h-14 sm:w-14 sm:text-lg">
              VS
            </span>
          </div>

          <TeamPickCard
            label="Visita"
            team={match.awayTeam}
            value={draft.awayScore}
            disabled={disabled}
            onChange={(value) => onUpdateDraft(match.id, { awayScore: value })}
          />
        </div>

        {isKnockoutTie && (
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#d5ff3f]">
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
              className="h-12 w-full rounded-lg border border-[#d5ff3f]/45 bg-black/60 px-4 text-base font-black text-[#d5ff3f] outline-none focus:border-white focus:ring-2 focus:ring-[#d5ff3f]/20 disabled:opacity-40"
              aria-label={`Ganador por penales del partido ${match.number}`}
            >
              {getWinnerPickOptions(match).map((option) => (
                <option key={option.value || "none"} value={option.value} className="bg-[#071018] text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="mt-5 flex flex-col gap-3 rounded-lg border border-white/15 bg-black/35 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#62ffe6]">
              {isClosed ? "Tu pick" : "Resultado elegido"}
            </p>
            <p className="mt-1 break-words text-2xl font-black text-white sm:text-3xl">
              {predictionResult(match, draft)}
            </p>
          </div>
          {!isClosed && (
            <button
              type="button"
              onClick={() => void onSave(match)}
              disabled={disabled || !draft.dirty}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#d5ff3f] bg-[#9dff34] px-6 text-base font-black text-[#06121c] transition-all hover:border-white hover:bg-[#d5ff3f] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/35 sm:w-auto sm:min-w-[11rem]"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Guardar pick
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function LiveTimeline({ match }: { match: MundialMatch }) {
  const events = [...match.liveEvents].sort((a, b) => (b.minute ?? -1) - (a.minute ?? -1));

  return (
    <div className="mb-4 rounded-lg border border-[#9dff34]/35 bg-black/35 p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex min-w-0 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#d5ff3f]">
          <Zap className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Momentos live</span>
        </p>
        <span className="rounded-md border border-white/15 bg-black/35 px-2 py-1 text-xs font-black text-white/65">
          {liveStatusLabel(match)}
        </span>
      </div>

      {match.liveNote && (
        <p className="mb-3 rounded-md border border-white/10 bg-[#071d2a]/75 px-3 py-2 text-sm font-bold text-[#c7fffa]">
          {match.liveNote}
        </p>
      )}

      {events.length ? (
        <div className="grid gap-2">
          {events.map((event) => {
            const team = event.team === "home" ? match.homeTeam : event.team === "away" ? match.awayTeam : "";
            const title = event.player || event.note || eventTypeLabel(event.type);

            return (
              <div key={event.id} className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-2 rounded-md border border-white/10 bg-[#05070d]/80 px-3 py-2">
                <span className="rounded bg-[#3151ff] px-2 py-1 text-center text-xs font-black tabular-nums text-white">
                  {event.minute !== null ? `${event.minute}'` : "--"}
                </span>
                <div className="min-w-0">
                  <p className="min-w-0 break-words text-sm font-black text-white">
                    {eventTypeLabel(event.type)}
                    {team ? <span className="text-[#d5ff3f]"> / {teamCode(team)}</span> : null}
                    {title !== eventTypeLabel(event.type) ? <span> / {title}</span> : null}
                  </p>
                  {event.note && event.note !== title && (
                    <p className="mt-0.5 min-w-0 break-words text-xs font-bold text-white/55">{event.note}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-white/15 bg-black/20 px-3 py-3 text-sm font-bold text-white/55">
          Esperando eventos del admin.
        </p>
      )}
    </div>
  );
}

function eventTypeLabel(type: string) {
  if (type === "goal") return "Gol";
  if (type === "penalty") return "Penal";
  if (type === "yellow") return "Amarilla";
  if (type === "red") return "Roja";
  if (type === "var") return "VAR";
  if (type === "substitution") return "Cambio";
  return "Nota";
}

function TeamPickCard({
  label,
  team,
  value,
  disabled,
  onChange,
}: {
  label: string;
  team: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-between gap-3 rounded-lg border border-white/15 bg-[#05070d]/80 px-3 py-3 transition-all focus-within:border-[#62ffe6] sm:px-4 sm:py-4">
      <div className="flex min-w-0 flex-col items-center gap-1.5">
        <Flag team={team} size="lg" className="rounded-sm" />
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d5ff3f]">{label}</p>
        <p className="max-w-full break-words text-center text-sm font-black uppercase leading-tight text-white sm:text-base">
          {team}
        </p>
      </div>
      <ScoreInput label={team} value={value} disabled={disabled} featured onChange={onChange} />
    </div>
  );
}
