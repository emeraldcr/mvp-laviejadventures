"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Eye, Trophy, Wifi, WifiOff } from "lucide-react";
import type { MundialMatch } from "../types";
import { cn, normalizeKey } from "../utils";
import type {
  SerializedScorerState,
  SerializedScorerRound,
  ScorerPlayerDoc,
} from "@/lib/mundial/scorer";
import { POINTS_CUALQUIERA, POINTS_EXACT, POINTS_NADIE } from "@/lib/mundial/scorer";

// ─── Constants ────────────────────────────────────────────────────────────────

const VISITOR_KEY = "scorer-vid";
const BET_WINDOW_MS = 15_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOrCreateVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return `anon-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function getDisplayName(playerName: string): string {
  if (playerName.trim()) return playerName.trim().slice(0, 20);
  try {
    const stored = localStorage.getItem("mundial-player-name");
    if (stored?.trim()) return stored.trim().slice(0, 20);
  } catch {}
  return `Fan-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function computeMyResult(
  myPick: string | null,
  actualScorer: string | null
): "win_exact" | "win_cualquiera" | "win_nadie" | "loss" | null {
  if (!myPick || !actualScorer) return null;
  if (myPick === actualScorer) {
    if (myPick === "nadie") return "win_nadie";
    return "win_exact";
  }
  if (myPick === "cualquiera" && actualScorer !== "nadie") return "win_cualquiera";
  return "loss";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TeamSection({
  label,
  players,
  myPick,
  canBet,
  onPick,
  actualScorer,
  isResolved,
}: {
  label: string;
  players: ScorerPlayerDoc[];
  myPick: string | null;
  canBet: boolean;
  onPick: (name: string) => void;
  actualScorer: string | null;
  isResolved: boolean;
}) {
  if (players.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">{label}</p>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {players.map((p) => {
          const isSelected = myPick === p.name;
          const isWinner = isResolved && actualScorer === p.name;
          return (
            <button
              key={p.name}
              type="button"
              disabled={!canBet}
              onClick={() => onPick(p.name)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all active:scale-95",
                isWinner
                  ? "border-[#d5ff3f] bg-[#1a2206] shadow-[0_0_18px_rgba(213,255,63,0.25)]"
                  : isSelected
                  ? "border-[#f0b429] bg-[#1f1505] shadow-[0_0_14px_rgba(240,180,41,0.30)] scale-[1.02]"
                  : canBet
                  ? "border-white/12 bg-white/5 hover:border-[#f0b429]/50 hover:bg-[#1a1205]"
                  : "border-white/8 bg-white/3 opacity-60 cursor-default"
              )}
            >
              {p.squadNumber !== null && (
                <span
                  className={cn(
                    "shrink-0 w-6 text-center text-[10px] font-black tabular-nums",
                    isWinner ? "text-[#d5ff3f]" : isSelected ? "text-[#f0b429]" : "text-white/30"
                  )}
                >
                  {p.squadNumber}
                </span>
              )}
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-xs font-black",
                    isWinner ? "text-[#d5ff3f]" : isSelected ? "text-[#f0b429]" : "text-white"
                  )}
                >
                  {p.name.split(" ").slice(-1)[0]}
                </p>
                <p className="truncate text-[9px] font-bold uppercase tracking-wide text-white/30">
                  {p.position || "JUG"}
                </p>
              </div>
              {isWinner && (
                <span className="ml-auto shrink-0 text-base">⚽</span>
              )}
              {isSelected && !isWinner && !isResolved && (
                <span className="ml-auto shrink-0 h-2 w-2 rounded-full bg-[#f0b429]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

type Props = {
  liveMatch: MundialMatch | null;
  playerName: string;
};

export function ProximoEnAnotarPanel({ liveMatch, playerName }: Props) {
  const [state, setState] = useState<SerializedScorerState | null>(null);
  const [connected, setConnected] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [myPick, setMyPick] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);

  const serverClockOffsetRef = useRef(0);
  const confettiFiredRef = useRef<string | null>(null);
  const prevRoundIdRef = useRef<string | null>(null);

  const isAdmin = normalizeKey(playerName) === "ALLAN";

  // Init identity
  useEffect(() => {
    queueMicrotask(() => {
      setVisitorId(getOrCreateVisitorId());
      setDisplayName(getDisplayName(playerName));
    });
  }, [playerName]);

  // SSE connection
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let delay = 800;

    const connect = () => {
      setReconnecting(false);
      es = new EventSource("/api/mundial/scorer/live");
      es.onopen = () => { setConnected(true); setReconnecting(false); delay = 800; };
      const onData = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data) as SerializedScorerState;
          if (data.serverTime) {
            const serverMs = new Date(data.serverTime).getTime();
            if (Number.isFinite(serverMs)) serverClockOffsetRef.current = serverMs - Date.now();
          }
          setState(data);
        } catch {}
      };
      es.onmessage = onData;
      es.addEventListener("state", onData);
      es.onerror = () => {
        setConnected(false);
        setReconnecting(true);
        es?.close();
        reconnectTimer = setTimeout(connect, delay);
        delay = Math.min(5_000, Math.round(delay * 1.6));
      };
    };

    connect();
    return () => { es?.close(); clearTimeout(reconnectTimer); };
  }, []);

  // Local clock (only while betting timer is running)
  useEffect(() => {
    if (state?.round?.status !== "betting") return;
    const id = setInterval(() => setNowMs(Date.now() + serverClockOffsetRef.current), 150);
    return () => clearInterval(id);
  }, [state?.round?.status]);

  // Reset pick when new round starts
  const roundId = state?.round?.id ?? null;
  useEffect(() => {
    if (!roundId || roundId === prevRoundIdRef.current) return;
    prevRoundIdRef.current = roundId;
    setMyPick(null);
  }, [roundId]);

  // Confetti on win
  useEffect(() => {
    const round = state?.round;
    if (round?.status !== "resolved" || !myPick || !round.actualScorer) return;
    const key = round.id;
    if (confettiFiredRef.current === key) return;
    const result = computeMyResult(myPick, round.actualScorer);
    if (!result || result === "loss") return;
    confettiFiredRef.current = key;
    confetti({ particleCount: 140, spread: 85, origin: { y: 0.55 } });
  }, [state?.round?.status, state?.round?.actualScorer, myPick, state?.round?.id]);

  // Place bet
  const handlePick = useCallback(async (pick: string) => {
    const round = state?.round;
    if (!round || round.status !== "betting" || !visitorId || myPick) return;
    setMyPick(pick);
    try {
      const res = await fetch("/api/mundial/scorer/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, playerName: displayName, pick, roundId: round.id }),
      });
      if (!res.ok) setMyPick(null);
    } catch {
      setMyPick(null);
    }
  }, [state?.round, visitorId, myPick, displayName]);

  // Admin: open round
  const handleOpenRound = useCallback(async () => {
    setAdminBusy(true);
    try { await fetch("/api/mundial/scorer/round", { method: "POST" }); } finally { setAdminBusy(false); }
  }, []);

  // Admin: force-resolve
  const handleForceResolve = useCallback(async (scorer: string) => {
    setAdminBusy(true);
    try {
      await fetch("/api/mundial/scorer/round", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualScorer: scorer }),
      });
    } finally { setAdminBusy(false); }
  }, []);

  // ─── Derived ───────────────────────────────────────────────────────────────

  const round: SerializedScorerRound | null = state?.round ?? null;
  const displayMatch = state?.liveMatch ?? (liveMatch ? {
    id: liveMatch.id,
    homeTeam: liveMatch.homeTeam,
    awayTeam: liveMatch.awayTeam,
    homeLiveScore: liveMatch.homeLiveScore,
    awayLiveScore: liveMatch.awayLiveScore,
    liveMinute: liveMatch.liveMinute,
    liveStatus: liveMatch.liveStatus,
  } : null);

  const betsOpenUntilMs = round?.betsOpenUntil ? new Date(round.betsOpenUntil).getTime() : null;
  const timerSec = betsOpenUntilMs ? Math.max(0, Math.ceil((betsOpenUntilMs - nowMs) / 1000)) : 0;
  const timerPct = betsOpenUntilMs
    ? Math.max(0, Math.min(100, ((betsOpenUntilMs - nowMs) / BET_WINDOW_MS) * 100))
    : 0;

  const canBet = round?.status === "betting" && !myPick;

  const homePlayers = useMemo(() => round?.players.filter((p) => p.team === "home") ?? [], [round?.players]);
  const awayPlayers = useMemo(() => round?.players.filter((p) => p.team === "away") ?? [], [round?.players]);

  const myResult = computeMyResult(myPick, round?.actualScorer ?? null);

  const statusBadge = !round
    ? { text: "ESPERANDO RONDA", color: "text-white/30 bg-white/5" }
    : round.status === "betting"
    ? { text: `APOSTANDO · ${timerSec}s`, color: "text-[#f0b429] bg-[#f0b429]/10 animate-pulse" }
    : round.status === "waiting"
    ? { text: "ESPERANDO GOL...", color: "text-sky-300 bg-sky-900/25 animate-pulse" }
    : round.actualScorer === "nadie"
    ? { text: "TIEMPO SIN GOL", color: "text-white/50 bg-white/5" }
    : { text: "¡RESUELTO! ⚽", color: "text-[#d5ff3f] bg-[#1a2206]" };

  // Empty state
  if (!liveMatch && !displayMatch) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-black/40 p-8 text-center">
        <p className="font-black text-white/50 text-lg">
          Próximo en Anotar se activa durante un partido en vivo ⚽
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 md:mt-10 px-1 sm:px-2">
      <div className="rounded-3xl border border-[#f0b429]/20 bg-gradient-to-br from-[#091a0f] via-black/95 to-black shadow-2xl overflow-hidden">

        {/* ══ HEADER ══ */}
        <div className="border-b border-white/5 px-5 pt-5 pb-4 sm:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f0b429] text-2xl text-black shadow-[0_0_20px_rgba(240,180,41,0.40)]">
                🎯
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter leading-none sm:text-3xl">
                  PRÓXIMO EN ANOTAR
                </h2>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                  Apuesta en vivo · {round ? `Ronda ${round.roundNumber}` : "Mini-juego"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                  statusBadge.color
                )}
              >
                {statusBadge.text}
              </span>

              {/* Live score chip */}
              {displayMatch && displayMatch.homeLiveScore !== null && (
                <div className="flex items-center gap-1 rounded-full border border-[#9dff34]/25 bg-[#0a2410]/80 px-3 py-1">
                  <span className="text-xs font-black tabular-nums text-white">
                    {displayMatch.homeLiveScore}
                    <span className="mx-1 text-white/30">–</span>
                    {displayMatch.awayLiveScore ?? 0}
                  </span>
                  {displayMatch.liveMinute !== null && (
                    <span className="text-[10px] font-black text-[#9dff34]">
                      {displayMatch.liveMinute}&apos;
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                {(state?.viewerCount ?? 0) > 1 && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-white/30">
                    <Eye className="h-3 w-3" />
                    {state!.viewerCount}
                  </span>
                )}
                {reconnecting ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-orange-400 animate-pulse">
                    <WifiOff className="h-3.5 w-3.5" /> RECONECTANDO
                  </span>
                ) : connected ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                    <Wifi className="h-3.5 w-3.5" /> LIVE
                  </span>
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-red-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-8">

          {/* ══ TIMER BAR ══ */}
          {round?.status === "betting" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/35">
                <span>Tiempo para apostar</span>
                <span className={cn("tabular-nums", timerSec <= 5 ? "text-red-400" : "text-[#f0b429]")}>
                  {timerSec}s
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${timerPct}%`,
                    background:
                      timerPct > 50
                        ? "linear-gradient(90deg,#f0b429,#fde68a)"
                        : timerPct > 20
                        ? "linear-gradient(90deg,#f97316,#fbbf24)"
                        : "linear-gradient(90deg,#ef4444,#f97316)",
                  }}
                />
              </div>
            </div>
          )}

          {/* ══ STATE: BETTING — player grid ══ */}
          {round?.status === "betting" && (
            <div className="space-y-4">
              <p className="text-center text-sm font-bold text-white/50">
                Elige quién anota el próximo gol
              </p>

              {round.players.length > 0 ? (
                <div className="space-y-4">
                  <TeamSection
                    label={`Local: ${round.homeTeam}`}
                    players={homePlayers}
                    myPick={myPick}
                    canBet={canBet}
                    onPick={handlePick}
                    actualScorer={null}
                    isResolved={false}
                  />
                  <TeamSection
                    label={`Visitante: ${round.awayTeam}`}
                    players={awayPlayers}
                    myPick={myPick}
                    canBet={canBet}
                    onPick={handlePick}
                    actualScorer={null}
                    isResolved={false}
                  />
                </div>
              ) : (
                <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm font-bold text-white/40">
                  Sin jugadores en el roster. El admin necesita agregarlos.
                </p>
              )}

              {/* Special picks */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!canBet}
                  onClick={() => handlePick("cualquiera")}
                  className={cn(
                    "rounded-xl border py-4 font-black text-sm transition-all active:scale-95",
                    myPick === "cualquiera"
                      ? "border-[#f0b429] bg-[#1f1505] text-[#f0b429] shadow-[0_0_14px_rgba(240,180,41,0.30)]"
                      : canBet
                      ? "border-white/15 bg-white/5 text-white hover:border-[#f0b429]/50"
                      : "border-white/8 bg-white/3 text-white/40 cursor-default"
                  )}
                >
                  <span className="block text-xl">⚽</span>
                  CUALQUIERA
                  <span className="block text-[10px] font-bold text-white/35 mt-0.5">+{POINTS_CUALQUIERA} pts</span>
                </button>
                <button
                  type="button"
                  disabled={!canBet}
                  onClick={() => handlePick("nadie")}
                  className={cn(
                    "rounded-xl border py-4 font-black text-sm transition-all active:scale-95",
                    myPick === "nadie"
                      ? "border-[#62ffe6] bg-[#071d2a] text-[#62ffe6] shadow-[0_0_14px_rgba(98,255,230,0.25)]"
                      : canBet
                      ? "border-white/15 bg-white/5 text-white hover:border-[#62ffe6]/40"
                      : "border-white/8 bg-white/3 text-white/40 cursor-default"
                  )}
                >
                  <span className="block text-xl">🚫</span>
                  NADIE
                  <span className="block text-[10px] font-bold text-white/35 mt-0.5">+{POINTS_NADIE} pts</span>
                </button>
              </div>

              {myPick && (
                <p className="text-center text-sm font-bold text-[#f0b429] animate-pulse">
                  ✓ Apostaste a <strong>{myPick === "cualquiera" ? "Cualquiera" : myPick === "nadie" ? "Nadie" : myPick}</strong> — esperando cierre de ronda...
                </p>
              )}
            </div>
          )}

          {/* ══ STATE: WAITING ══ */}
          {round?.status === "waiting" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-sky-500/20 bg-sky-950/30 p-5 text-center">
                <div className="mb-3 text-4xl animate-bounce">⏳</div>
                <p className="text-base font-black text-sky-300">Esperando el próximo gol...</p>
                <p className="mt-1 text-xs font-bold text-white/40">
                  Se resolverá automáticamente cuando llegue el gol
                </p>
              </div>

              {myPick && (
                <div className="rounded-xl border border-[#f0b429]/25 bg-[#1a1205] px-4 py-3 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#f0b429]/60">Tu apuesta</p>
                  <p className="mt-1 text-lg font-black text-white">
                    {myPick === "cualquiera" ? "⚽ Cualquiera" : myPick === "nadie" ? "🚫 Nadie" : `🎯 ${myPick}`}
                  </p>
                </div>
              )}

              {round.betCount > 0 && (
                <p className="text-center text-xs font-bold text-white/30">
                  {round.betCount} apuesta{round.betCount !== 1 ? "s" : ""} registrada{round.betCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {/* ══ STATE: RESOLVED ══ */}
          {round?.status === "resolved" && round.actualScorer !== null && (
            <div className="space-y-4">
              {/* Result hero */}
              <div
                className={cn(
                  "rounded-2xl border p-5 text-center",
                  round.actualScorer === "nadie"
                    ? "border-white/15 bg-white/5"
                    : "border-[#d5ff3f]/30 bg-[#0d1f07] shadow-[0_0_40px_rgba(213,255,63,0.08)]"
                )}
              >
                <p className="text-4xl mb-2">
                  {round.actualScorer === "nadie" ? "🚫" : round.actualScorer === "cualquiera" ? "⚽" : "⚽"}
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/35 mb-1">
                  {round.actualScorer === "nadie" ? "Nadie anotó" : "Próximo en anotar"}
                </p>
                <p
                  className={cn(
                    "text-2xl font-black sm:text-3xl",
                    round.actualScorer === "nadie"
                      ? "text-white/50"
                      : "text-[#d5ff3f]"
                  )}
                >
                  {round.actualScorer === "nadie"
                    ? "Sin gol"
                    : round.actualScorer === "cualquiera"
                    ? "Gol (jugador no listado)"
                    : round.actualScorer}
                </p>
              </div>

              {/* My result */}
              {myPick && myResult && (
                <div
                  className={cn(
                    "rounded-xl border px-4 py-3 text-center",
                    myResult === "loss"
                      ? "border-red-500/25 bg-red-950/30"
                      : "border-[#d5ff3f]/35 bg-[#1a2206]"
                  )}
                >
                  {myResult === "loss" ? (
                    <>
                      <p className="text-2xl">😔</p>
                      <p className="mt-1 text-sm font-black text-red-300">Fallaste esta vez</p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        Apostaste: {myPick === "cualquiera" ? "Cualquiera" : myPick === "nadie" ? "Nadie" : myPick}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl">🎉</p>
                      <p className="mt-1 text-lg font-black text-[#d5ff3f]">
                        +{myResult === "win_exact" ? POINTS_EXACT : myResult === "win_cualquiera" ? POINTS_CUALQUIERA : POINTS_NADIE} pts
                      </p>
                      <p className="text-xs font-bold text-white/50 mt-0.5">
                        {myResult === "win_exact"
                          ? "¡Exacto! Acertaste el jugador"
                          : myResult === "win_cualquiera"
                          ? "Acertaste que alguien anotaría"
                          : "Acertaste que no habría gol"}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Resultado completo de jugadores */}
              {round.players.length > 0 && round.actualScorer !== "nadie" && (
                <div className="space-y-3">
                  <TeamSection
                    label={`Local: ${round.homeTeam}`}
                    players={homePlayers}
                    myPick={myPick}
                    canBet={false}
                    onPick={() => {}}
                    actualScorer={round.actualScorer}
                    isResolved
                  />
                  <TeamSection
                    label={`Visitante: ${round.awayTeam}`}
                    players={awayPlayers}
                    myPick={myPick}
                    canBet={false}
                    onPick={() => {}}
                    actualScorer={round.actualScorer}
                    isResolved
                  />
                </div>
              )}
            </div>
          )}

          {/* ══ STATE: NO ROUND ══ */}
          {!round && (
            <div className="rounded-2xl border border-white/8 bg-white/4 p-8 text-center">
              <p className="text-3xl mb-3">🎯</p>
              <p className="text-base font-black text-white/60">Próxima ronda iniciando pronto...</p>
              <p className="mt-2 text-xs font-bold text-white/30">
                Espera a que el admin abra una nueva ronda
              </p>
            </div>
          )}

          {/* ══ ADMIN CONTROLS ══ */}
          {isAdmin && (
            <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-red-400">
                Admin · Scorer
              </p>
              <div className="flex flex-wrap gap-2">
                {!round && (
                  <button
                    type="button"
                    disabled={adminBusy}
                    onClick={handleOpenRound}
                    className="rounded-lg border border-[#d5ff3f]/40 bg-[#1a2206] px-4 py-2 text-xs font-black text-[#d5ff3f] transition hover:bg-[#243009] disabled:opacity-50"
                  >
                    {adminBusy ? "Abriendo..." : "⚡ ABRIR RONDA"}
                  </button>
                )}
                {round && round.status !== "resolved" && (
                  <>
                    <button
                      type="button"
                      disabled={adminBusy}
                      onClick={() => handleForceResolve("nadie")}
                      className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-black text-white/60 transition hover:bg-white/10 disabled:opacity-50"
                    >
                      {adminBusy ? "..." : "Cerrar sin gol"}
                    </button>
                    {round.players.slice(0, 3).map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        disabled={adminBusy}
                        onClick={() => handleForceResolve(p.name)}
                        className="rounded-lg border border-[#f0b429]/30 bg-[#1f1505] px-3 py-2 text-xs font-black text-[#f0b429] transition hover:bg-[#2a1a07] disabled:opacity-50"
                      >
                        Gol: {p.name.split(" ").slice(-1)[0]}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={adminBusy}
                      onClick={() => handleForceResolve("cualquiera")}
                      className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-black text-white/60 transition hover:bg-white/10 disabled:opacity-50"
                    >
                      Gol sin roster
                    </button>
                  </>
                )}
                {round?.status === "resolved" && (
                  <button
                    type="button"
                    disabled={adminBusy}
                    onClick={handleOpenRound}
                    className="rounded-lg border border-[#d5ff3f]/40 bg-[#1a2206] px-4 py-2 text-xs font-black text-[#d5ff3f] transition hover:bg-[#243009] disabled:opacity-50"
                  >
                    {adminBusy ? "Abriendo..." : "⚡ SIGUIENTE RONDA"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ══ LEADERBOARD ══ */}
          {(state?.leaderboard ?? []).length > 0 && (
            <div className="border-t border-white/5 pt-4">
              <div className="mb-3 flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-[#f0b429]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/35">
                  Tabla de pronósticos
                </p>
              </div>
              <div className="space-y-1.5">
                {state!.leaderboard.map(({ name, points }, i) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="w-4 text-right text-[10px] tabular-nums text-white/25">{i + 1}</span>
                    <div className="flex-1 overflow-hidden rounded-full bg-white/5 h-5">
                      <div
                        className="flex h-full items-center rounded-full px-2"
                        style={{
                          width: `${Math.max(15, Math.round((points / (state!.leaderboard[0]?.points || 1)) * 100))}%`,
                          background: i === 0
                            ? "linear-gradient(90deg,#f0b429,#d5ff3f)"
                            : "linear-gradient(90deg,rgba(240,180,41,0.45),rgba(240,180,41,0.20))",
                        }}
                      >
                        <span className="truncate text-[10px] font-black text-black/80">{name}</span>
                      </div>
                    </div>
                    <span className="w-12 text-right text-xs font-black tabular-nums text-[#f0b429]">
                      {points}pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
