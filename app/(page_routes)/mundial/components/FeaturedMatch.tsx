import { Clock3, Lock, Loader2, Save, Timer, Trophy, Zap } from "lucide-react";
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
import { Flag } from "./Flag";
import { ScoreInput } from "./ScoreInput";
import { BettingFavoriteCard } from "./BettingFavoriteCard";

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

  const homeLiveScore = isLive
    ? (match.homeLiveScore ?? 0)
    : hasFinalScore(match)
      ? (match.homeFinalScore ?? 0)
      : null;

  const awayLiveScore = isLive
    ? (match.awayLiveScore ?? 0)
    : hasFinalScore(match)
      ? (match.awayFinalScore ?? 0)
      : null;

  return (
    <section
      className={cn(
        "relative min-w-0 overflow-hidden rounded-xl border bg-[#07110d] shadow-[0_24px_70px_rgba(0,0,0,0.32)]",
        isLive
          ? "border-[#9dff34]/70"
          : isClosed
            ? "border-[#ffb15f]/55"
            : isActive
              ? "border-[#f0b429]/65"
              : "border-white/20"
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(90deg,rgba(240,180,41,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />

      {/* Header bar */}
      <div className="relative border-b border-white/12 bg-black/40 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#9dff34] shadow-[0_0_10px_rgba(157,255,52,0.9)]" />
            ) : isClosed ? (
              <Lock className="h-3 w-3 shrink-0 text-[#ffb15f]" />
            ) : (
              <Clock3 className="h-3 w-3 shrink-0 text-[#f0b429]" />
            )}
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/80">
              {isLive ? "En vivo" : isClosed ? "Cerrado" : "Pendiente"}
            </span>
            <span className="text-white/30">·</span>
            <span className="text-[11px] font-bold text-white/50">
              {match.group ? `Grupo ${match.group}` : match.stageLabel}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {isActive && !isLive && (
              <div className="flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-[#d5ff3f]" />
                <span className="text-sm font-black tabular-nums text-[#f0b429]">{activeCountdown}</span>
              </div>
            )}
            <p className="text-[11px] font-bold text-white/40">{formatKickoff(match.kickoffAt)}</p>
          </div>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="relative grid grid-cols-1 lg:grid-cols-2">
        {/* Panel 1 — Info del partido */}
        <div className="border-b border-white/10 p-4 sm:p-5 lg:border-b-0 lg:border-r lg:border-white/10">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
            Info del partido
          </p>

          {/* Status banner */}
          {isLive ? (
            <div className="flex items-center gap-2 rounded-lg border border-[#9dff34]/45 bg-[#10240b]/75 px-3 py-2.5 text-[#e7ffc0]">
              <Zap className="h-4 w-4 shrink-0 text-[#d5ff3f]" />
              <p className="text-sm font-bold">
                {liveScoreText(match)}
                {match.liveNote ? <span className="text-white/70"> / {match.liveNote}</span> : null}
              </p>
            </div>
          ) : isClosed ? (
            hasFinalScore(match) ? (
              <div className="flex items-center gap-2 rounded-lg border border-[#ffb15f]/45 bg-[#2a120b]/70 px-3 py-2.5 text-[#ffd9a8]">
                <Lock className="h-4 w-4 shrink-0 text-[#ffb15f]" />
                <p className="text-sm font-bold">
                  Resultado final:{" "}
                  <span className="font-black text-white">
                    {match.homeTeam} {match.homeFinalScore} – {match.awayFinalScore} {match.awayTeam}
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-[#ffb15f]/45 bg-[#2a120b]/70 px-3 py-2.5 text-[#ffd9a8]">
                <Lock className="h-4 w-4 shrink-0 text-[#ffb15f]" />
                <p className="text-sm font-bold">Partido en juego; resultado pendiente.</p>
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-[#f0b429]/35 bg-[#1a2206]/75 px-3 py-2.5 text-[#fff1b8]">
              <Clock3 className="h-4 w-4 shrink-0 text-[#f0b429]" />
              <p className="text-sm font-bold">
                El pick se bloquea cuando inicia el partido. Revisa y guarda antes del cierre.
              </p>
            </div>
          )}

          {/* Live / final scoreboard */}
          {homeLiveScore !== null ? (
            <MatchScoreboard
              match={match}
              isLive={isLive}
              homeLiveScore={homeLiveScore}
              awayLiveScore={awayLiveScore!}
            />
          ) : (
            /* Pending fixture display */
            <div className="mt-5 flex items-center justify-center gap-6 py-3">
              <div className="flex flex-col items-center gap-2">
                <Flag team={match.homeTeam} size="lg" className="rounded-sm" />
                <p className="text-sm font-black uppercase text-white">{teamCode(match.homeTeam)}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Trophy className="h-4 w-4 text-[#f0b429]" />
                <span className="text-[9px] font-black tracking-wide text-white/25">WC26</span>
                <span className="mt-0.5 text-base font-black text-white/20">vs</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Flag team={match.awayTeam} size="lg" className="rounded-sm" />
                <p className="text-sm font-black uppercase text-white">{teamCode(match.awayTeam)}</p>
              </div>
            </div>
          )}

          {/* Live event timeline */}
          {hasLiveDetail && (
            <div className="mt-4">
              <LiveTimeline match={match} />
            </div>
          )}
        </div>

        {/* Panel 2 — Tu predicción */}
        <div className="p-4 sm:p-5">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
            Tu predicción
          </p>

          <BettingFavoriteCard match={match} />

          {/* Score inputs */}
          <div className="grid grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)]">
            <PickTeamCard
              label="Local"
              team={match.homeTeam}
              pickScore={draft.homeScore}
              disabled={disabled}
              isClosed={isClosed}
              onChange={(v) => onUpdateDraft(match.id, { homeScore: v })}
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                {isLive ? liveStatusLabel(match) : activeCountdown ?? (isClosed ? "FT" : "PEND")}
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 bg-black text-sm font-black text-[#d5ff3f]">
                vs
              </span>
            </div>

            <PickTeamCard
              label="Visita"
              team={match.awayTeam}
              pickScore={draft.awayScore}
              disabled={disabled}
              isClosed={isClosed}
              onChange={(v) => onUpdateDraft(match.id, { awayScore: v })}
            />
          </div>

          {/* Knockout penalty tie-breaker */}
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

          {/* Prediction summary + save */}
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-white/15 bg-black/35 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f0b429]">
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
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#d5ff3f] bg-[#9dff34] px-6 text-base font-black text-[#06121c] transition-all hover:border-white hover:bg-[#d5ff3f] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/35 sm:w-auto sm:min-w-[10rem]"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Guardar pick
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MatchScoreboard({
  match,
  isLive,
  homeLiveScore,
  awayLiveScore,
}: {
  match: MundialMatch;
  isLive: boolean;
  homeLiveScore: number;
  awayLiveScore: number;
}) {
  const scoreClass = isLive
    ? "border-[#9dff34]/35 bg-[#0d1f08]/80 text-[#9dff34] shadow-[0_0_18px_rgba(157,255,52,0.12)]"
    : "border-[#ffb15f]/35 bg-[#1e0d05]/80 text-[#ffb15f]";
  const labelClass = isLive ? "text-[#9dff34]/60" : "text-[#ffb15f]/60";

  return (
    <div className="mt-5 flex items-end justify-center gap-4 py-1">
      <div className="flex flex-col items-center gap-2">
        <Flag team={match.homeTeam} size="lg" className="rounded-sm" />
        <p className="text-xs font-black uppercase text-white/55">{teamCode(match.homeTeam)}</p>
        <span className={cn("w-20 rounded-lg border py-3 text-center text-5xl font-black tabular-nums", scoreClass)}>
          {homeLiveScore}
        </span>
      </div>
      <div className="mb-3 flex flex-col items-center gap-1">
        <span className={cn("text-[9px] font-black uppercase tracking-widest", labelClass)}>
          {isLive ? liveStatusLabel(match) : "FT"}
        </span>
        <span className="text-2xl font-black text-white/20">–</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Flag team={match.awayTeam} size="lg" className="rounded-sm" />
        <p className="text-xs font-black uppercase text-white/55">{teamCode(match.awayTeam)}</p>
        <span className={cn("w-20 rounded-lg border py-3 text-center text-5xl font-black tabular-nums", scoreClass)}>
          {awayLiveScore}
        </span>
      </div>
    </div>
  );
}

function PickTeamCard({
  label,
  team,
  pickScore,
  disabled,
  isClosed,
  onChange,
}: {
  label: string;
  team: string;
  pickScore: number;
  disabled: boolean;
  isClosed: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-3 rounded-lg border border-white/15 bg-[#06100b]/85 px-3 py-4 transition-all focus-within:border-[#f0b429]">
      <Flag team={team} size="lg" className="rounded-sm" />
      <div className="flex flex-col items-center gap-0.5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d5ff3f]">{label}</p>
        <p className="max-w-full break-words text-center text-sm font-black uppercase leading-tight text-white">
          {team}
        </p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ScoreInput label={team} value={pickScore} disabled={disabled} featured onChange={onChange} />
        <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#f0b429]/60">
          {isClosed ? "Tu pick" : "Tu predicción"}
        </span>
      </div>
    </div>
  );
}

function LiveTimeline({ match }: { match: MundialMatch }) {
  const events = [...match.liveEvents].sort((a, b) => (b.minute ?? -1) - (a.minute ?? -1));

  return (
    <div className="rounded-lg border border-[#9dff34]/35 bg-black/35 p-3">
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
        <p className="mb-3 rounded-md border border-white/10 bg-[#10240b]/75 px-3 py-2 text-sm font-bold text-[#e7ffc0]">
          {match.liveNote}
        </p>
      )}

      {events.length ? (
        <div className="grid gap-2">
          {events.map((event) => {
            const team = event.team === "home" ? match.homeTeam : event.team === "away" ? match.awayTeam : "";
            const title = event.player || event.note || eventTypeLabel(event.type);

            return (
              <div
                key={event.id}
                className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-2 rounded-md border border-white/10 bg-[#05070d]/80 px-3 py-2"
              >
                <span className="rounded bg-[#174826] px-2 py-1 text-center text-xs font-black tabular-nums text-white">
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
