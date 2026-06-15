"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, Loader2, Lock, LockOpen, Minus, Plus, Save, Trash2, Tv2, Users } from "lucide-react";
import type { AdminLiveMatchEvent, AdminMatch, LiveEventTeam, LiveEventType, LiveMatchStatus } from "../adminTypes";
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

function liveEventLabel(type: LiveEventType) {
  return LIVE_EVENT_OPTIONS.find((o) => o.value === type)?.label ?? "Nota";
}

function safeInc(value: string) {
  const n = Number(value);
  return String(Number.isFinite(n) ? Math.max(0, Math.trunc(n)) + 1 : 1);
}

function safeDec(value: string) {
  const n = Number(value);
  return String(Number.isFinite(n) ? Math.max(0, Math.trunc(n) - 1) : 0);
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
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingClose, setIsTogglingClose] = useState(false);
  const [isSavingLive, setIsSavingLive] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liveSaved, setLiveSaved] = useState(false);
  const [error, setError] = useState("");
  const [liveError, setLiveError] = useState("");
  const [showEdit, setShowEdit] = useState(!hasResult);
  const [showLive, setShowLive] = useState(match.liveStatus !== "scheduled");

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
    if (match.liveStatus !== "scheduled") setShowLive(true);
  }, [match]);

  const isKnockout = match.stage !== "group";
  const parsedHome = homeScore === "" ? null : Number(homeScore);
  const parsedAway = awayScore === "" ? null : Number(awayScore);
  const isTied = parsedHome !== null && parsedAway !== null && parsedHome === parsedAway;
  const needsWinner = isKnockout && isTied;
  const isLiveNow = liveStatus === "live";
  const isHalftime = liveStatus === "halftime";

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
      });
      setLiveSaved(true);
      setTimeout(() => setLiveSaved(false), 2500);
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : "Error guardando live.");
    } finally {
      setIsSavingLive(false);
    }
  }

  function addLiveEvent(type: LiveEventType, team: LiveEventTeam = null) {
    if (type === "goal" && team === "home") setHomeLiveScore((v) => safeInc(v));
    if (type === "goal" && team === "away") setAwayLiveScore((v) => safeInc(v));
    if (liveStatus === "scheduled") setLiveStatus("live");
    setLiveEvents((curr) => [
      {
        id: `${Date.now()}-${curr.length}`,
        type,
        team,
        minute: liveMinute === "" ? null : Number(liveMinute),
        player: "",
        note: "",
        createdAt: new Date().toISOString(),
      },
      ...curr,
    ]);
  }

  function updateLiveEvent(id: string, patch: Partial<AdminLiveMatchEvent>) {
    setLiveEvents((curr) => curr.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeLiveEvent(id: string) {
    setLiveEvents((curr) => curr.filter((e) => e.id !== id));
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

            {/* Quick event buttons — by category */}
            <div className="space-y-2">
              {/* Goals */}
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Goles</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" onClick={() => addLiveEvent("goal", "home")}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-xs font-black text-white hover:bg-emerald-700">
                  ⚽ Local
                </button>
                <button type="button" onClick={() => addLiveEvent("goal", "away")}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-xs font-black text-white hover:bg-emerald-700">
                  ⚽ Visita
                </button>
              </div>

              {/* Cards */}
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Tarjetas</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" onClick={() => addLiveEvent("yellow", "home")}
                  className="h-8 rounded-lg bg-amber-400 text-xs font-black text-white hover:bg-amber-500">
                  🟨 Local
                </button>
                <button type="button" onClick={() => addLiveEvent("yellow", "away")}
                  className="h-8 rounded-lg bg-amber-400 text-xs font-black text-white hover:bg-amber-500">
                  🟨 Visita
                </button>
                <button type="button" onClick={() => addLiveEvent("red", "home")}
                  className="h-8 rounded-lg bg-red-600 text-xs font-black text-white hover:bg-red-700">
                  🟥 Local
                </button>
                <button type="button" onClick={() => addLiveEvent("red", "away")}
                  className="h-8 rounded-lg bg-red-600 text-xs font-black text-white hover:bg-red-700">
                  🟥 Visita
                </button>
              </div>

              {/* Other */}
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Otros</p>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => addLiveEvent("penalty", "home")}
                  className="h-8 rounded-lg border border-purple-200 bg-purple-50 px-2.5 text-xs font-black text-purple-700 hover:bg-purple-100">
                  Penal Local
                </button>
                <button type="button" onClick={() => addLiveEvent("penalty", "away")}
                  className="h-8 rounded-lg border border-purple-200 bg-purple-50 px-2.5 text-xs font-black text-purple-700 hover:bg-purple-100">
                  Penal Visita
                </button>
                <button type="button" onClick={() => addLiveEvent("var", null)}
                  className="h-8 rounded-lg border border-blue-200 bg-blue-50 px-2.5 text-xs font-black text-blue-700 hover:bg-blue-100">
                  VAR
                </button>
                <button type="button" onClick={() => addLiveEvent("substitution", "home")}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-black text-slate-600 hover:bg-slate-50">
                  Cambio Local
                </button>
                <button type="button" onClick={() => addLiveEvent("substitution", "away")}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-black text-slate-600 hover:bg-slate-50">
                  Cambio Visita
                </button>
                <button type="button" onClick={() => addLiveEvent("note", null)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-black text-slate-600 hover:bg-slate-50">
                  + Nota
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
                        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-black text-slate-700">{liveEventLabel(event.type)}</span>
                        {/* Team selector */}
                        <div className="flex gap-0.5">
                          <button
                            type="button"
                            onClick={() => updateLiveEvent(event.id, { team: "home" })}
                            className={cn("h-5 rounded px-1.5 text-[10px] font-black transition", event.team === "home" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                          >L</button>
                          <button
                            type="button"
                            onClick={() => updateLiveEvent(event.id, { team: "away" })}
                            className={cn("h-5 rounded px-1.5 text-[10px] font-black transition", event.team === "away" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                          >V</button>
                          <button
                            type="button"
                            onClick={() => updateLiveEvent(event.id, { team: null })}
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
                          value={event.player}
                          onChange={(e) => updateLiveEvent(event.id, { player: e.target.value })}
                          placeholder="Jugador"
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
