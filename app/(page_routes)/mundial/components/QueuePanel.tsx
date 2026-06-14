import { CalendarDays, CheckCircle2, ChevronRight, Clock3, ListChecks, Lock, Timer } from "lucide-react";
import type { ReactNode } from "react";
import type { MundialMatch } from "../types";
import { cn, finalScoreText, formatKickoff, isMatchClosed, isSameDayInCR, kickoffMs } from "../utils";
import { Flag } from "./Flag";

type QueuePanelProps = {
  matches: MundialMatch[];
  nowMs: number;
  activeMatchId: string | null;
  selectedMatchId: string | null;
  onSelectMatch: (match: MundialMatch) => void;
};

type AgendaTone = "closed" | "today" | "pending";

export function QueuePanel({
  matches,
  nowMs,
  activeMatchId,
  selectedMatchId,
  onSelectMatch,
}: QueuePanelProps) {
  const sortedMatches = [...matches].sort((a, b) => kickoffMs(a) - kickoffMs(b) || a.number - b.number);
  const closedTodayMatches = sortedMatches.filter(
    (match) => isMatchClosed(match, nowMs) && nowMs > 0 && isSameDayInCR(kickoffMs(match), nowMs)
  );
  const todayMatches = sortedMatches.filter(
    (match) => !isMatchClosed(match, nowMs) && nowMs > 0 && isSameDayInCR(kickoffMs(match), nowMs)
  );
  const pendingMatches = sortedMatches.filter(
    (match) => !isMatchClosed(match, nowMs) && !(nowMs > 0 && isSameDayInCR(kickoffMs(match), nowMs))
  );

  return (
    <aside className="min-w-0 overflow-hidden rounded-lg border border-[#263b27] bg-[#0b130d]">
      <div className="border-b border-[#263b27] bg-[#101911] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-cyan-200" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Agenda</p>
            </div>
            <h2 className="text-2xl font-black leading-tight text-white">Partidos</h2>
            <p className="mt-1 text-sm font-bold text-[#8ca58f]">Toca uno para ver los marcadores.</p>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2">
            <Counter label="Hoy" value={todayMatches.length + closedTodayMatches.length} />
            <Counter label="Faltan" value={pendingMatches.length} />
          </div>
        </div>
      </div>

      <div className="max-h-[72vh] space-y-4 overflow-y-auto p-4">
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
    <div className="min-w-0 rounded-lg border border-[#2b3d2b] bg-[#071007] px-3 py-2 text-center">
      <p className="text-[10px] font-black uppercase tracking-wider text-[#8ca58f]">{label}</p>
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
            tone === "closed" ? "text-amber-300" : tone === "today" ? "text-emerald-300" : "text-cyan-200"
          )}
        >
          {icon}
          <span className="truncate">{title}</span>
        </div>
        <span className="rounded-md border border-[#2b3d2b] bg-[#071007] px-2 py-1 text-xs font-black tabular-nums text-[#a9c7ad]">
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
        <div className="rounded-lg border border-dashed border-[#263b27] bg-[#101711] px-3 py-4 text-sm font-bold text-[#8ca58f]">
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
  const statusLabel = closed ? "Cerrado" : active ? "Activo" : tone === "today" ? "Hoy" : "Pendiente";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-lg border p-3 text-left transition-all",
        selected
          ? "border-emerald-400 bg-emerald-950/30 shadow-[0_0_18px_rgba(16,185,129,0.12)]"
          : active
            ? "border-emerald-600/70 bg-[#071b12]"
            : "border-[#263b27] bg-[#101711] hover:border-[#3d5b3d] hover:bg-[#121c12]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[#2b3d2b] bg-[#071007] px-2 py-1 text-xs font-black tabular-nums text-[#b7d5ba]">
              #{match.number}
            </span>
            <span className="rounded-md border border-[#2b3d2b] bg-[#071007] px-2 py-1 text-xs font-black text-[#8ca58f]">
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
              closed
                ? "border-amber-700/50 bg-amber-950/25 text-amber-200"
                : active
                  ? "border-emerald-500/70 bg-emerald-950/35 text-emerald-200"
                  : "border-cyan-800/50 bg-cyan-950/20 text-cyan-200"
            )}
          >
            {closed ? <Lock className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
            {statusLabel}
          </span>
          <ChevronRight className={cn("h-4 w-4 transition", selected ? "text-emerald-200" : "text-[#607160] group-hover:text-white")} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#263b27] pt-3">
        <p className="min-w-0 truncate text-sm font-bold text-[#9db59f]">{formatKickoff(match.kickoffAt)}</p>
        {closed && <p className="shrink-0 text-sm font-black text-emerald-200">{finalScoreText(match)}</p>}
      </div>
    </button>
  );
}

function TeamLine({ team }: { team: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Flag team={team} size="sm" />
      <span className="min-w-0 truncate text-base font-black text-white">{team}</span>
    </div>
  );
}
