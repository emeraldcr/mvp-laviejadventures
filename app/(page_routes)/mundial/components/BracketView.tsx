"use client";

import { useMemo, useState } from "react";
import { Calendar, MapPin, Trophy, X } from "lucide-react";
import type { LeaderboardEntry, MundialMatch, Prediction } from "../types";
import { cn, teamCode, formatKickoff } from "../utils";
import { resolveTeamFlag } from "../flags";
import { Flag } from "./Flag";

// ─── Bracket layout ───────────────────────────────────────────────────────────

const DEG = 360 / 32; // 11.25° per outer slot

// 32 outer slots: [matchNumber, side] clockwise from top
// Arranged so bracket pairs are adjacent (→ clean connecting lines)
const R32_SLOTS: [number, "home" | "away"][] = [
  // RIGHT half — SF102 side (slots 0-15)
  [76, "home"], [76, "away"], [73, "home"], [73, "away"],   // → R16_91
  [79, "home"], [79, "away"], [80, "home"], [80, "away"],   // → R16_92
  [86, "home"], [86, "away"], [88, "home"], [88, "away"],   // → R16_95
  [85, "home"], [85, "away"], [87, "home"], [87, "away"],   // → R16_96
  // LEFT half — SF101 side (slots 16-31)
  [84, "home"], [84, "away"], [83, "home"], [83, "away"],   // → R16_93
  [82, "home"], [82, "away"], [81, "home"], [81, "away"],   // → R16_94
  [74, "home"], [74, "away"], [77, "home"], [77, "away"],   // → R16_89
  [75, "home"], [75, "away"], [78, "home"], [78, "away"],   // → R16_90
];

const slotDeg = (i: number) => (i + 0.5) * DEG;

// R32 match center angles
const R32_A: Record<number, number> = {};
const _seen = new Set<number>();
R32_SLOTS.forEach(([m], i) => {
  if (!_seen.has(m)) { R32_A[m] = (slotDeg(i) + slotDeg(i + 1)) / 2; _seen.add(m); }
});

// R16: [matchNum, r32a, r32b]
const R16_DEF: [number, number, number][] = [
  [91, 76, 73], [92, 79, 80], [95, 86, 88], [96, 85, 87],
  [93, 84, 83], [94, 82, 81], [89, 74, 77], [90, 75, 78],
];
const R16_A: Record<number, number> = {};
R16_DEF.forEach(([n, a, b]) => { R16_A[n] = (R32_A[a] + R32_A[b]) / 2; });

// QF: [matchNum, r16a, r16b]
const QF_DEF: [number, number, number][] = [
  [99, 91, 92], [100, 95, 96], [98, 93, 94], [97, 89, 90],
];
const QF_A: Record<number, number> = {};
QF_DEF.forEach(([n, a, b]) => { QF_A[n] = (R16_A[a] + R16_A[b]) / 2; });

// SF: [matchNum, qfa, qfb]
const SF_DEF: [number, number, number][] = [
  [102, 99, 100], [101, 97, 98],
];
const SF_A: Record<number, number> = {};
SF_DEF.forEach(([n, a, b]) => { SF_A[n] = (QF_A[a] + QF_A[b]) / 2; });
// SF102 = 90° (right), SF101 = 270° (left)

// ─── SVG helpers ──────────────────────────────────────────────────────────────

const CX = 350, CY = 350;

function pt(r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

function mwinner(m: MundialMatch | undefined): "home" | "away" | null {
  if (!m || m.homeFinalScore == null || m.awayFinalScore == null) return null;
  const aw = (m as Record<string, unknown>).actualWinner as "home" | "away" | null;
  if (aw) return aw;
  if (m.homeFinalScore > m.awayFinalScore) return "home";
  if (m.awayFinalScore > m.homeFinalScore) return "away";
  return null;
}

function winnerTeam(m: MundialMatch | undefined): string | null {
  const w = mwinner(m);
  if (!m || !w) return null;
  return w === "home" ? m.homeTeam : m.awayTeam;
}

function isReal(name: string) {
  return !!name && !/^(Ganador|Perdedor|1ro|2do|3ro|TBD|$)/.test(name.trim());
}

function teamFlagEmoji(team: string) {
  return isReal(team) ? resolveTeamFlag(team).emoji : "";
}

function accuracyPct(e: LeaderboardEntry) {
  return e.scoredPredictions > 0
    ? Math.round((e.correctOutcomes / e.scoredPredictions) * 100)
    : 0;
}

// Radii
const RA = { outer: 265, label: 293, r16: 207, qf: 149, sf: 91, finalPt: 40 };

// ─── Main export ──────────────────────────────────────────────────────────────

export function BracketView({
  matches,
  leaderboard,
  predictions,
  playerName,
}: {
  matches: MundialMatch[];
  leaderboard: LeaderboardEntry[];
  predictions: Prediction[];
  playerName: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const byNum = useMemo(() => new Map(matches.map((m) => [m.number, m])), [matches]);

  const myPred = useMemo(() => {
    const key = playerName.trim().toLowerCase();
    return new Map(
      predictions
        .filter((p) => p.playerName.trim().toLowerCase() === key)
        .map((p) => [p.matchId, p])
    );
  }, [predictions, playerName]);

  const selMatch = selected != null ? byNum.get(selected) : undefined;

  return (
    <section className="grid gap-4">
      {leaderboard.length > 0 && <MiniPodium leaderboard={leaderboard} />}

      <div className="relative overflow-hidden rounded-2xl border border-[#f0b429]/25 bg-[#04100a] shadow-[0_32px_80px_rgba(0,0,0,0.60)]">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_50%_50%_at_50%_55%,rgba(240,180,41,0.08),transparent_70%)]" />

        <div className="relative flex items-center gap-3 border-b border-white/10 bg-black/25 px-4 py-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#f0b429]/40 bg-[#f0b429] text-[#07110b]">
            <Trophy className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d5ff3f]">Quiniela · Mundial 2026</p>
            <p className="text-base font-black uppercase text-white">Bracket Eliminatorias</p>
          </div>
          <p className="ml-auto hidden text-xs font-bold text-white/35 sm:block">Toca un partido para ver detalles</p>
        </div>

        <div className="p-2 sm:p-4">
          <div className="mx-auto w-full" style={{ maxWidth: 680, aspectRatio: "1 / 1" }}>
            <BracketSVG
              byNum={byNum}
              selected={selected}
              onSelect={(n) => setSelected((prev) => (prev === n ? null : n))}
            />
          </div>
        </div>

        {/* legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 bg-black/25 px-4 py-2.5">
          <LegendDot color="#f0b429" label="Ganador avanza" />
          <LegendDot color="rgba(255,255,255,0.45)" label="Definido" />
          <LegendDot color="rgba(255,255,255,0.18)" label="Pendiente" />
        </div>
      </div>

      {selMatch && (
        <MatchCard
          match={selMatch}
          pred={myPred.get(selMatch.id) ?? null}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}

// ─── SVG Bracket ─────────────────────────────────────────────────────────────

function BracketSVG({
  byNum,
  selected,
  onSelect,
}: {
  byNum: Map<number, MundialMatch>;
  selected: number | null;
  onSelect: (n: number) => void;
}) {
  const gm = (n: number) => byNum.get(n);
  const hasRes = (n: number) => gm(n)?.homeFinalScore != null;
  const lineC = (n: number) =>
    hasRes(n) ? "rgba(240,180,41,0.5)" : "rgba(255,255,255,0.07)";
  const lineW = (n: number) => (hasRes(n) ? 1.2 : 0.8);

  function connLine(r1: number, a1: number, r2: number, a2: number, matchNum: number) {
    const [x1, y1] = pt(r1, a1);
    const [x2, y2] = pt(r2, a2);
    return (
      <line
        key={`${r1}-${a1}-${r2}-${a2}`}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={lineC(matchNum)} strokeWidth={lineW(matchNum)}
      />
    );
  }

  const r32r16Lines = R16_DEF.flatMap(([n, a, b]) => [
    connLine(RA.outer, R32_A[a], RA.r16, R16_A[n], n),
    connLine(RA.outer, R32_A[b], RA.r16, R16_A[n], n),
  ]);

  const r16qfLines = QF_DEF.flatMap(([n, a, b]) => [
    connLine(RA.r16, R16_A[a], RA.qf, QF_A[n], n),
    connLine(RA.r16, R16_A[b], RA.qf, QF_A[n], n),
  ]);

  const qfsfLines = SF_DEF.flatMap(([n, a, b]) => [
    connLine(RA.qf, QF_A[a], RA.sf, SF_A[n], n),
    connLine(RA.qf, QF_A[b], RA.sf, SF_A[n], n),
  ]);

  const sfFinalLines = [101, 102].map((sfN) => {
    const [x1, y1] = pt(RA.sf, SF_A[sfN]);
    return (
      <line key={sfN} x1={x1} y1={y1} x2={CX} y2={CY}
        stroke={lineC(104)} strokeWidth={lineW(104) + 0.4} />
    );
  });

  // 3rd place lines from SF losers
  const [x3p, y3p] = pt(RA.finalPt, 180); // bottom-center
  const thirdLines = [101, 102].map((sfN) => {
    const [x1, y1] = pt(RA.sf, SF_A[sfN]);
    return (
      <line key={`3p-${sfN}`} x1={x1} y1={y1} x2={x3p} y2={y3p}
        stroke={lineC(103)} strokeWidth={0.8} strokeDasharray="3 3" />
    );
  });

  return (
    <svg viewBox="0 0 700 700" className="h-full w-full">
      <defs>
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0b429" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#f0b429" stopOpacity="0" />
        </radialGradient>
        <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="sglow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* center ambient */}
      <circle cx={CX} cy={CY} r={92} fill="url(#cg)" />

      {/* guide rings */}
      {[RA.r16, RA.qf, RA.sf].map((r) => (
        <circle key={r} cx={CX} cy={CY} r={r}
          fill="none" stroke="rgba(255,255,255,0.05)"
          strokeWidth={1} strokeDasharray="2 7" />
      ))}

      {/* connectors */}
      {r32r16Lines}
      {r16qfLines}
      {qfsfLines}
      {sfFinalLines}
      {thirdLines}

      {/* separator arcs between each pair of R32 teams (show match groupings) */}
      {Array.from({ length: 16 }, (_, i) => {
        const sepAngle = (i * 2 + 2) * DEG; // boundary between pairs
        const [x1, y1] = pt(RA.outer - 8, sepAngle);
        const [x2, y2] = pt(RA.outer + 14, sepAngle);
        return (
          <line key={`sep-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(255,255,255,0.12)" strokeWidth={0.7} />
        );
      })}

      {/* R32 outer slots */}
      {R32_SLOTS.map(([matchNum, side], i) => {
        const angle = slotDeg(i);
        const match = gm(matchNum);
        const team = side === "home" ? match?.homeTeam : match?.awayTeam;
        const wr = mwinner(match);
        const won = wr === side;
        const lost = match?.homeFinalScore != null && wr !== null && wr !== side;
        return (
          <OuterSlot key={`${matchNum}-${side}`}
            angle={angle} team={team ?? ""} won={won} lost={lost}
            isSelected={selected === matchNum}
            onClick={() => onSelect(matchNum)} />
        );
      })}

      {/* R16 dots */}
      {R16_DEF.map(([n]) => (
        <InnerDot key={n} r={RA.r16} angle={R16_A[n]} match={gm(n)}
          isSelected={selected === n} size={7} onClick={() => onSelect(n)} />
      ))}

      {/* QF dots */}
      {QF_DEF.map(([n]) => (
        <InnerDot key={n} r={RA.qf} angle={QF_A[n]} match={gm(n)}
          isSelected={selected === n} size={8} onClick={() => onSelect(n)} />
      ))}

      {/* SF dots */}
      {SF_DEF.map(([n]) => (
        <InnerDot key={n} r={RA.sf} angle={SF_A[n]} match={gm(n)}
          isSelected={selected === n} size={9} onClick={() => onSelect(n)} />
      ))}

      {/* 3rd place dot at bottom */}
      <InnerDot r={RA.finalPt} angle={180} match={gm(103)}
        isSelected={selected === 103} size={7} onClick={() => onSelect(103)} label="3°" />

      {/* Final / trophy center */}
      <FinalCenter match={gm(104)} isSelected={selected === 104} onClick={() => onSelect(104)} />

      {/* Stage ring labels */}
      <StageRingLabels />
    </svg>
  );
}

// ─── OuterSlot: team dot + abbreviation at outer ring ────────────────────────

function OuterSlot({
  angle, team, won, lost, isSelected, onClick,
}: {
  angle: number; team: string; won: boolean; lost: boolean;
  isSelected: boolean; onClick: () => void;
}) {
  const real = isReal(team);
  const [dx, dy] = pt(RA.outer, angle);
  const [fx, fy] = pt(RA.label - 8, angle);
  const [lx, ly] = pt(RA.label + 13, angle);

  const dotR = real ? 5 : 3.5;
  const dotFill = !real ? "rgba(255,255,255,0.1)"
    : won ? "#f0b429"
    : isSelected ? "#d5ff3f"
    : lost ? "rgba(255,255,255,0.25)"
    : "rgba(255,255,255,0.55)";

  // text rotation: always readable
  const isLeft = angle >= 180;
  const textRot = isLeft ? angle + 90 : angle - 90;

  const textFill = !real ? "rgba(255,255,255,0.18)"
    : won ? "#f0b429"
    : lost ? "rgba(255,255,255,0.3)"
    : "rgba(255,255,255,0.72)";

  const flag = teamFlagEmoji(team);

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }} role="button" aria-label={team}>
      {/* larger hit area */}
      <circle cx={dx} cy={dy} r={14} fill="transparent" />

      {/* dot */}
      <circle cx={dx} cy={dy} r={dotR}
        fill={dotFill}
        stroke={won ? "rgba(240,180,41,0.5)" : isSelected ? "rgba(213,255,63,0.5)" : "none"}
        strokeWidth={1.5}
        filter={won ? "url(#sglow)" : undefined} />

      {real && (
        <g>
          <circle
            cx={fx}
            cy={fy}
            r={won || isSelected ? 9.5 : 8.5}
            fill={won ? "rgba(240,180,41,0.16)" : isSelected ? "rgba(213,255,63,0.12)" : "rgba(0,0,0,0.42)"}
            stroke={won ? "rgba(240,180,41,0.5)" : isSelected ? "rgba(213,255,63,0.42)" : "rgba(255,255,255,0.12)"}
            strokeWidth={0.8}
          />
          <text
            x={fx}
            y={fy + 0.2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            style={{ userSelect: "none", pointerEvents: "none" }}
          >
            {flag}
          </text>
        </g>
      )}

      {/* team abbreviation */}
      {real && (
        <text
          x={lx} y={ly}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={8.2} fontWeight={won ? "900" : "750"} fontFamily="Arial, Helvetica, sans-serif"
          fill={textFill}
          transform={`rotate(${textRot}, ${lx}, ${ly})`}
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {teamCode(team)}
        </text>
      )}
    </g>
  );
}

// ─── InnerDot: match node on inner rings ──────────────────────────────────────

function InnerDot({
  r, angle, match, isSelected, size = 7, label, onClick,
}: {
  r: number; angle: number; match: MundialMatch | undefined;
  isSelected: boolean; size?: number; label?: string; onClick: () => void;
}) {
  const [x, y] = pt(r, angle);
  const wt = winnerTeam(match);
  const hasResult = match?.homeFinalScore != null;
  const hasTeams = match && isReal(match.homeTeam) && isReal(match.awayTeam);

  const fill = hasResult && wt ? "#f0b429"
    : isSelected ? "#d5ff3f"
    : hasTeams ? "rgba(255,255,255,0.42)"
    : "rgba(255,255,255,0.14)";

  const stroke = isSelected ? "#d5ff3f"
    : hasResult ? "rgba(240,180,41,0.45)"
    : "rgba(255,255,255,0.1)";

  // label position: outward from dot
  const [lx, ly] = pt(r + size + 9, angle);
  const isLeft = angle >= 180;
  const anchor = isLeft ? "end" : "start";

  const labelText = label ?? (wt && isReal(wt) ? teamCode(wt) : null);
  const flag = wt && isReal(wt) ? teamFlagEmoji(wt) : "";

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <circle cx={x} cy={y} r={size + 7} fill="transparent" />
      <circle cx={x} cy={y} r={size}
        fill={fill} stroke={stroke} strokeWidth={isSelected ? 2 : 1}
        filter={(hasResult && wt) ? "url(#sglow)" : undefined} />

      {labelText && (
        <g>
          {flag ? (
            <text
              x={isLeft ? lx - 15 : lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={10}
              style={{ userSelect: "none", pointerEvents: "none" }}
            >
              {flag}
            </text>
          ) : null}
          <text x={isLeft ? lx - 18 : lx + 14} y={ly}
            textAnchor={anchor} dominantBaseline="middle"
            fontSize={7.5} fontWeight="800" fontFamily="Arial, Helvetica, sans-serif"
            fill={hasResult && wt ? "rgba(240,180,41,0.95)" : "rgba(255,255,255,0.58)"}
            style={{ userSelect: "none", pointerEvents: "none" }}>
            {labelText}
          </text>
        </g>
      )}
    </g>
  );
}

// ─── Final center: trophy + final match ──────────────────────────────────────

function FinalCenter({
  match, isSelected, onClick,
}: {
  match: MundialMatch | undefined; isSelected: boolean; onClick: () => void;
}) {
  const wt = winnerTeam(match);
  const hasResult = match?.homeFinalScore != null;

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }} role="button" aria-label="Final">
      {/* Hit area */}
      <circle cx={CX} cy={CY} r={36} fill="transparent" />

      {/* Outer ring */}
      <circle cx={CX} cy={CY} r={34}
        fill="rgba(0,0,0,0.55)"
        stroke={isSelected ? "#d5ff3f" : hasResult ? "#f0b429" : "rgba(240,180,41,0.35)"}
        strokeWidth={isSelected ? 2.5 : 1.5}
        filter={hasResult ? "url(#glow)" : undefined} />

      {/* Trophy SVG (scaled inline) */}
      <g transform={`translate(${CX - 11}, ${CY - 15})`}>
        <svg width={22} height={30} viewBox="0 0 48 60">
          <path d="M10 52h28v8H10z" fill="#7a4d08" />
          <path d="M10 52h28v4H10z" fill="#a06610" />
          <path d="M10 52L16 30l10 13L24 8l4 26 10-13 8 31z"
            fill={hasResult ? "#f0b429" : "rgba(240,180,41,0.55)"}
            stroke="#9a5e0a" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="16" cy="30" r="4" fill={hasResult ? "#d5ff3f" : "rgba(213,255,63,0.5)"} stroke="#9a5e0a" strokeWidth="1.2" />
          <circle cx="24" cy="8" r="4" fill={hasResult ? "#d5ff3f" : "rgba(213,255,63,0.5)"} stroke="#9a5e0a" strokeWidth="1.2" />
          <circle cx="32" cy="30" r="4" fill={hasResult ? "#d5ff3f" : "rgba(213,255,63,0.5)"} stroke="#9a5e0a" strokeWidth="1.2" />
        </svg>
      </g>

      {/* Winner label below trophy */}
      {wt && isReal(wt) && (
        <>
          <text x={CX} y={CY + 19}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={12}
            style={{ userSelect: "none", pointerEvents: "none" }}>
            {teamFlagEmoji(wt)}
          </text>
          <text x={CX} y={CY + 31}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={7.2} fontWeight="900" fontFamily="Arial, Helvetica, sans-serif"
            fill="#f0b429" style={{ userSelect: "none", pointerEvents: "none" }}>
            {teamCode(wt)}
          </text>
        </>
      )}

      {/* "FINAL" label if no result yet */}
      {!hasResult && (
        <text x={CX} y={CY + 22}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={6.5} fontWeight="700" fontFamily="Arial, Helvetica, sans-serif"
          fill="rgba(240,180,41,0.5)" style={{ userSelect: "none", pointerEvents: "none" }}>
          FINAL
        </text>
      )}
    </g>
  );
}

// ─── Stage ring labels ────────────────────────────────────────────────────────

function StageRingLabels() {
  const labels: [number, string][] = [
    [RA.r16, "R16"],
    [RA.qf, "4tos"],
    [RA.sf, "Semis"],
  ];
  return (
    <>
      {labels.map(([r, label]) => (
        <text key={label}
          x={CX} y={CY - r - 5}
          textAnchor="middle" dominantBaseline="auto"
          fontSize={6.5} fontWeight="600" fontFamily="Arial, Helvetica, sans-serif"
          fill="rgba(255,255,255,0.22)"
          style={{ userSelect: "none", pointerEvents: "none" }}>
          {label}
        </text>
      ))}
      {/* 3rd place label */}
      <text x={CX} y={CY + RA.finalPt + 16}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={6.5} fontWeight="600" fontFamily="Arial, Helvetica, sans-serif"
        fill="rgba(255,255,255,0.22)"
        style={{ userSelect: "none", pointerEvents: "none" }}>
        3er Lugar
      </text>
    </>
  );
}

// ─── Mini Podium (top 3 leaderboard) ─────────────────────────────────────────

const PODIUM_STYLES = [
  {
    wrap: "border-[#f0b429]/45 bg-[#211707]/80 ring-1 ring-[#f0b429]/20",
    rank: "text-[#f0b429] border-[#f0b429]/50 bg-[#f0b429]/15 shadow-[0_0_12px_rgba(240,180,41,0.2)]",
    pts: "text-[#f0b429]",
    bar: "bg-[#f0b429]",
    badge: "border-[#f0b429]/30 bg-[#f0b429]/12 text-[#d5ff3f]",
    accent: "text-[#d5ff3f]",
  },
  {
    wrap: "border-white/18 bg-black/35",
    rank: "text-[#62ffe6] border-[#62ffe6]/45 bg-[#071d2a] shadow-[0_0_10px_rgba(98,255,230,0.15)]",
    pts: "text-[#62ffe6]",
    bar: "bg-[#62ffe6]/70",
    badge: "bg-black/40 text-[#d5ff3f]",
    accent: "text-[#62ffe6]",
  },
  {
    wrap: "border-[#ffb15f]/35 bg-[#2a120b]/70",
    rank: "text-[#ffb15f] border-[#ffb15f]/50 bg-[#200d03] shadow-[0_0_8px_rgba(255,177,95,0.15)]",
    pts: "text-[#ffb15f]",
    bar: "bg-[#ffb15f]/70",
    badge: "bg-black/40 text-[#d5ff3f]",
    accent: "text-[#ffb15f]",
  },
];

function MiniPodium({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  const top3 = leaderboard.slice(0, 3);
  const maxPts = top3[0]?.totalPoints ?? 1;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#f0b429]/25 bg-[#04100a] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
      {/* grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(90deg,rgba(240,180,41,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />
      {/* gold top spotlight */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(240,180,41,0.14),transparent_70%)]" />
      {/* sparkles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
        <span className="absolute left-[5%] top-[12%] text-base text-[#f0b429] opacity-35">✦</span>
        <span className="absolute left-[20%] top-[6%] text-xs text-[#d5ff3f] opacity-25">★</span>
        <span className="absolute right-[8%] top-[10%] text-sm text-[#f0b429] opacity-30">✦</span>
        <span className="absolute right-[22%] top-[4%] text-xs text-[#62ffe6] opacity-20">★</span>
        <span className="absolute left-[48%] top-[3%] text-xs text-[#f0b429] opacity-18">✦</span>
      </div>

      {/* header */}
      <div className="relative border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#f0b429]/40 bg-[#f0b429] text-[#07110b] shadow-[0_0_14px_rgba(240,180,41,0.22)]">
            <Trophy className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d5ff3f]">Tabla de Líderes</p>
            <p className="text-sm font-black uppercase text-white">Top 3 · {leaderboard.length} participantes</p>
          </div>
        </div>
      </div>

      {/* podium cards */}
      <div className="relative grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">
        {top3.map((entry, i) => {
          const s = PODIUM_STYLES[i];
          const bar = maxPts > 0 ? Math.round((entry.totalPoints / maxPts) * 100) : 0;
          const acc = accuracyPct(entry);
          const rank = i + 1;

          return (
            <div
              key={entry.normalizedName}
              className={cn("rounded-xl border p-3 shadow-[0_16px_40px_rgba(0,0,0,0.22)] sm:p-4", s.wrap)}
            >
              {/* rank + points */}
              <div className="mb-2 flex items-start justify-between gap-1">
                <span className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-sm font-black",
                  s.rank
                )}>
                  {rank === 1 ? (
                    <svg viewBox="0 0 48 30" className="h-5 w-7">
                      <path d="M4 25h40v5H4z" fill="#7a4d08" />
                      <path d="M4 25L9 7l9 11L24 3l6 15 9-11 5 18z" fill="#f0b429" stroke="#9a5e0a" strokeWidth="1.5" strokeLinejoin="round" />
                      <circle cx="9" cy="7" r="3" fill="#d5ff3f" stroke="#9a5e0a" strokeWidth="0.8" />
                      <circle cx="24" cy="3" r="3" fill="#d5ff3f" stroke="#9a5e0a" strokeWidth="0.8" />
                      <circle cx="39" cy="7" r="3" fill="#d5ff3f" stroke="#9a5e0a" strokeWidth="0.8" />
                    </svg>
                  ) : rank}
                </span>
                <div className="text-right">
                  <span className={cn("text-lg font-black tabular-nums leading-none sm:text-xl", s.pts)}>
                    {entry.totalPoints}
                  </span>
                  <span className="ml-0.5 text-[9px] font-bold text-white/30">pts</span>
                </div>
              </div>

              {/* name */}
              <p className="mb-2 truncate text-xs font-black text-white sm:text-sm" title={entry.playerName}>
                {entry.playerName}
              </p>

              {/* progress bar */}
              <div className="mb-2.5 h-1 overflow-hidden rounded-full bg-white/10">
                <div className={cn("h-full rounded-full transition-all", s.bar)} style={{ width: `${bar}%` }} />
              </div>

              {/* stats */}
              <div className="grid grid-cols-3 gap-1">
                <PodiumStat label="Exact." value={entry.exactScores} accent={s.accent} />
                <PodiumStat label="Res." value={entry.correctOutcomes} accent="text-white/55" />
                <PodiumStat label="Prec." value={`${acc}%`} accent="text-white/55" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PodiumStat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-md border border-white/8 bg-black/25 px-1 py-1 text-center">
      <p className="text-[8px] font-bold uppercase text-white/35 sm:text-[9px]">{label}</p>
      <p className={cn("text-xs font-black leading-none sm:text-sm", accent)}>{value}</p>
    </div>
  );
}

// ─── Match detail card ────────────────────────────────────────────────────────

function MatchCard({
  match, pred, onClose,
}: {
  match: MundialMatch; pred: Prediction | null; onClose: () => void;
}) {
  const w = mwinner(match);
  const hasResult = match.homeFinalScore != null;
  const hasPred = pred != null;

  const score = (side: "home" | "away") => {
    const fs = side === "home" ? match.homeFinalScore : match.awayFinalScore;
    return fs != null ? fs : "–";
  };

  const predScore = hasPred ? `${pred.homeScore}-${pred.awayScore}` : null;

  let predKind: "exact" | "outcome" | "miss" | "pending" = "pending";
  if (hasPred && hasResult) {
    const exact = pred.homeScore === match.homeFinalScore && pred.awayScore === match.awayFinalScore;
    const outcome = (match.homeFinalScore! > match.awayFinalScore! ? "home" : match.awayFinalScore! > match.homeFinalScore! ? "away" : "draw")
      === (pred.homeScore > pred.awayScore ? "home" : pred.awayScore > pred.homeScore ? "away" : "draw");
    predKind = exact ? "exact" : outcome ? "outcome" : "miss";
  }

  const kindStyle = {
    exact: "border-[#d5ff3f]/55 bg-[#1a2206] text-[#d5ff3f]",
    outcome: "border-[#62ffe6]/55 bg-[#071d2a] text-[#62ffe6]",
    miss: "border-[#ff6a3d]/55 bg-[#2a120b] text-[#ffb15f]",
    pending: "border-white/15 bg-white/5 text-white/45",
  }[predKind];

  const kindLabel = { exact: "Exacto +3", outcome: "Resultado +1", miss: "Fallo", pending: "Pendiente" }[predKind];

  return (
    <div className="overflow-hidden rounded-xl border border-[#f0b429]/30 bg-[#06140f] shadow-[0_24px_70px_rgba(0,0,0,0.50)]">
      {/* header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#12351f] px-4 py-3 [background-image:linear-gradient(135deg,rgba(240,180,41,0.16),transparent_55%)]">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#f0b429]">
            {match.group ? `Grupo ${match.group} ·` : ""} {match.stageLabel} · Partido #{match.number}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-white/45">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{formatKickoff(match.kickoffAt)}</span>
            {match.venue && (
              <>
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{match.venue}</span>
              </>
            )}
          </div>
        </div>
        <button
          type="button" onClick={onClose}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/18 bg-black/20 text-white/60 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* score row */}
      <div className="flex items-center justify-center gap-4 px-4 py-5">
        {/* home */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <Flag team={match.homeTeam} size="lg" />
          <p className={cn("text-center text-sm font-black",
            w === "home" ? "text-[#f0b429]" : "text-white")}>
            {match.homeTeam}
          </p>
        </div>

        {/* score */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className={cn("text-4xl font-black tabular-nums sm:text-5xl",
              w === "home" ? "text-[#f0b429]" : "text-white")}>
              {score("home")}
            </span>
            <span className="text-2xl font-black text-white/30">:</span>
            <span className={cn("text-4xl font-black tabular-nums sm:text-5xl",
              w === "away" ? "text-[#f0b429]" : "text-white")}>
              {score("away")}
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-white/35">
            {!hasResult ? "Por jugar" : w ? `Gana ${teamCode(w === "home" ? match.homeTeam : match.awayTeam)}` : "Empate"}
          </span>
        </div>

        {/* away */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <Flag team={match.awayTeam} size="lg" />
          <p className={cn("text-center text-sm font-black",
            w === "away" ? "text-[#f0b429]" : "text-white")}>
            {match.awayTeam}
          </p>
        </div>
      </div>

      {/* prediction row */}
      {hasPred && (
        <div className="flex items-center justify-between gap-3 border-t border-white/8 bg-black/25 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-white/45">Tu pick:</span>
            <span className="rounded-md border border-[#62ffe6]/40 bg-[#071d2a] px-2.5 py-1 text-sm font-black tabular-nums text-[#62ffe6]">
              {predScore}
            </span>
            {pred.winnerPick && (
              <span className="rounded-md border border-[#d5ff3f]/35 bg-[#1a2206] px-2 py-1 text-xs font-black text-[#d5ff3f]">
                pen. {teamCode(pred.winnerPick === "home" ? match.homeTeam : match.awayTeam)}
              </span>
            )}
          </div>
          {hasResult && (
            <span className={cn("rounded-md border px-2.5 py-1 text-xs font-black", kindStyle)}>
              {kindLabel}
            </span>
          )}
        </div>
      )}

      {!hasPred && (
        <div className="border-t border-white/8 bg-black/20 px-4 py-2.5">
          <p className="text-xs font-bold text-white/35">Sin predicción guardada en este partido</p>
        </div>
      )}
    </div>
  );
}

// ─── Legend dot ───────────────────────────────────────────────────────────────

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/45">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
