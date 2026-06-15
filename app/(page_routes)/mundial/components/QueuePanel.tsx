import { CalendarDays, CheckCircle2, ChevronRight, Clock3, ListChecks, Lock, Timer } from "lucide-react";
import type { ReactNode } from "react";
import type { MundialMatch } from "../types";
import {
  cn,
  finalScoreText,
  formatKickoff,
  isMatchClosed,
  isMatchLive,
  isSameDayInCR,
  kickoffMs,
  liveScoreText,
  liveStatusLabel,
  teamCode,
} from "../utils";
import { Flag } from "./Flag";

type QueuePanelProps = {
  matches: MundialMatch[];
  nowMs: number;
  activeMatchId: string | null;
  selectedMatchId: string | null;
  onSelectMatch: (match: MundialMatch) => void;
};

type AgendaTone = "live" | "closed" | "today" | "pending";

export function QueuePanel({
  matches,
  nowMs,
  activeMatchId,
  selectedMatchId,
  onSelectMatch,
}: QueuePanelProps) {
  const sortedMatches = [...matches].sort((a, b) => kickoffMs(a) - kickoffMs(b) || a.number - b.number);
  const liveMatches = sortedMatches.filter((match) => isMatchLive(match));
  const closedTodayMatches = sortedMatches
    .filter((match) => !isMatchLive(match) && isMatchClosed(match, nowMs) && nowMs > 0 && isSameDayInCR(kickoffMs(match), nowMs))
    .reverse();
  const todayMatches = sortedMatches.filter(
    (match) => !isMatchLive(match) && !isMatchClosed(match, nowMs) && nowMs > 0 && isSameDayInCR(kickoffMs(match), nowMs)
  );
  const pendingMatches = sortedMatches.filter(
    (match) => !isMatchLive(match) && !isMatchClosed(match, nowMs) && !(nowMs > 0 && isSameDayInCR(kickoffMs(match), nowMs))
  );

  return (
    <aside className="min-w-0 overflow-hidden rounded-lg border border-[#9dff34]/55 bg-[#06140f] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
      <div className="bg-[#3151ff] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-[#d5ff3f]" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d5ff3f]">Match center</p>
            </div>
            <h2 className="text-2xl font-black uppercase leading-tight text-white">Partidos</h2>
            <p className="mt-1 text-sm font-bold text-white/70">Toca uno para predecir o ver marcadores.</p>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2">
            <Counter label="Live" value={liveMatches.length} />
            <Counter label="Faltan" value={pendingMatches.length} />
          </div>
        </div>
      </div>

      <div className="max-h-[72vh] space-y-4 overflow-y-auto p-4">
        <AgendaSection
          title="En vivo"
          icon={<Timer className="h-4 w-4" />}
          tone="live"
          matches={liveMatches}
          emptyText="No hay partido live."
          nowMs={nowMs}
          activeMatchId={activeMatchId}
          selectedMatchId={selectedMatchId}
          onSelectMatch={onSelectMatch}
        />
        <AgendaSection
          title="Cerrados hoy"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="closed"
          matches={closedTodayMatches}
          emptyText="Nada cerrado hoy."
          nowMs={nowMs}
          activeMatchId={activeMatchId}
          selectedMatchId={selectedMatchId}
          onSelectMatch={onSelectMatch}
        />
        <AgendaSection
          title="Hoy"
          icon={<CalendarDays className="h-4 w-4" />}
          tone="today"
          matches={todayMatches}
          emptyText="No quedan partidos hoy."
          nowMs={nowMs}
          activeMatchId={activeMatchId}
          selectedMatchId={selectedMatchId}
          onSelectMatch={onSelectMatch}
        />
        <AgendaSection
          title="Lo que falta"
          icon={<Timer className="h-4 w-4" />}
          tone="pending"
          matches={pendingMatches}
          emptyText="No quedan partidos pendientes."
          nowMs={nowMs}
          activeMatchId={activeMatchId}
          selectedMatchId={selectedMatchId}
          onSelectMatch={onSelectMatch}
        />
      </div>
    </aside>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-center">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#d5ff3f]">{label}</p>
      <p className="mt-1 text-xl font-black tabular-nums text-white">{value}</p>
    </div>
  );
}

function AgendaSection({
  title,
  icon,
  tone,
  matches,
  emptyText,
  nowMs,
  activeMatchId,
  selectedMatchId,
  onSelectMatch,
}: {
  title: string;
  icon: ReactNode;
  tone: AgendaTone;
  matches: MundialMatch[];
  emptyText: string;
  nowMs: number;
  activeMatchId: string | null;
  selectedMatchId: string | null;
  onSelectMatch: (match: MundialMatch) => void;
}) {
  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div
          className={cn(
            "flex min-w-0 items-center gap-2 text-xs font-black uppercase tracking-[0.18em]",
            tone === "live"
              ? "text-[#d5ff3f]"
              : tone === "closed"
                ? "text-[#ffb15f]"
                : tone === "today"
                  ? "text-[#62ffe6]"
                  : "text-[#d5ff3f]"
          )}
        >
          {icon}
          <span className="truncate">{title}</span>
        </div>
        <span className="rounded-md border border-white/15 bg-black/35 px-2 py-1 text-xs font-black tabular-nums text-white/75">
          {matches.length}
        </span>
      </div>

      {matches.length ? (
        <div className="grid gap-2">
          {matches.map((match) => (
            <AgendaMatchButton
              key={match.id}
              match={match}
              tone={tone}
              nowMs={nowMs}
              active={match.id === activeMatchId && !isMatchClosed(match, nowMs)}
              selected={selectedMatchId === match.id}
              onClick={() => onSelectMatch(match)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/15 bg-black/25 px-3 py-4 text-sm font-bold text-white/55">
          {emptyText}
        </div>
      )}
    </section>
  );
}

function AgendaMatchButton({
  match,
  tone,
  nowMs,
  active,
  selected,
  onClick,
}: {
  match: MundialMatch;
  tone: AgendaTone;
  nowMs: number;
  active: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const closed = isMatchClosed(match, nowMs);
  const live = isMatchLive(match);
  const statusLabel = live
    ? liveStatusLabel(match)
    : closed
      ? "Cerrado"
      : active
        ? "Activo"
        : tone === "today"
          ? "Hoy"
          : "Pendiente";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-lg border p-3 text-left transition-all",
        selected
          ? "border-[#d5ff3f] bg-[#17206b] shadow-[0_0_22px_rgba(213,255,63,0.18)]"
          : live
            ? "border-[#9dff34]/70 bg-[#10240b]"
            : active
              ? "border-[#62ffe6]/70 bg-[#071d2a]"
              : "border-white/10 bg-black/35 hover:border-[#62ffe6]/60 hover:bg-black/50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-white/15 bg-black/35 px-2 py-1 text-xs font-black tabular-nums text-white">
              #{match.number}
            </span>
            <span className="rounded-md border border-white/15 bg-black/35 px-2 py-1 text-xs font-black text-white/65">
              {match.group ? `Grupo ${match.group}` : match.stageLabel}
            </span>
          </div>
          <div className="mt-3 grid gap-2">
            <TeamLine team={match.homeTeam} />
            <TeamLine team={match.awayTeam} />
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-black",
              live
                ? "border-[#9dff34]/60 bg-[#10240b] text-[#d5ff3f]"
                : closed
                  ? "border-[#ffb15f]/50 bg-[#2a120b] text-[#ffb15f]"
                  : active
                    ? "border-[#62ffe6]/60 bg-[#071d2a] text-[#62ffe6]"
                    : "border-[#d5ff3f]/45 bg-[#1a2206] text-[#d5ff3f]"
            )}
          >
            {closed && !live ? <Lock className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
            {statusLabel}
          </span>
          <ChevronRight className={cn("h-4 w-4 transition", selected ? "text-[#d5ff3f]" : "text-white/35 group-hover:text-white")} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <p className="min-w-0 truncate text-sm font-bold text-white/60">{formatKickoff(match.kickoffAt)}</p>
        {live ? (
          <p className="shrink-0 text-sm font-black text-[#d5ff3f]">{liveScoreText(match)}</p>
        ) : closed ? (
          <p className="shrink-0 text-sm font-black text-[#62ffe6]">{finalScoreText(match)}</p>
        ) : null}
      </div>
    </button>
  );
}

function TeamLine({ team }: { team: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Flag team={team} size="xs" />
      <span className="shrink-0 rounded bg-[#3151ff] px-1.5 py-0.5 text-xs font-black text-white">{teamCode(team)}</span>
      <span className="min-w-0 truncate text-sm font-black text-white">{team}</span>
    </div>
  );
}
