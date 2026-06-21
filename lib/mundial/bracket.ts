import { GROUPS } from "./fixtures";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MatchForBracket = {
  id: string;
  stage: string;
  group?: string | null;
  homeTeam: string;
  awayTeam: string;
  homeSeed?: string | null;
  awaySeed?: string | null;
  homeFinalScore?: number | null;
  awayFinalScore?: number | null;
  actualWinner?: "home" | "away" | null;
};

type TeamStat = {
  team: string;
  group: string;
  played: number;
  points: number;
  gd: number;
  gf: number;
};

export type BracketUpdate = {
  matchId: string;
  field: "homeTeam" | "awayTeam";
  from: string;
  to: string;
};

// ── Group standings ────────────────────────────────────────────────────────────

function sortTeams(a: TeamStat, b: TeamStat): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return a.team.localeCompare(b.team);
}

export function computeGroupStandings(
  matches: MatchForBracket[],
): Record<string, TeamStat[]> {
  const stats: Record<string, Record<string, TeamStat>> = {};

  for (const { group, teams } of GROUPS) {
    stats[group] = {};
    for (const team of teams) {
      stats[group][team] = { team, group, played: 0, points: 0, gd: 0, gf: 0 };
    }
  }

  for (const m of matches) {
    if (
      m.stage !== "group" ||
      !m.group ||
      typeof m.homeFinalScore !== "number" ||
      typeof m.awayFinalScore !== "number"
    ) continue;

    const g = stats[m.group];
    const h = g?.[m.homeTeam];
    const a = g?.[m.awayTeam];
    if (!h || !a) continue;

    const hs = m.homeFinalScore;
    const as_ = m.awayFinalScore;

    h.played++; h.gf += hs; h.gd += hs - as_;
    a.played++; a.gf += as_; a.gd += as_ - hs;

    if (hs > as_) { h.points += 3; }
    else if (as_ > hs) { a.points += 3; }
    else { h.points += 1; a.points += 1; }
  }

  const result: Record<string, TeamStat[]> = {};
  for (const [group, teamMap] of Object.entries(stats)) {
    result[group] = Object.values(teamMap).sort(sortTeams);
  }
  return result;
}

// Each group of 4 has C(4,2) = 6 matches
function isGroupComplete(group: string, matches: MatchForBracket[]): boolean {
  const gm = matches.filter(m => m.stage === "group" && m.group === group);
  const done = gm.filter(
    m => typeof m.homeFinalScore === "number" && typeof m.awayFinalScore === "number",
  );
  return gm.length >= 6 && done.length >= 6;
}

// ── Seed resolution ────────────────────────────────────────────────────────────

type Context = {
  standings: Record<string, TeamStat[]>;
  completedGroups: Set<string>;
  matchWinners: Map<number, string>;
  matchLosers: Map<number, string>;
  assignedThirds: Set<string>;
};

function resolveSeed(seed: string, ctx: Context): string | null {
  // "1A" / "2B" → place in group
  const gpSeed = seed.match(/^([12])([A-L])$/);
  if (gpSeed) {
    const place = parseInt(gpSeed[1]) - 1;
    const group = gpSeed[2];
    if (!ctx.completedGroups.has(group)) return null;
    return ctx.standings[group]?.[place]?.team ?? null;
  }

  // "3A/B/C/D/F" → best unassigned 3rd from listed groups
  if (seed.startsWith("3")) {
    const eligibleGroups = seed.slice(1).split("/");
    const thirds = eligibleGroups
      .filter(g => ctx.completedGroups.has(g))
      .flatMap(g => {
        const third = ctx.standings[g]?.[2];
        return third ? [third] : [];
      })
      .sort(sortTeams);

    for (const third of thirds) {
      if (!ctx.assignedThirds.has(third.team)) {
        ctx.assignedThirds.add(third.team);
        return third.team;
      }
    }
    return null;
  }

  // "W73" → winner of match 73
  const wSeed = seed.match(/^W(\d+)$/);
  if (wSeed) return ctx.matchWinners.get(parseInt(wSeed[1])) ?? null;

  // "L101" → loser of match 101
  const lSeed = seed.match(/^L(\d+)$/);
  if (lSeed) return ctx.matchLosers.get(parseInt(lSeed[1])) ?? null;

  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isPlaceholder(name: string): boolean {
  return (
    /ro Grupo/.test(name) ||
    name.startsWith("Ganador") ||
    name.startsWith("Perdedor") ||
    name === "" ||
    name === "TBD"
  );
}

function matchNumber(id: string): number {
  const m = id.match(/(\d+)$/);
  return m ? parseInt(m[1]) : 0;
}

// ── Main propagation ───────────────────────────────────────────────────────────

export function computeBracketUpdates(matches: MatchForBracket[]): BracketUpdate[] {
  // Work on a mutable local copy so each pass sees previous resolutions
  const matchMap = new Map<string, MatchForBracket>();
  for (const m of matches) matchMap.set(m.id, { ...m });

  const allUpdates: BracketUpdate[] = [];
  const updatedKeys = new Set<string>(); // "matchId:field"

  // Up to 7 passes: group → R32 → R16 → QF → SF → 3rd → Final
  for (let pass = 0; pass < 7; pass++) {
    const current = Array.from(matchMap.values());
    const standings = computeGroupStandings(current);
    const completedGroups = new Set(
      Object.keys(standings).filter(g => isGroupComplete(g, current)),
    );

    // Build winner/loser maps (only from matches with real, non-placeholder team names)
    const matchWinners = new Map<number, string>();
    const matchLosers = new Map<number, string>();

    for (const m of current) {
      if (
        typeof m.homeFinalScore !== "number" ||
        typeof m.awayFinalScore !== "number" ||
        isPlaceholder(m.homeTeam) ||
        isPlaceholder(m.awayTeam)
      ) continue;

      const num = matchNumber(m.id);
      if (!num) continue;

      const hs = m.homeFinalScore;
      const as_ = m.awayFinalScore;

      let winner: string | null = null;
      let loser: string | null = null;

      if (m.actualWinner === "home" || (m.actualWinner == null && hs > as_)) {
        winner = m.homeTeam; loser = m.awayTeam;
      } else if (m.actualWinner === "away" || (m.actualWinner == null && as_ > hs)) {
        winner = m.awayTeam; loser = m.homeTeam;
      }
      // Draw without actualWinner: can't determine winner yet

      if (winner) matchWinners.set(num, winner);
      if (loser) matchLosers.set(num, loser);
    }

    const ctx: Context = {
      standings,
      completedGroups,
      matchWinners,
      matchLosers,
      assignedThirds: new Set(),
    };

    let changed = false;

    // Process knockout matches in match-number order so earlier rounds resolve first
    const knockouts = current
      .filter(m => m.stage !== "group" && (m.homeSeed || m.awaySeed))
      .sort((a, b) => matchNumber(a.id) - matchNumber(b.id));

    for (const m of knockouts) {
      for (const field of ["homeTeam", "awayTeam"] as const) {
        const seed = field === "homeTeam" ? m.homeSeed : m.awaySeed;
        if (!seed) continue;

        const key = `${m.id}:${field}`;
        if (updatedKeys.has(key) || !isPlaceholder(m[field])) continue;

        const resolved = resolveSeed(seed, ctx);
        if (!resolved) continue;

        allUpdates.push({ matchId: m.id, field, from: m[field], to: resolved });
        matchMap.get(m.id)![field] = resolved;
        updatedKeys.add(key);
        changed = true;
      }
    }

    if (!changed) break;
  }

  return allUpdates;
}
