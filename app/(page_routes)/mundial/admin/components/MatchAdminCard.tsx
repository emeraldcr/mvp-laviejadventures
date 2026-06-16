"use client";

import { useEffect, useState } from "react";
import { BadgePercent, BarChart3, Braces, Check, ChevronDown, ChevronUp, ClipboardPaste, Loader2, Lock, LockOpen, Minus, Plus, Save, Trash2, Tv2, Users } from "lucide-react";
import { bettingFavoriteLabel, type BettingMarket } from "@/lib/mundial/betting";
import type { AdminLiveMatchEvent, AdminLiveMatchStats, AdminLiveTeamStats, AdminMatch, AdminRosterPlayer, LiveEventTeam, LiveEventType, LiveMatchStatus } from "../adminTypes";
import { cn, formatKickoff, getCountryFlag } from "../../utils";
import { Flag } from "../../components/Flag";

type MatchAdminCardProps = {
  match: AdminMatch;
  onPatch: (matchId: string, patch: Record<string, unknown>) => Promise<void>;
};

const LIVE_STATUS_OPTIONS: Array<{ value: LiveMatchStatus; label: string; color: string }> = [
  { value: "scheduled", label: "Prog.", color: "bg-slate-200 text-slate-700" },
  { value: "live", label: "Live", color: "bg-red-600 text-white" },
  { value: "halftime", label: "Descanso", color: "bg-amber-500 text-white" },
  { value: "fulltime", label: "FT", color: "bg-slate-950 text-white" },
];

const LIVE_EVENT_OPTIONS: Array<{ value: LiveEventType; label: string }> = [
  { value: "goal", label: "Gol" },
  { value: "penalty", label: "Penal" },
  { value: "yellow", label: "Amarilla" },
  { value: "red", label: "Roja" },
  { value: "var", label: "VAR" },
  { value: "substitution", label: "Cambio" },
  { value: "note", label: "Nota" },
];

const LIVE_STATS_FIELDS: Array<{ key: keyof AdminLiveTeamStats; label: string; max?: number; suffix?: string; decimal?: boolean }> = [
  { key: "possessionPct", label: "Posesión", max: 100, suffix: "%" },
  { key: "shots", label: "Tiros (attempts)" },
  { key: "shotsOnTarget", label: "Tiros a marco" },
  { key: "assists", label: "Asistencias" },
  { key: "passesCompleted", label: "Pases completados" },
  { key: "distanceCovered", label: "Distancia km", suffix: "km", decimal: true },
  { key: "topSpeed", label: "Vel. máxima", suffix: "km/h", decimal: true },
  { key: "foulsFor", label: "Faltas recibidas" },
  { key: "yellowCards", label: "Amarillas" },
  { key: "redCards", label: "Rojas" },
  { key: "corners", label: "Córners" },
  { key: "fouls", label: "Faltas cometidas" },
  { key: "saves", label: "Atajadas" },
];

const DECIMAL_STAT_KEYS: ReadonlyArray<keyof AdminLiveTeamStats> = ["distanceCovered", "topSpeed"];

const STAT_JSON_TEMPLATE = {
  home: {
    shots: 0, shotsOnTarget: 0, assists: 0, passesCompleted: 0,
    distanceCovered: 0.0, topSpeed: 0.0, foulsFor: 0, possessionPct: 50,
    yellowCards: 0, redCards: 0, corners: 0, fouls: 0, saves: 0,
  },
  away: {
    shots: 0, shotsOnTarget: 0, assists: 0, passesCompleted: 0,
    distanceCovered: 0.0, topSpeed: 0.0, foulsFor: 0, possessionPct: 50,
    yellowCards: 0, redCards: 0, corners: 0, fouls: 0, saves: 0,
  },
};

function rosterForTeam(match: AdminMatch, team: LiveEventTeam) {
  if (team === "home") return match.homeRoster;
  if (team === "away") return match.awayRoster;
  return [];
}

function teamLabel(match: AdminMatch, team: LiveEventTeam) {
  if (team === "home") return match.homeTeam;
  if (team === "away") return match.awayTeam;
  return "General";
}

function playerOptionLabel(player: AdminRosterPlayer) {
  return [
    player.squadNumber !== null ? `#${player.squadNumber}` : null,
    player.pos || null,
    player.club || null,
    player.caps !== null ? `${player.caps} caps` : null,
    player.goals !== null ? `${player.goals} goles` : null,
  ].filter(Boolean).join(" - ");
}

function safeInc(value: string) {
  const n = Number(value);
  return String(Number.isFinite(n) ? Math.max(0, Math.trunc(n)) + 1 : 1);
}

function safeDec(value: string) {
  const n = Number(value);
  return String(Number.isFinite(n) ? Math.max(0, Math.trunc(n) - 1) : 0);
}

function parseMinuteInput(value: string) {
  if (value === "") return null;
  const minute = Number(value);
  return Number.isFinite(minute) ? Math.max(0, Math.trunc(minute)) : null;
}

function numberDraft(value: number | null | undefined) {
  return typeof value === "number" ? String(value) : "";
}

function numberOrNull(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function liveEventSignature(event: Pick<AdminLiveMatchEvent, "type" | "team" | "minute" | "player" | "note">) {
  return [
    event.type,
    event.team ?? "general",
    event.minute ?? "",
    event.player.trim().toUpperCase(),
    event.note.trim().toUpperCase(),
  ].join("|");
}

function updateTeamStat(
  stats: AdminLiveMatchStats,
  team: Exclude<LiveEventTeam, null>,
  key: keyof AdminLiveTeamStats,
  value: number | null
): AdminLiveMatchStats {
  return {
    ...stats,
    [team]: {
      ...stats[team],
      [key]: value,
    },
  };
}

function incrementTeamStat(
  stats: AdminLiveMatchStats,
  team: Exclude<LiveEventTeam, null>,
  key: keyof AdminLiveTeamStats
): AdminLiveMatchStats {
  const current = stats[team][key] ?? 0;
  return updateTeamStat(stats, team, key, current + 1);
}

function StatBar({ label, count, total, barColor, textColor }: {
  label: string; count: number; total: number; barColor: string; textColor: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-[11px] font-black uppercase tracking-wide text-white/40">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn("w-8 shrink-0 text-right text-xs font-black tabular-nums", textColor)}>{count}/{total}</span>
      <span className="w-8 shrink-0 text-right text-[11px] font-bold text-white/30">{pct}%</span>
    </div>
  );
}

function ScoreSpinner({ value, onChange, disabled, focusColor = "focus:border-emerald-600 focus:ring-emerald-100" }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; focusColor?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(safeDec(value))}
        disabled={disabled || value === "" || Number(value) <= 0}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        min={0}
        max={30}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        disabled={disabled}
        className={cn(
          "h-11 w-14 rounded-lg border border-slate-300 bg-white text-center text-2xl font-black tabular-nums text-slate-950 outline-none transition focus:ring-4",
          focusColor
        )}
      />
      <button
        type="button"
        onClick={() => onChange(safeInc(value))}
        disabled={disabled}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function MatchAdminCard({ match, onPatch }: MatchAdminCardProps) {
  const hasResult = match.homeFinalScore !== null && match.awayFinalScore !== null;
  const homeFlag = getCountryFlag(match.homeTeam);
  const awayFlag = getCountryFlag(match.awayTeam);

  const [homeScore, setHomeScore] = useState(match.homeFinalScore !== null ? String(match.homeFinalScore) : "");
  const [awayScore, setAwayScore] = useState(match.awayFinalScore !== null ? String(match.awayFinalScore) : "");
  const [actualWinner, setActualWinner] = useState<"home" | "away" | "">(match.actualWinner ?? "");
  const [liveStatus, setLiveStatus] = useState<LiveMatchStatus>(match.liveStatus);
  const [liveMinute, setLiveMinute] = useState(match.liveMinute !== null ? String(match.liveMinute) : "");
  const [homeLiveScore, setHomeLiveScore] = useState(match.homeLiveScore !== null ? String(match.homeLiveScore) : "");
  const [awayLiveScore, setAwayLiveScore] = useState(match.awayLiveScore !== null ? String(match.awayLiveScore) : "");
  const [liveNote, setLiveNote] = useState(match.liveNote);
  const [liveEvents, setLiveEvents] = useState<AdminLiveMatchEvent[]>(match.liveEvents);
  const [liveStats, setLiveStats] = useState<AdminLiveMatchStats>(match.liveStats);
  const [marketMode, setMarketMode] = useState<BettingMarket>(match.bettingFavorite?.market ?? "h2h_odds");
  const [marketSource, setMarketSource] = useState(match.bettingFavorite?.source ?? "");
  const [marketSourceUrl, setMarketSourceUrl] = useState(match.bettingFavorite?.sourceUrl ?? "");
  const [marketBookmaker, setMarketBookmaker] = useState(match.bettingFavorite?.bookmaker ?? "");
  const [marketHomePrice, setMarketHomePrice] = useState(numberDraft(match.bettingFavorite?.homePrice));
  const [marketDrawPrice, setMarketDrawPrice] = useState(numberDraft(match.bettingFavorite?.drawPrice));
  const [marketAwayPrice, setMarketAwayPrice] = useState(numberDraft(match.bettingFavorite?.awayPrice));
  const [marketHomeBetPct, setMarketHomeBetPct] = useState(numberDraft(match.bettingFavorite?.homeBetPct));
  const [marketDrawBetPct, setMarketDrawBetPct] = useState(numberDraft(match.bettingFavorite?.drawBetPct));
  const [marketAwayBetPct, setMarketAwayBetPct] = useState(numberDraft(match.bettingFavorite?.awayBetPct));
  const [marketNote, setMarketNote] = useState(match.bettingFavorite?.note ?? "");
  const [draftType, setDraftType] = useState<LiveEventType>("goal");
  const [draftTeam, setDraftTeam] = useState<LiveEventTeam>("home");
  const [draftMinute, setDraftMinute] = useState(match.liveMinute !== null ? String(match.liveMinute) : "");
  const [draftPlayer, setDraftPlayer] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingClose, setIsTogglingClose] = useState(false);
  const [isSavingLive, setIsSavingLive] = useState(false);
  const [isSavingMarket, setIsSavingMarket] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liveSaved, setLiveSaved] = useState(false);
  const [marketSaved, setMarketSaved] = useState(false);
  const [error, setError] = useState("");
  const [liveError, setLiveError] = useState("");
  const [marketError, setMarketError] = useState("");
  const [showEdit, setShowEdit] = useState(!hasResult);
  const [showLive, setShowLive] = useState(match.liveStatus !== "scheduled");
  const [showMarket, setShowMarket] = useState(Boolean(match.bettingFavorite));
  const [showStatsJson, setShowStatsJson] = useState(false);
  const [statsJsonText, setStatsJsonText] = useState("");
  const [statsJsonError, setStatsJsonError] = useState("");

  useEffect(() => {
    setHomeScore(match.homeFinalScore !== null ? String(match.homeFinalScore) : "");
    setAwayScore(match.awayFinalScore !== null ? String(match.awayFinalScore) : "");
    setActualWinner(match.actualWinner ?? "");
    setLiveStatus(match.liveStatus);
    setLiveMinute(match.liveMinute !== null ? String(match.liveMinute) : "");
    setHomeLiveScore(match.homeLiveScore !== null ? String(match.homeLiveScore) : "");
    setAwayLiveScore(match.awayLiveScore !== null ? String(match.awayLiveScore) : "");
    setLiveNote(match.liveNote);
    setLiveEvents(match.liveEvents);
    setLiveStats(match.liveStats);
    setMarketMode(match.bettingFavorite?.market ?? "h2h_odds");
    setMarketSource(match.bettingFavorite?.source ?? "");
    setMarketSourceUrl(match.bettingFavorite?.sourceUrl ?? "");
    setMarketBookmaker(match.bettingFavorite?.bookmaker ?? "");
    setMarketHomePrice(numberDraft(match.bettingFavorite?.homePrice));
    setMarketDrawPrice(numberDraft(match.bettingFavorite?.drawPrice));
    setMarketAwayPrice(numberDraft(match.bettingFavorite?.awayPrice));
    setMarketHomeBetPct(numberDraft(match.bettingFavorite?.homeBetPct));
    setMarketDrawBetPct(numberDraft(match.bettingFavorite?.drawBetPct));
    setMarketAwayBetPct(numberDraft(match.bettingFavorite?.awayBetPct));
    setMarketNote(match.bettingFavorite?.note ?? "");
    setDraftMinute(match.liveMinute !== null ? String(match.liveMinute) : "");
    setDraftPlayer("");
    setDraftNote("");
    if (match.liveStatus !== "scheduled") setShowLive(true);
    if (match.bettingFavorite) setShowMarket(true);
  }, [match]);

  const isKnockout = match.stage !== "group";
  const parsedHome = homeScore === "" ? null : Number(homeScore);
  const parsedAway = awayScore === "" ? null : Number(awayScore);
  const isTied = parsedHome !== null && parsedAway !== null && parsedHome === parsedAway;
  const needsWinner = isKnockout && isTied;
  const isLiveNow = liveStatus === "live";
  const isHalftime = liveStatus === "halftime";
  const homePlayersListId = `players-${match.id}-home`;
  const awayPlayersListId = `players-${match.id}-away`;
  const draftPlayersListId =
    draftTeam === "home" ? homePlayersListId : draftTeam === "away" ? awayPlayersListId : undefined;
  const draftRoster = rosterForTeam(match, draftTeam);
  const marketSummary = match.bettingFavorite ? bettingFavoriteLabel(match.bettingFavorite) : "Sin dato";

  async function handleSaveScore() {
    setError("");
    setSaved(false);
    const patch: Record<string, unknown> = { homeFinalScore: parsedHome, awayFinalScore: parsedAway };
    if (isKnockout) patch.actualWinner = actualWinner === "home" || actualWinner === "away" ? actualWinner : null;
    setIsSaving(true);
    try {
      await onPatch(match.id, patch);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleClose() {
    setError("");
    setIsTogglingClose(true);
    try {
      await onPatch(match.id, { forceClosed: !match.forceClosed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setIsTogglingClose(false);
    }
  }

  async function handleSaveLive() {
    setLiveError("");
    setLiveSaved(false);
    setIsSavingLive(true);
    try {
      await onPatch(match.id, {
        liveStatus,
        liveMinute: liveMinute === "" ? null : Number(liveMinute),
        homeLiveScore: homeLiveScore === "" ? null : Number(homeLiveScore),
        awayLiveScore: awayLiveScore === "" ? null : Number(awayLiveScore),
        liveNote,
        liveEvents,
        liveStats,
      });
      setLiveSaved(true);
      setTimeout(() => setLiveSaved(false), 2500);
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : "Error guardando live.");
    } finally {
      setIsSavingLive(false);
    }
  }

  async function handleSaveMarket() {
    setMarketError("");
    setMarketSaved(false);
    setIsSavingMarket(true);
    try {
      await onPatch(match.id, {
        bettingFavorite: {
          market: marketMode,
          source: marketSource,
          sourceUrl: marketSourceUrl,
          bookmaker: marketBookmaker,
          homePrice: numberOrNull(marketHomePrice),
          drawPrice: numberOrNull(marketDrawPrice),
          awayPrice: numberOrNull(marketAwayPrice),
          homeBetPct: numberOrNull(marketHomeBetPct),
          drawBetPct: numberOrNull(marketDrawBetPct),
          awayBetPct: numberOrNull(marketAwayBetPct),
          note: marketNote,
        },
      });
      setMarketSaved(true);
      setTimeout(() => setMarketSaved(false), 2500);
    } catch (err) {
      setMarketError(err instanceof Error ? err.message : "Error guardando favorito.");
    } finally {
      setIsSavingMarket(false);
    }
  }

  async function handleClearMarket() {
    setMarketError("");
    setMarketSaved(false);
    setIsSavingMarket(true);
    try {
      await onPatch(match.id, { bettingFavorite: null });
      setMarketSaved(true);
      setTimeout(() => setMarketSaved(false), 2500);
    } catch (err) {
      setMarketError(err instanceof Error ? err.message : "Error limpiando favorito.");
    } finally {
      setIsSavingMarket(false);
    }
  }

  function addLiveEvent(
    type: LiveEventType,
    team: LiveEventTeam = null,
    player = "",
    note = "",
    minuteValue = liveMinute
  ) {
    const nextEvent: AdminLiveMatchEvent = {
      id: `${Date.now()}-${liveEvents.length}`,
      type,
      team,
      minute: parseMinuteInput(minuteValue),
      player: player.trim(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    const signature = liveEventSignature(nextEvent);
    if (liveEvents.some((event) => liveEventSignature(event) === signature)) return;

    if ((type === "goal" || type === "penalty") && team === "home") setHomeLiveScore((v) => safeInc(v));
    if ((type === "goal" || type === "penalty") && team === "away") setAwayLiveScore((v) => safeInc(v));
    if ((type === "goal" || type === "penalty") && team) {
      setLiveStats((stats) => incrementTeamStat(incrementTeamStat(stats, team, "shots"), team, "shotsOnTarget"));
    }
    if (type === "yellow" && team) setLiveStats((stats) => incrementTeamStat(stats, team, "yellowCards"));
    if (type === "red" && team) setLiveStats((stats) => incrementTeamStat(stats, team, "redCards"));
    if (liveStatus === "scheduled") setLiveStatus("live");
    setLiveEvents((curr) => [nextEvent, ...curr]);
  }

  function selectEventPreset(type: LiveEventType, team: LiveEventTeam = null) {
    setDraftType(type);
    setDraftTeam(team);
    setDraftMinute(liveMinute);
    setDraftPlayer("");
    setDraftNote("");
  }

  function addDraftEvent() {
    addLiveEvent(draftType, draftTeam, draftPlayer, draftNote, draftMinute);
    setDraftPlayer("");
    setDraftNote("");
  }

  function updateLiveEvent(id: string, patch: Partial<AdminLiveMatchEvent>) {
    setLiveEvents((curr) => curr.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeLiveEvent(id: string) {
    setLiveEvents((curr) => curr.filter((e) => e.id !== id));
  }

  function updateLiveStat(team: Exclude<LiveEventTeam, null>, key: keyof AdminLiveTeamStats, value: string) {
    const parsed = value.trim() === "" ? null : Number(value);
    if (parsed === null || !Number.isFinite(parsed)) {
      setLiveStats((stats) => updateTeamStat(stats, team, key, null));
      return;
    }
    const isDecimal = (DECIMAL_STAT_KEYS as ReadonlyArray<string>).includes(key);
    const max = key === "possessionPct" ? 100 : undefined;
    const normalized = isDecimal
      ? Math.max(0, Math.round(parsed * 10) / 10)
      : Math.max(0, Math.trunc(max ? Math.min(max, parsed) : parsed));
    setLiveStats((stats) => updateTeamStat(stats, team, key, normalized));
  }

  function applyStatsJson() {
    setStatsJsonError("");
    try {
      const parsed = JSON.parse(statsJsonText) as Record<string, unknown>;
      const homeRaw = parsed.home ?? parsed.local ?? parsed.Home;
      const awayRaw = parsed.away ?? parsed.visita ?? parsed.Away;
      if (!homeRaw && !awayRaw) {
        setStatsJsonError('Formato inválido. Usa: { "home": {...}, "away": {...} }');
        return;
      }
      function parseVal(key: keyof AdminLiveTeamStats, val: unknown): number | null {
        if (val === null || val === undefined || val === "") return null;
        const n = Number(val);
        if (!Number.isFinite(n) || n < 0) return null;
        return (DECIMAL_STAT_KEYS as ReadonlyArray<string>).includes(key)
          ? Math.round(n * 10) / 10
          : Math.trunc(n);
      }
      function extractTeam(raw: unknown): AdminLiveTeamStats {
        const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
        return {
          possessionPct: parseVal("possessionPct", r.possessionPct ?? r.possession),
          shots: parseVal("shots", r.shots ?? r.attemptsAtGoal ?? r.attempts),
          shotsOnTarget: parseVal("shotsOnTarget", r.shotsOnTarget ?? r.attemptsOnTarget),
          yellowCards: parseVal("yellowCards", r.yellowCards ?? r.yellow),
          redCards: parseVal("redCards", r.redCards ?? r.red),
          corners: parseVal("corners", r.corners),
          fouls: parseVal("fouls", r.fouls ?? r.foulsCommitted),
          saves: parseVal("saves", r.saves),
          assists: parseVal("assists", r.assists),
          passesCompleted: parseVal("passesCompleted", r.passesCompleted ?? r.passes),
          distanceCovered: parseVal("distanceCovered", r.distanceCovered ?? r.distance),
          topSpeed: parseVal("topSpeed", r.topSpeed ?? r.speed),
          foulsFor: parseVal("foulsFor", r.foulsFor ?? r.foulsDrawn),
        };
      }
      setLiveStats({
        home: homeRaw ? extractTeam(homeRaw) : liveStats.home,
        away: awayRaw ? extractTeam(awayRaw) : liveStats.away,
      });
      setShowStatsJson(false);
      setStatsJsonText("");
    } catch {
      setStatsJsonError("JSON inválido. Revisa la sintaxis.");
    }
  }

  const statusLabel = hasResult
    ? `${match.homeFinalScore}–${match.awayFinalScore}`
    : match.forceClosed ? "Forzado" : match.closed ? "Cerrado" : "Abierto";
  const statusClass = hasResult
    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
    : match.forceClosed
      ? "border-slate-300 bg-slate-100 text-slate-600"
      : match.closed
        ? "border-slate-200 bg-slate-50 text-slate-500"
        : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-white shadow-sm",
        isLiveNow
          ? "border-red-400 ring-2 ring-red-100"
          : isHalftime
            ? "border-amber-400 ring-1 ring-amber-100"
            : hasResult
              ? "border-slate-200"
              : match.forceClosed
                ? "border-slate-300"
                : match.closed
                  ? "border-slate-200"
                  : "border-emerald-300 ring-1 ring-emerald-100"
      )}
    >
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-lg bg-slate-950 px-2 py-1 text-xs font-black tabular-nums text-white">#{match.number}</span>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-600">
              {match.group ? `Grupo ${match.group}` : match.stageLabel}
            </span>
            {isLiveNow && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2 py-1 text-xs font-black text-red-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
                EN VIVO{liveMinute ? ` ${liveMinute}′` : ""}
                {homeLiveScore !== "" && awayLiveScore !== "" ? ` · ${homeLiveScore}-${awayLiveScore}` : ""}
              </span>
            )}
            {isHalftime && (
              <span className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-black text-amber-700">
                DESCANSO{homeLiveScore !== "" && awayLiveScore !== "" ? ` · ${homeLiveScore}-${awayLiveScore}` : ""}
              </span>
            )}
            {match.predictorCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                <Users className="h-3 w-3" />{match.predictorCount}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-xs font-bold text-slate-400">
            {formatKickoff(match.kickoffAt)}{match.venue ? ` · ${match.venue}` : ""}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-lg border px-2.5 py-1 text-xs font-black tabular-nums", statusClass)}>
          {statusLabel}
        </span>
      </div>

      {/* ── SCORED: resultado panel ── */}
      {hasResult ? (
        <div className="mx-4 mb-1 overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <Flag team={match.homeTeam} size="lg" />
              <p className="text-center text-[11px] font-black leading-tight text-white/60">{match.homeTeam}</p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <span className="text-4xl font-black tabular-nums leading-none text-white">
                {match.homeFinalScore} – {match.awayFinalScore}
              </span>
              {match.actualWinner && (
                <span className="mt-1 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white/50">
                  Pasa {match.actualWinner === "home" ? match.homeTeam : match.awayTeam}
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <Flag team={match.awayTeam} size="lg" />
              <p className="text-center text-[11px] font-black leading-tight text-white/60">{match.awayTeam}</p>
            </div>
          </div>
          {match.predictorCount > 0 && (
            <div className="border-t border-white/10 px-4 pb-4 pt-3 space-y-2">
              <StatBar label="Exacto" count={match.exactCount} total={match.predictorCount} barColor="bg-emerald-500" textColor="text-emerald-400" />
              <StatBar label="Resultado" count={match.correctOutcomeCount} total={match.predictorCount} barColor="bg-sky-500" textColor="text-sky-400" />
              <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-white/30">
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/50">{homeFlag} {match.homeWinPicks}</span>
                <span>·</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/50">Emp {match.drawPicks}</span>
                <span>·</span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/50">{awayFlag} {match.awayWinPicks}</span>
              </div>
            </div>
          )}
          {match.predictorCount === 0 && (
            <p className="border-t border-white/10 px-4 py-3 text-xs font-bold text-white/30">Sin predicciones.</p>
          )}
        </div>
      ) : (
        <div className="mx-4 mb-3 flex items-center gap-2">
          <span className="text-xl" aria-hidden>{homeFlag}</span>
          <span className="font-black text-slate-950">{match.homeTeam}</span>
          <span className="font-bold text-slate-300">vs</span>
          <span className="font-black text-slate-950">{match.awayTeam}</span>
          <span className="text-xl" aria-hidden>{awayFlag}</span>
        </div>
      )}

      {/* ── EDIT RESULT SECTION ── */}
      <div className={cn("border-t border-slate-100 px-4 pb-4", hasResult ? "pt-0" : "pt-3")}>
        {hasResult && (
          <button
            type="button"
            onClick={() => setShowEdit((v) => !v)}
            className="flex w-full items-center justify-between gap-2 py-3 text-xs font-black text-slate-400 transition hover:text-slate-600"
          >
            <span>Editar resultado</span>
            {showEdit ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}

        {showEdit && (
          <>
            <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="truncate text-[10px] font-black uppercase text-slate-400">{match.homeTeam}</label>
                <ScoreSpinner value={homeScore} onChange={setHomeScore} />
              </div>
              <p className="pb-2 text-center text-xl font-black text-slate-300">–</p>
              <div className="flex flex-col items-end gap-1">
                <label className="truncate text-[10px] font-black uppercase text-slate-400">{match.awayTeam}</label>
                <ScoreSpinner value={awayScore} onChange={setAwayScore} />
              </div>
            </div>

            {isKnockout && (
              <div className="mb-3">
                <label className="mb-1 block text-xs font-black uppercase text-slate-500">
                  {needsWinner ? "Pasa (requerido — empate)" : "Pasa (opcional)"}
                </label>
                <select
                  value={actualWinner}
                  onChange={(e) => setActualWinner(e.target.value as "home" | "away" | "")}
                  className={cn("h-10 w-full rounded-lg border bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100", needsWinner ? "border-amber-400" : "border-slate-300")}
                >
                  <option value="">Sin definir</option>
                  <option value="home">{match.homeTeam}</option>
                  <option value="away">{match.awayTeam}</option>
                </select>
              </div>
            )}

            {error && (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleSaveScore()}
                disabled={isSaving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-3 py-2.5 text-sm font-black text-white transition hover:bg-emerald-800 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? "Guardado" : "Guardar resultado"}
              </button>
              <button
                type="button"
                onClick={() => void handleToggleClose()}
                disabled={isTogglingClose}
                title={match.forceClosed ? "Reabrir partido" : "Forzar cierre"}
                className={cn("inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-black transition disabled:opacity-50", match.forceClosed ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")}
              >
                {isTogglingClose ? <Loader2 className="h-4 w-4 animate-spin" /> : match.forceClosed ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </button>
            </div>
          </>
        )}

        {hasResult && !showEdit && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void handleToggleClose()}
              disabled={isTogglingClose}
              className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black transition disabled:opacity-50", match.forceClosed ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")}
            >
              {isTogglingClose ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : match.forceClosed ? <LockOpen className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {match.forceClosed ? "Reabrir" : "Forzar cierre"}
            </button>
          </div>
        )}
        {hasResult && !showEdit && error && (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</p>
        )}
      </div>

      {/* ── LIVE SECTION ── */}
      <div className="border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowMarket((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-xs font-black text-slate-400 transition hover:text-slate-600"
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <BadgePercent className="h-3.5 w-3.5 shrink-0" />
            <span>Favorito</span>
            {match.bettingFavorite && (
              <span className="min-w-0 truncate rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-black text-amber-700">
                {marketSummary}
              </span>
            )}
          </div>
          {showMarket ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showMarket && (
          <div className="space-y-3 px-4 pb-4 pt-2">
            <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
              <label className="grid gap-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Dato</span>
                <select
                  value={marketMode}
                  onChange={(e) => setMarketMode(e.target.value as BettingMarket)}
                  className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm font-black text-slate-700 outline-none focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                >
                  <option value="public_bets">Apuestas publicas</option>
                  <option value="h2h_odds">Cuotas 1X2</option>
                  <option value="bookmaker_consensus">Consenso casas</option>
                </select>
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">Fuente</span>
                  <input
                    type="text"
                    value={marketSource}
                    onChange={(e) => setMarketSource(e.target.value)}
                    placeholder="The Odds API, Action Network..."
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">Casa</span>
                  <input
                    type="text"
                    value={marketBookmaker}
                    onChange={(e) => setMarketBookmaker(e.target.value)}
                    placeholder="DraftKings, FanDuel..."
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                  />
                </label>
              </div>
            </div>

            <label className="grid gap-1">
              <span className="text-[10px] font-black uppercase text-slate-400">URL fuente</span>
              <input
                type="url"
                value={marketSourceUrl}
                onChange={(e) => setMarketSourceUrl(e.target.value)}
                placeholder="https://..."
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
              />
            </label>

            <div>
              <p className="mb-1 text-[10px] font-black uppercase text-slate-400">Porcentaje apuestas</p>
              <div className="grid grid-cols-3 gap-2">
                <MarketNumberInput label={match.homeTeam} value={marketHomeBetPct} onChange={setMarketHomeBetPct} suffix="%" />
                <MarketNumberInput label="Empate" value={marketDrawBetPct} onChange={setMarketDrawBetPct} suffix="%" />
                <MarketNumberInput label={match.awayTeam} value={marketAwayBetPct} onChange={setMarketAwayBetPct} suffix="%" />
              </div>
            </div>

            <div>
              <p className="mb-1 text-[10px] font-black uppercase text-slate-400">Cuotas decimales</p>
              <div className="grid grid-cols-3 gap-2">
                <MarketNumberInput label={match.homeTeam} value={marketHomePrice} onChange={setMarketHomePrice} step="0.01" />
                <MarketNumberInput label="Empate" value={marketDrawPrice} onChange={setMarketDrawPrice} step="0.01" />
                <MarketNumberInput label={match.awayTeam} value={marketAwayPrice} onChange={setMarketAwayPrice} step="0.01" />
              </div>
            </div>

            <textarea
              value={marketNote}
              onChange={(e) => setMarketNote(e.target.value)}
              placeholder="Nota opcional"
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
            />

            {marketError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{marketError}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleSaveMarket()}
                disabled={isSavingMarket}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-amber-600 bg-amber-500 px-3 py-2.5 text-sm font-black text-white transition hover:bg-amber-600 disabled:opacity-50"
              >
                {isSavingMarket ? <Loader2 className="h-4 w-4 animate-spin" /> : marketSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {marketSaved ? "Guardado" : "Guardar favorito"}
              </button>
              <button
                type="button"
                onClick={() => void handleClearMarket()}
                disabled={isSavingMarket || !match.bettingFavorite}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowLive((v) => !v)}
          className={cn(
            "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-xs font-black transition",
            isLiveNow ? "bg-red-50 text-red-700 hover:bg-red-100" :
            isHalftime ? "bg-amber-50 text-amber-700 hover:bg-amber-100" :
            "text-slate-400 hover:text-slate-600"
          )}
        >
          <div className="flex items-center gap-1.5">
            <Tv2 className="h-3.5 w-3.5" />
            <span>Live</span>
            {liveStatus !== "scheduled" && (
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-black uppercase", isLiveNow ? "bg-red-600 text-white" : isHalftime ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600")}>
                {LIVE_STATUS_OPTIONS.find((o) => o.value === liveStatus)?.label}
              </span>
            )}
          </div>
          {showLive ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showLive && (
          <div className="px-4 pb-4 pt-2 space-y-4">
            <datalist id={homePlayersListId}>
              {match.homeRoster.map((player) => (
                <option key={`${match.id}-home-${player.name}`} value={player.name} label={playerOptionLabel(player)} />
              ))}
            </datalist>
            <datalist id={awayPlayersListId}>
              {match.awayRoster.map((player) => (
                <option key={`${match.id}-away-${player.name}`} value={player.name} label={playerOptionLabel(player)} />
              ))}
            </datalist>

            {/* Status selector */}
            <div className="grid grid-cols-4 gap-1">
              {LIVE_STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLiveStatus(opt.value)}
                  className={cn(
                    "h-8 rounded-lg text-xs font-black transition",
                    liveStatus === opt.value ? opt.color : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Live scoreboard */}
            <div className="overflow-hidden rounded-xl bg-slate-950">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4">
                {/* Home */}
                <div className="flex flex-col items-center gap-2">
                  <Flag team={match.homeTeam} size="sm" />
                  <p className="max-w-full truncate text-center text-[10px] font-black uppercase text-white/50">{match.homeTeam}</p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHomeLiveScore((v) => safeDec(v))}
                      className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={homeLiveScore}
                      onChange={(e) => setHomeLiveScore(e.target.value)}
                      placeholder="0"
                      className="h-10 w-12 rounded-lg bg-white/10 text-center text-2xl font-black tabular-nums text-white outline-none focus:bg-white/15"
                    />
                    <button
                      type="button"
                      onClick={() => setHomeLiveScore((v) => safeInc(v))}
                      className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Minute */}
                <div className="flex flex-col items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={liveMinute}
                    onChange={(e) => setLiveMinute(e.target.value)}
                    placeholder="—"
                    className="h-9 w-14 rounded-lg bg-white/10 text-center text-sm font-black tabular-nums text-white outline-none focus:bg-white/15"
                  />
                  <p className="text-[10px] font-bold text-white/30">min</p>
                </div>

                {/* Away */}
                <div className="flex flex-col items-center gap-2">
                  <Flag team={match.awayTeam} size="sm" />
                  <p className="max-w-full truncate text-center text-[10px] font-black uppercase text-white/50">{match.awayTeam}</p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAwayLiveScore((v) => safeDec(v))}
                      className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={awayLiveScore}
                      onChange={(e) => setAwayLiveScore(e.target.value)}
                      placeholder="0"
                      className="h-10 w-12 rounded-lg bg-white/10 text-center text-2xl font-black tabular-nums text-white outline-none focus:bg-white/15"
                    />
                    <button
                      type="button"
                      onClick={() => setAwayLiveScore((v) => safeInc(v))}
                      className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live stats */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Stats del partido
                  </p>
                  <button
                    type="button"
                    onClick={() => { setShowStatsJson((v) => !v); setStatsJsonError(""); }}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-black transition",
                      showStatsJson
                        ? "border-sky-400 bg-sky-600 text-white"
                        : "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                    )}
                  >
                    <Braces className="h-3 w-3" />
                    JSON
                  </button>
                </div>
              </div>

              {/* JSON import panel */}
              {showStatsJson && (
                <div className="border-b border-slate-100 bg-sky-50 p-3 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wide text-sky-700">
                    Pegar JSON de stats (del broadcast / AI)
                  </p>
                  <textarea
                    value={statsJsonText}
                    onChange={(e) => setStatsJsonText(e.target.value)}
                    placeholder={'{ "home": { "shots": 2, "shotsOnTarget": 1, ... }, "away": { ... } }'}
                    rows={6}
                    spellCheck={false}
                    className="w-full resize-none rounded-lg border border-sky-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                  {statsJsonError && (
                    <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-bold text-red-700">
                      {statsJsonError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={applyStatsJson}
                      disabled={!statsJsonText.trim()}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-700 disabled:opacity-40"
                    >
                      <ClipboardPaste className="h-3.5 w-3.5" />
                      Aplicar al formulario
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatsJsonText(JSON.stringify(STAT_JSON_TEMPLATE, null, 2))}
                      className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs font-black text-sky-700 transition hover:bg-sky-50"
                    >
                      Template
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-2 p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_7rem_7rem] gap-2 px-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
                  <span>Dato</span>
                  <span className="truncate text-center">{match.homeTeam}</span>
                  <span className="truncate text-center">{match.awayTeam}</span>
                </div>
                {LIVE_STATS_FIELDS.map((field) => (
                  <div key={field.key} className="grid grid-cols-[minmax(0,1fr)_7rem_7rem] items-center gap-2">
                    <span className="truncate text-xs font-black text-slate-600">{field.label}</span>
                    <LiveStatInput
                      value={liveStats.home[field.key]}
                      max={field.max}
                      suffix={field.suffix}
                      decimal={field.decimal}
                      onChange={(value) => updateLiveStat("home", field.key, value)}
                    />
                    <LiveStatInput
                      value={liveStats.away[field.key]}
                      max={field.max}
                      suffix={field.suffix}
                      decimal={field.decimal}
                      onChange={(value) => updateLiveStat("away", field.key, value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Event composer */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Nuevo evento</p>
                    <p className="text-xs font-bold text-slate-500">
                      {teamLabel(match, draftTeam)}{draftRoster.length ? ` - ${draftRoster.length} jugadores` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => selectEventPreset("goal", "home")}
                      className={cn("h-7 rounded-md px-2 text-[11px] font-black transition", draftType === "goal" && draftTeam === "home" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100")}
                    >
                      Gol L
                    </button>
                    <button
                      type="button"
                      onClick={() => selectEventPreset("goal", "away")}
                      className={cn("h-7 rounded-md px-2 text-[11px] font-black transition", draftType === "goal" && draftTeam === "away" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100")}
                    >
                      Gol V
                    </button>
                    <button
                      type="button"
                      onClick={() => selectEventPreset("yellow", "home")}
                      className={cn("h-7 rounded-md px-2 text-[11px] font-black transition", draftType === "yellow" && draftTeam === "home" ? "bg-amber-400 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100")}
                    >
                      Amar. L
                    </button>
                    <button
                      type="button"
                      onClick={() => selectEventPreset("yellow", "away")}
                      className={cn("h-7 rounded-md px-2 text-[11px] font-black transition", draftType === "yellow" && draftTeam === "away" ? "bg-amber-400 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100")}
                    >
                      Amar. V
                    </button>
                    <button
                      type="button"
                      onClick={() => selectEventPreset("substitution", "home")}
                      className={cn("h-7 rounded-md px-2 text-[11px] font-black transition", draftType === "substitution" && draftTeam === "home" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
                    >
                      Cambio L
                    </button>
                    <button
                      type="button"
                      onClick={() => selectEventPreset("substitution", "away")}
                      className={cn("h-7 rounded-md px-2 text-[11px] font-black transition", draftType === "substitution" && draftTeam === "away" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
                    >
                      Cambio V
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 p-3">
                <div className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-2 sm:grid-cols-[4.75rem_8rem_minmax(0,1fr)]">
                  <label className="grid gap-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Min</span>
                    <input
                      type="number"
                      min={0}
                      max={130}
                      value={draftMinute}
                      onChange={(e) => setDraftMinute(e.target.value)}
                      placeholder="'"
                      className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 text-center text-sm font-black tabular-nums text-slate-700 outline-none focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Tipo</span>
                    <select
                      value={draftType}
                      onChange={(e) => setDraftType(e.target.value as LiveEventType)}
                      className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm font-black text-slate-700 outline-none focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                    >
                      {LIVE_EVENT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1 sm:col-span-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Jugador</span>
                    <input
                      type="text"
                      list={draftPlayersListId}
                      value={draftPlayer}
                      onChange={(e) => setDraftPlayer(e.target.value)}
                      placeholder={draftRoster.length ? "Elegir jugador..." : "Jugador opcional"}
                      className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                    />
                  </label>
                </div>

                <div className="grid gap-2 sm:grid-cols-[12rem_minmax(0,1fr)]">
                  <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                    {(["home", "away", null] as LiveEventTeam[]).map((team) => (
                      <button
                        key={team ?? "general"}
                        type="button"
                        onClick={() => { setDraftTeam(team); setDraftPlayer(""); }}
                        className={cn(
                          "h-8 rounded-md text-[11px] font-black transition",
                          draftTeam === team
                            ? team === "home"
                              ? "bg-blue-600 text-white"
                              : team === "away"
                                ? "bg-red-600 text-white"
                                : "bg-slate-700 text-white"
                            : "text-slate-500 hover:bg-white"
                        )}
                      >
                        {team === "home" ? "Local" : team === "away" ? "Visita" : "General"}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    placeholder="Nota corta para el timeline"
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={addDraftEvent}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 text-sm font-black text-white transition hover:bg-red-700"
                >
                  <Plus className="h-4 w-4" />
                  Agregar evento
                </button>
              </div>
            </div>

            {/* Events list */}
            {liveEvents.length > 0 && (
              <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-2">
                <p className="px-1 text-[10px] font-black uppercase tracking-wide text-slate-400">Eventos ({liveEvents.length})</p>
                <div className="max-h-64 space-y-1.5 overflow-y-auto">
                  {liveEvents.map((event) => (
                    <div key={event.id} className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm">
                      {/* Row 1: minute + type + team + delete */}
                      <div className="mb-1.5 flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={120}
                          value={event.minute ?? ""}
                          onChange={(e) => updateLiveEvent(event.id, { minute: e.target.value === "" ? null : Number(e.target.value) })}
                          placeholder="′"
                          className="w-10 rounded border border-slate-200 bg-slate-50 text-center text-xs font-black tabular-nums text-slate-600 outline-none"
                        />
                        <select
                          value={event.type}
                          onChange={(e) => updateLiveEvent(event.id, { type: e.target.value as LiveEventType })}
                          className="h-7 shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 text-[11px] font-black text-slate-700 outline-none focus:border-slate-400"
                        >
                          {LIVE_EVENT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        {/* Team selector */}
                        <div className="flex gap-0.5">
                          <button
                            type="button"
                            onClick={() => updateLiveEvent(event.id, { team: "home", player: "" })}
                            className={cn("h-5 rounded px-1.5 text-[10px] font-black transition", event.team === "home" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                          >L</button>
                          <button
                            type="button"
                            onClick={() => updateLiveEvent(event.id, { team: "away", player: "" })}
                            className={cn("h-5 rounded px-1.5 text-[10px] font-black transition", event.team === "away" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                          >V</button>
                          <button
                            type="button"
                            onClick={() => updateLiveEvent(event.id, { team: null, player: "" })}
                            className={cn("h-5 rounded px-1.5 text-[10px] font-black transition", event.team === null ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                          >–</button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLiveEvent(event.id)}
                          className="ml-auto shrink-0 text-slate-300 transition hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {/* Row 2: player + note */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          list={event.team === "home" ? homePlayersListId : event.team === "away" ? awayPlayersListId : undefined}
                          value={event.player}
                          onChange={(e) => updateLiveEvent(event.id, { player: e.target.value })}
                          placeholder={rosterForTeam(match, event.team).length ? "Elegir jugador" : "Jugador"}
                          className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:border-slate-400"
                        />
                        <input
                          type="text"
                          value={event.note}
                          onChange={(e) => updateLiveEvent(event.id, { note: e.target.value })}
                          placeholder="Nota"
                          className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:border-slate-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note general */}
            <textarea
              value={liveNote}
              onChange={(e) => setLiveNote(e.target.value)}
              placeholder="Nota general del partido (opcional)"
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none placeholder:text-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />

            {liveError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{liveError}</p>
            )}

            <button
              type="button"
              onClick={() => void handleSaveLive()}
              disabled={isSavingLive}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-black text-white transition disabled:opacity-50",
                isLiveNow ? "bg-red-600 hover:bg-red-700" : "bg-slate-700 hover:bg-slate-800"
              )}
            >
              {isSavingLive ? <Loader2 className="h-4 w-4 animate-spin" /> : liveSaved ? <Check className="h-4 w-4" /> : <Tv2 className="h-4 w-4" />}
              {liveSaved ? "Live guardado ✓" : "Guardar live"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function MarketNumberInput({
  label,
  value,
  onChange,
  suffix,
  step = "1",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  step?: string;
}) {
  return (
    <label className="min-w-0">
      <span className="mb-1 block truncate text-[10px] font-black uppercase text-slate-400">{label}</span>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-100">
        <input
          type="number"
          min={0}
          max={suffix ? 100 : undefined}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 min-w-0 bg-transparent px-2 text-center text-sm font-black tabular-nums text-slate-800 outline-none"
        />
        {suffix && (
          <span className="grid h-10 w-7 place-items-center border-l border-slate-200 text-[10px] font-black text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function LiveStatInput({
  value,
  onChange,
  max,
  suffix,
  decimal = false,
}: {
  value: number | null;
  onChange: (value: string) => void;
  max?: number;
  suffix?: string;
  decimal?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 focus-within:border-red-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-100">
      <input
        type="number"
        min={0}
        max={max}
        step={decimal ? "0.1" : "1"}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-0 bg-transparent px-2 text-center text-sm font-black tabular-nums text-slate-800 outline-none"
      />
      {suffix && (
        <span className="grid h-9 w-7 place-items-center border-l border-slate-200 text-[10px] font-black text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  );
}
