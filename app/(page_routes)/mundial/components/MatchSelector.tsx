"use client";

import { CalendarDays, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { MundialMatch } from "../types";
import {
  cn,
  isSameDayInCR,
  isMatchClosed,
  isMatchLive,
  kickoffMs,
  liveStatusLabel,
} from "../utils";
import { Flag } from "./Flag";

type SelectorTab = "live" | "today" | "upcoming";

type MatchSelectorProps = {
  matches: MundialMatch[];
  nowMs: number;
  activeMatchId: string | null;
  selectedMatchId: string | null;
  onSelectMatch: (match: MundialMatch) => void;
};

export function MatchSelector({
  matches,
  nowMs,
  activeMatchId,
  selectedMatchId,
  onSelectMatch,
}: MatchSelectorProps) {
  const sorted = useMemo(
    () => [...matches].sort((a, b) => kickoffMs(a) - kickoffMs(b) || a.number - b.number),
    [matches]
  );

  const liveMatches = useMemo(() => sorted.filter(isMatchLive), [sorted]);

  const todayMatches = useMemo(
    () => sorted.filter((m) => nowMs > 0 && isSameDayInCR(kickoffMs(m), nowMs)),
    [sorted, nowMs]
  );

  const upcomingMatches = useMemo(
    () =>
      sorted.filter(
        (m) => !isMatchClosed(m, nowMs) && !(nowMs > 0 && isSameDayInCR(kickoffMs(m), nowMs))
      ),
    [sorted, nowMs]
  );

  const defaultTab: SelectorTab =
    liveMatches.length > 0 ? "live" : todayMatches.length > 0 ? "today" : "upcoming";
  const [tab, setTab] = useState<SelectorTab>(defaultTab);

  useEffect(() => {
    if (liveMatches.length > 0) setTab("live");
  }, [liveMatches.length]);

  const upcomingByDate = useMemo(() => {
    const groups: Array<{ label: string; dateKey: string; matches: MundialMatch[] }> = [];
    for (const m of upcomingMatches) {
      const ms = kickoffMs(m);
      const dateKey = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Costa_Rica",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(ms);
      const label = new Intl.DateTimeFormat("es-CR", {
        timeZone: "America/Costa_Rica",
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(ms);
      let group = groups.find((g) => g.dateKey === dateKey);
      if (!group) {
        group = { label, dateKey, matches: [] };
        groups.push(group);
      }
      group.matches.push(m);
    }
    return groups;
  }, [upcomingMatches]);

  const tabMatches = tab === "live" ? liveMatches : tab === "today" ? todayMatches : [];

  return (
    <div className="overflow-hidden rounded-lg border border-white/12 bg-[#06140f] shadow-[0_4px_20px_rgba(0,0,0,0.22)]">
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/30 px-3 py-2">
        <TabButton
          active={tab === "live"}
          onClick={() => setTab("live")}
          label="Live"
          count={liveMatches.length}
          live
        />
        <TabButton
          active={tab === "today"}
          onClick={() => setTab("today")}
          label="Hoy"
          count={todayMatches.length}
          icon={<CalendarDays className="h-3 w-3" />}
        />
        <TabButton
          active={tab === "upcoming"}
          onClick={() => setTab("upcoming")}
          label="Próximos"
          count={upcomingMatches.length}
          icon={<Timer className="h-3 w-3" />}
        />
      </div>

      <div className="p-3">
        {tab !== "upcoming" ? (
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-0.5">
              {tabMatches.map((m) => (
                <CompactMatchCard
                  key={m.id}
                  match={m}
                  nowMs={nowMs}
                  selected={selectedMatchId === m.id}
                  active={m.id === activeMatchId}
                  onClick={() => onSelectMatch(m)}
                />
              ))}
              {tabMatches.length === 0 && (
                <p className="py-3 text-sm font-bold text-white/50">
                  {tab === "live" ? "No hay partido en vivo ahora." : "No hay partidos hoy."}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="max-h-[44vh] space-y-4 overflow-y-auto pr-0.5">
            {upcomingByDate.map((group) => (
              <div key={group.dateKey}>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#d5ff3f]">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {group.matches.map((m) => (
                    <CompactMatchCard
                      key={m.id}
                      match={m}
                      nowMs={nowMs}
                      selected={selectedMatchId === m.id}
                      active={m.id === activeMatchId}
                      onClick={() => onSelectMatch(m)}
                      fill
                    />
                  ))}
                </div>
              </div>
            ))}
            {upcomingByDate.length === 0 && (
              <p className="py-3 text-sm font-bold text-white/50">No hay más partidos pendientes.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
  live,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  live?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded border px-2 text-[11px] font-black uppercase tracking-wide transition",
        active
          ? "border-white/30 bg-white/12 text-white"
          : "border-transparent text-white/45 hover:text-white/75"
      )}
    >
      {live ? (
        <span
          className={cn(
            "h-2 w-2 shrink-0 rounded-full",
            count > 0
              ? "animate-pulse bg-[#9dff34] shadow-[0_0_8px_rgba(157,255,52,0.9)]"
              : "bg-white/25"
          )}
        />
      ) : (
        icon && <span className="shrink-0 opacity-75">{icon}</span>
      )}
      <span>{label}</span>
      <span className="rounded bg-black/40 px-1 py-0.5 text-[10px] tabular-nums text-white/50">
        {count}
      </span>
    </button>
  );
}

function CompactMatchCard({
  match,
  nowMs,
  selected,
  active,
  onClick,
  fill,
}: {
  match: MundialMatch;
  nowMs: number;
  selected: boolean;
  active: boolean;
  onClick: () => void;
  fill?: boolean;
}) {
  const live = isMatchLive(match);
  const closed = isMatchClosed(match, nowMs);

  const centerDisplay = live
    ? `${match.homeLiveScore ?? 0}-${match.awayLiveScore ?? 0}`
    : closed && match.homeFinalScore !== null
      ? `${match.homeFinalScore}-${match.awayFinalScore}`
      : formatTime(match.kickoffAt);

  const statusColor = live
    ? "text-[#9dff34]"
    : closed
      ? "text-[#ffb15f]"
      : active
        ? "text-[#62ffe6]"
        : "text-white/40";

  const statusLabel = live
    ? liveStatusLabel(match)
    : closed
      ? "FT"
      : active
        ? "Abierto"
        : match.group
          ? `G ${match.group}`
          : (match.stageLabel?.slice(0, 6) ?? "");

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group rounded-lg border p-2.5 text-left transition-all",
        fill ? "w-full" : "w-[200px] shrink-0",
        selected
          ? "border-[#d5ff3f] bg-[#17206b] shadow-[0_0_18px_rgba(213,255,63,0.22)]"
          : live
            ? "border-[#9dff34]/65 bg-[#10240b]"
            : active
              ? "border-[#62ffe6]/55 bg-[#071d2a]"
              : "border-white/10 bg-black/35 hover:border-[#62ffe6]/50 hover:bg-black/50"
      )}
    >
      {/* Status row */}
      <div className="mb-2 flex items-center gap-1">
        {live && (
          <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#9dff34] shadow-[0_0_6px_rgba(157,255,52,0.9)]" />
        )}
        <span className={cn("truncate text-[9px] font-black uppercase tracking-wide", statusColor)}>
          {statusLabel}
        </span>
      </div>

      {/* Teams + score */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
        <div className="flex min-w-0 flex-col items-center gap-1">
          <Flag team={match.homeTeam} size="xs" />
          <span className="w-full truncate text-center text-[9px] font-black uppercase text-white">
            {match.homeTeam}
          </span>
        </div>

        <span
          className={cn(
            "shrink-0 rounded px-1 py-0.5 text-center text-[11px] font-black tabular-nums leading-none",
            live
              ? "bg-[#9dff34]/15 text-[#9dff34]"
              : closed
                ? "bg-[#ffb15f]/10 text-[#ffb15f]"
                : "bg-black/40 text-white/55"
          )}
        >
          {centerDisplay}
        </span>

        <div className="flex min-w-0 flex-col items-center gap-1">
          <Flag team={match.awayTeam} size="xs" />
          <span className="w-full truncate text-center text-[9px] font-black uppercase text-white">
            {match.awayTeam}
          </span>
        </div>
      </div>
    </button>
  );
}

function formatTime(kickoffAt: string) {
  const d = new Date(kickoffAt);
  if (Number.isNaN(d.getTime())) return "?:??";
  return new Intl.DateTimeFormat("es-CR", {
    timeZone: "America/Costa_Rica",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}
