"use client";

import { Table2, Trophy } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import type { MundialMatch } from "../types";
import { cn, isMatchLive, teamCode } from "../utils";
import { Flag } from "./Flag";

type GroupsViewProps = {
  matches: MundialMatch[];
};

type TeamStanding = {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
};

type GroupStanding = {
  group: string;
  teams: TeamStanding[];
  playedMatches: number;
  liveMatches: number;
};

function emptyStanding(team: string): TeamStanding {
  return {
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
  };
}

function applyResult(team: TeamStanding, goalsFor: number, goalsAgainst: number) {
  team.played += 1;
  team.goalsFor += goalsFor;
  team.goalsAgainst += goalsAgainst;
  team.goalDiff = team.goalsFor - team.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    team.wins += 1;
    team.points += 3;
  } else if (goalsFor < goalsAgainst) {
    team.losses += 1;
  } else {
    team.draws += 1;
    team.points += 1;
  }
}

function scoreForStandings(match: MundialMatch) {
  if (typeof match.homeFinalScore === "number" && typeof match.awayFinalScore === "number") {
    return {
      home: match.homeFinalScore,
      away: match.awayFinalScore,
      live: false,
    };
  }

  if (
    isMatchLive(match) &&
    typeof match.homeLiveScore === "number" &&
    typeof match.awayLiveScore === "number"
  ) {
    return {
      home: match.homeLiveScore,
      away: match.awayLiveScore,
      live: true,
    };
  }

  return null;
}

function buildGroupStandings(matches: MundialMatch[]): GroupStanding[] {
  const groups = new Map<string, Map<string, TeamStanding>>();
  const playedByGroup = new Map<string, number>();
  const liveByGroup = new Map<string, number>();

  for (const match of matches) {
    if (match.stage !== "group" || !match.group) continue;

    if (!groups.has(match.group)) groups.set(match.group, new Map());
    const groupTeams = groups.get(match.group)!;

    if (!groupTeams.has(match.homeTeam)) groupTeams.set(match.homeTeam, emptyStanding(match.homeTeam));
    if (!groupTeams.has(match.awayTeam)) groupTeams.set(match.awayTeam, emptyStanding(match.awayTeam));

    const score = scoreForStandings(match);
    if (!score) continue;

    applyResult(groupTeams.get(match.homeTeam)!, score.home, score.away);
    applyResult(groupTeams.get(match.awayTeam)!, score.away, score.home);
    playedByGroup.set(match.group, (playedByGroup.get(match.group) ?? 0) + 1);
    if (score.live) liveByGroup.set(match.group, (liveByGroup.get(match.group) ?? 0) + 1);
  }

  return [...groups.entries()]
    .map(([group, teamMap]) => ({
      group,
      teams: [...teamMap.values()].sort(
        (a, b) =>
          b.points - a.points ||
          b.goalDiff - a.goalDiff ||
          b.goalsFor - a.goalsFor ||
          a.team.localeCompare(b.team)
      ),
      playedMatches: playedByGroup.get(group) ?? 0,
      liveMatches: liveByGroup.get(group) ?? 0,
    }))
    .sort((a, b) => a.group.localeCompare(b.group));
}

export function GroupsView({ matches }: GroupsViewProps) {
  const groups = useMemo(() => buildGroupStandings(matches), [matches]);
  const completedGroupMatches = groups.reduce((sum, group) => sum + group.playedMatches, 0);
  const liveGroupMatches = groups.reduce((sum, group) => sum + group.liveMatches, 0);

  if (!groups.length) {
    return (
      <section className="grid min-h-56 place-items-center rounded-xl border border-dashed border-[#f0b429]/30 bg-black/35 p-6 text-center sm:p-8">
        <div>
          <Table2 className="mx-auto h-12 w-12 text-[#f0b429]" />
          <p className="mt-4 text-xl font-black text-white">Sin grupos disponibles</p>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <div className="relative overflow-hidden rounded-xl border border-[#f0b429]/30 bg-[#06140f] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(90deg,rgba(240,180,41,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="relative border-b border-white/12 bg-black/35 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#f0b429]/40 bg-[#f0b429] text-[#07110b] shadow-[0_0_18px_rgba(240,180,41,0.22)]">
                <Trophy className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d5ff3f]">Mundial 2026</p>
                <h2 className="mt-1 text-2xl font-black uppercase text-white sm:text-3xl">
                  Tabla de Grupos
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:min-w-[460px]">
              <HeaderStat label="Grupos" value={groups.length} tone="lime" />
              <HeaderStat label="Jugados" value={completedGroupMatches} tone="cyan" />
              <HeaderStat label="En vivo" value={liveGroupMatches} tone="white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => (
          <GroupTable key={group.group} group={group} />
        ))}
      </div>
    </section>
  );
}

function GroupTable({ group }: { group: GroupStanding }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#f0b429]/25 bg-[#06140f] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#12351f] px-4 py-3 [background-image:linear-gradient(135deg,rgba(240,180,41,0.18),transparent_58%)]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0b429]">Grupo</p>
          <h3 className="text-2xl font-black uppercase text-white">{group.group}</h3>
        </div>
        <div className="flex gap-1.5">
          {group.liveMatches > 0 && (
            <span className="rounded-md border border-[#9dff34]/50 bg-[#10240b] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-[#d5ff3f]">
              Live
            </span>
          )}
          <span className="rounded-md border border-white/15 bg-black/35 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white/60">
            {group.playedMatches}/6
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] text-sm">
          <thead>
            <tr className="border-b border-white/12 bg-black/45 text-xs">
              <th className="px-2 py-2.5 text-left font-black uppercase tracking-wide text-[#d5ff3f]">#</th>
              <th className="px-2 py-2.5 text-left font-black uppercase tracking-wide text-white">Equipo</th>
              <TableHeader>PJ</TableHeader>
              <TableHeader>G</TableHeader>
              <TableHeader>E</TableHeader>
              <TableHeader>P</TableHeader>
              <TableHeader>GF</TableHeader>
              <TableHeader>GC</TableHeader>
              <TableHeader>DG</TableHeader>
              <TableHeader strong>Pts</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {group.teams.map((team, index) => (
              <tr
                key={team.team}
                className={cn(
                  "transition-colors hover:bg-white/5",
                  index < 2 ? "bg-[#10240b]/45" : index === 2 ? "bg-[#071d2a]/35" : ""
                )}
              >
                <td className="px-2 py-2.5">
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-md border text-xs font-black tabular-nums",
                      index < 2
                        ? "border-[#d5ff3f]/60 bg-[#1a2206] text-[#d5ff3f]"
                        : index === 2
                          ? "border-[#62ffe6]/50 bg-[#071d2a] text-[#62ffe6]"
                          : "border-white/12 bg-black/35 text-white/55"
                    )}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid h-8 w-10 shrink-0 place-items-center rounded-md bg-white">
                      <Flag team={team.team} size="xs" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-white">{team.team}</p>
                      <p className="text-[10px] font-black text-[#f0b429]">{teamCode(team.team)}</p>
                    </div>
                  </div>
                </td>
                <NumberCell>{team.played}</NumberCell>
                <NumberCell>{team.wins}</NumberCell>
                <NumberCell>{team.draws}</NumberCell>
                <NumberCell>{team.losses}</NumberCell>
                <NumberCell>{team.goalsFor}</NumberCell>
                <NumberCell>{team.goalsAgainst}</NumberCell>
                <NumberCell tone={team.goalDiff > 0 ? "lime" : team.goalDiff < 0 ? "orange" : "white"}>
                  {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                </NumberCell>
                <NumberCell strong tone="lime">{team.points}</NumberCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-white/12 bg-black/30 px-4 py-3 text-[10px] font-black uppercase tracking-wide">
        <span className="rounded border border-[#d5ff3f]/35 bg-[#1a2206] px-2 py-1 text-[#d5ff3f]">1-2 Clasifica</span>
        <span className="rounded border border-[#62ffe6]/35 bg-[#071d2a] px-2 py-1 text-[#62ffe6]">3ro pelea cupo</span>
      </div>
    </article>
  );
}

function TableHeader({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return (
    <th className={cn("px-2 py-2.5 text-right font-black uppercase tracking-wide", strong ? "text-[#d5ff3f]" : "text-white/70")}>
      {children}
    </th>
  );
}

function NumberCell({
  children,
  strong = false,
  tone = "white",
}: {
  children: ReactNode;
  strong?: boolean;
  tone?: "lime" | "orange" | "white";
}) {
  const color = tone === "lime" ? "text-[#d5ff3f]" : tone === "orange" ? "text-[#ffb15f]" : "text-white/75";

  return (
    <td className="px-2 py-2.5 text-right">
      <span className={cn("font-black tabular-nums", strong ? "text-base" : "text-sm", color)}>{children}</span>
    </td>
  );
}

function HeaderStat({ label, value, tone }: { label: string; value: number | string; tone: "lime" | "cyan" | "white" }) {
  const color = tone === "lime" ? "text-[#d5ff3f]" : tone === "cyan" ? "text-[#62ffe6]" : "text-white";
  return (
    <div className="rounded-lg border border-white/15 bg-black/25 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-wider text-white/55">{label}</p>
      <p className={cn("mt-0.5 truncate text-sm font-black", color)}>{value}</p>
    </div>
  );
}
