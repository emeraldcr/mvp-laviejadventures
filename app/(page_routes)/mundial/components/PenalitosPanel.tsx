// app/(page_routes)/mundial/components/PenalitosPanel.tsx
"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye, Trophy, Users, Wifi, WifiOff } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "../utils";
import type {
  PenalitosDirection,
  PenalitosGame,
  PenalitosQueueEntry,
  PenalitosRole,
  MundialMatch,
} from "../types";

// -------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------
const ANIM_DURATION_MS = 1_800;
const VISITOR_KEY = "penalitos-vid";
const CHOICES: PenalitosDirection[] = ["left", "center", "right"];

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------
type LiveMatchSnapshot = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLiveScore: number | null;
  awayLiveScore: number | null;
  liveMinute: number | null;
  liveStatus: "live" | "halftime" | "fulltime" | "scheduled";
  liveNote: string;
};

type SSEPayload = {
  game: PenalitosGame | null;
  queue: PenalitosQueueEntry[];
  scores: Record<string, number>;
  history?: Array<{
    gameId: string;
    roundNumber: number;
    goalkeeperChoice: PenalitosDirection;
    shooterChoice: PenalitosDirection;
    winner: PenalitosRole;
    outcome: "goal" | "save";
    resolvedAt: string;
  }>;
  liveMatch: LiveMatchSnapshot | null;
  viewerCount: number;
  version?: number;
  serverTime?: string;
  updatedAt?: string | null;
};

// -------------------------------------------------------------------
// Visitor ID (UUID generated once per browser)
// -------------------------------------------------------------------
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
  return `Jugador-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// -------------------------------------------------------------------
// Field position helpers
// -------------------------------------------------------------------
const BALL_X: Record<PenalitosDirection, string> = {
  left: "-100px",
  center: "0px",
  right: "100px",
};
const BALL_Y: Record<PenalitosDirection, string> = {
  left: "-60px",
  center: "-40px",
  right: "-60px",
};
const GK_X: Record<PenalitosDirection, string> = {
  left: "-60px",
  center: "0px",
  right: "60px",
};

// -------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------
const DirectionButton = memo(function DirectionButton({
  dir,
  chosen,
  disabled,
  onChoose,
}: {
  dir: PenalitosDirection;
  chosen: PenalitosDirection | null;
  disabled: boolean;
  onChoose: (d: PenalitosDirection) => void;
}) {
  const isSelected = chosen === dir;
  return (
    <button
      onClick={() => onChoose(dir)}
      disabled={disabled}
      className={cn(
        "h-16 sm:h-20 rounded-2xl font-black text-base sm:text-xl transition-all active:scale-95 select-none",
        isSelected
          ? "bg-[#f0b429] text-black shadow-lg shadow-[#f0b429]/40 scale-105"
          : "bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      {dir === "left" && "← IZQDA"}
      {dir === "center" && "CENTRO"}
      {dir === "right" && "DERECHA →"}
    </button>
  );
});

const PlayerCard = memo(function PlayerCard({
  emoji,
  label,
  labelColor,
  name,
  isMe,
  choice,
  revealed,
}: {
  emoji: string;
  label: string;
  labelColor: string;
  name: string | null;
  isMe: boolean;
  choice: PenalitosDirection | null;
  revealed: boolean;
}) {
  const choiceLabel = choice
    ? choice === "left" ? "← IZQ" : choice === "center" ? "CENTRO" : "DER →"
    : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl p-4 bg-black/50 transition-all",
        isMe && "ring-2 ring-[#f0b429]"
      )}
    >
      <div className="text-4xl mb-1">{emoji}</div>
      <p className="font-black text-base truncate max-w-[120px]">{name || "—"}</p>
      <p className={cn("text-xs font-bold uppercase tracking-widest", labelColor)}>{label}</p>
      {isMe && <p className="text-[10px] text-[#f0b429] mt-1">TÚ</p>}
      {revealed && choiceLabel && (
        <p className="mt-2 text-xs font-mono bg-white/10 rounded px-2 py-0.5">{choiceLabel}</p>
      )}
    </div>
  );
});

// Compact live scoreboard shown inside the panel header
const LiveScoreChip = memo(function LiveScoreChip({
  match,
}: {
  match: LiveMatchSnapshot | MundialMatch;
}) {
  const home = match.homeLiveScore;
  const away = match.awayLiveScore;
  const minute = match.liveMinute;
  const status = match.liveStatus;

  if (home === null && away === null) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-[#9dff34]/30 bg-[#0a2410]/80 px-3 py-1">
      <span className="text-xs font-black text-white tabular-nums">
        {home ?? 0}
        <span className="mx-1 text-white/30">–</span>
        {away ?? 0}
      </span>
      {status === "halftime" ? (
        <span className="text-[10px] font-black text-[#f0b429] uppercase">HT</span>
      ) : minute !== null ? (
        <span className="text-[10px] font-black text-[#9dff34]">{minute}&apos;</span>
      ) : null}
    </div>
  );
});

// -------------------------------------------------------------------
// Main Panel
// -------------------------------------------------------------------
type Props = {
  liveMatch: MundialMatch | null;
  playerName: string;
};

export function PenalitosPanel({ liveMatch, playerName }: Props) {
  const [game, setGame] = useState<PenalitosGame | null>(null);
  const [queue, setQueue] = useState<PenalitosQueueEntry[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [sseLiveMatch, setSseLiveMatch] = useState<LiveMatchSnapshot | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [connected, setConnected] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  const [visitorId, setVisitorId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [myChoice, setMyChoice] = useState<PenalitosDirection | null>(null);

  // Local clock for timer countdown
  const [nowMs, setNowMs] = useState(() => Date.now());

  const confettiFiredRef = useRef<string | null>(null);
  const lastPayloadRef = useRef<string>("");
  const serverClockOffsetRef = useRef(0);

  const applyPayload = useCallback((data: SSEPayload) => {
    const signature = JSON.stringify(data);
    if (signature === lastPayloadRef.current) return;
    lastPayloadRef.current = signature;
    if (data.serverTime) {
      const serverTimeMs = new Date(data.serverTime).getTime();
      if (Number.isFinite(serverTimeMs)) {
        serverClockOffsetRef.current = serverTimeMs - Date.now();
        setNowMs(serverTimeMs);
      }
    }
    setGame(data.game ?? null);
    setQueue(data.queue ?? []);
    setScores(data.scores ?? {});
    setSseLiveMatch(data.liveMatch ?? null);
    setViewerCount(data.viewerCount ?? 0);
  }, []);

  // Init visitor identity once
  useEffect(() => {
    queueMicrotask(() => {
      setVisitorId(getOrCreateVisitorId());
      setDisplayName(getDisplayName(playerName));
    });
  }, [playerName]);

  // Local clock only ticks while countdown/result animation needs it
  useEffect(() => {
    const needsClock = game?.status === "choosing" || game?.status === "finished";
    if (!needsClock) return;
    const id = setInterval(() => setNowMs(Date.now() + serverClockOffsetRef.current), 200);
    return () => clearInterval(id);
  }, [game?.chooseDeadline, game?.resolvedAt, game?.status]);

  // SSE connection with auto-reconnect
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let reconnectDelay = 800;

    const connect = () => {
      setReconnecting(false);
      es = new EventSource("/api/mundial/penalitos/live");
      es.onopen = () => {
        setConnected(true);
        setReconnecting(false);
        reconnectDelay = 800;
      };
      const onState = (e: MessageEvent) => {
        try {
          applyPayload(JSON.parse(e.data) as SSEPayload);
        } catch (err) {
          console.error("[penalitos] SSE parse error", err);
        }
      };
      es.onmessage = onState;
      es.addEventListener("state", onState);
      es.onerror = () => {
        setConnected(false);
        setReconnecting(true);
        es?.close();
        reconnectTimer = setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(5_000, Math.round(reconnectDelay * 1.6));
      };
    };

    connect();
    return () => {
      es?.close();
      clearTimeout(reconnectTimer);
    };
  }, [applyPayload]);

  // Reset myChoice when a new round starts
  const prevGameIdRef = useRef<string | null>(null);
  const gameId = game?.id ?? null;
  useEffect(() => {
    if (!gameId) return;
    if (gameId !== prevGameIdRef.current) {
      prevGameIdRef.current = gameId;
      queueMicrotask(() => setMyChoice(null));
    }
  }, [gameId]);

  // Confetti on goal
  useEffect(() => {
    if (game?.status !== "finished" || !game.outcome || !game.resolvedAt) return;
    const key = `${game.id}-${game.resolvedAt}`;
    if (confettiFiredRef.current === key) return;
    confettiFiredRef.current = key;
    if (game.outcome === "goal") {
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
    }
  }, [game?.status, game?.outcome, game?.resolvedAt, game?.id]);

  // ------- Derived state -------
  const isGoalkeeper = !!visitorId && game?.goalkeeper?.visitorId === visitorId;
  const isShooter = !!visitorId && game?.shooter?.visitorId === visitorId;
  const isPlaying = isGoalkeeper || isShooter;
  const myRole: PenalitosRole | null = isGoalkeeper ? "goalkeeper" : isShooter ? "shooter" : null;

  const queuePosition = useMemo(
    () => (visitorId ? queue.findIndex((e) => e.visitorId === visitorId) + 1 : 0),
    [queue, visitorId]
  );
  const isInQueue = queuePosition > 0;

  const chooseDeadlineMs = game?.chooseDeadline ? new Date(game.chooseDeadline).getTime() : null;
  const timerSec = chooseDeadlineMs
    ? Math.max(0, Math.ceil((chooseDeadlineMs - nowMs) / 1000))
    : 0;
  const timerPct = chooseDeadlineMs
    ? Math.max(0, Math.min(100, ((chooseDeadlineMs - nowMs) / 10_000) * 100))
    : 0;

  const resolvedAtMs = game?.resolvedAt ? new Date(game.resolvedAt).getTime() : null;
  const isAnimating =
    game?.status === "finished" && resolvedAtMs !== null && nowMs - resolvedAtMs < ANIM_DURATION_MS;
  const showResult =
    game?.status === "finished" && resolvedAtMs !== null && nowMs - resolvedAtMs >= ANIM_DURATION_MS;

  const serverChoice =
    myRole === "goalkeeper"
      ? game?.goalkeeperChoice ?? null
      : myRole === "shooter"
      ? game?.shooterChoice ?? null
      : null;
  const selectedChoice = myChoice ?? serverChoice;
  const canChoose =
    game?.status === "choosing" && isPlaying && selectedChoice === null;
  const alreadyChose = isPlaying && selectedChoice !== null;

  const showJoinGoalkeeper = !isPlaying && !isInQueue && (!game || game.status === "waiting") && !game?.goalkeeper;
  const showJoinShooter = !isPlaying && !isInQueue && (!game || game.status === "waiting") && !game?.shooter;
  const showQueue = !isPlaying && !isInQueue && !showJoinGoalkeeper && !showJoinShooter;

  const ballDirX = game?.shooterChoice ? BALL_X[game.shooterChoice] : "0px";
  const ballDirY = game?.shooterChoice ? BALL_Y[game.shooterChoice] : "0px";
  const gkDirX = game?.goalkeeperChoice ? GK_X[game.goalkeeperChoice] : "0px";

  const topScorers = useMemo(
    () => Object.entries(scores).sort(([, a], [, b]) => b - a).slice(0, 5),
    [scores]
  );

  // Use SSE liveMatch for real-time score; fall back to prop
  const displayMatch: LiveMatchSnapshot | MundialMatch | null = sseLiveMatch ?? liveMatch;

  // ------- Handlers -------
  const joinAs = useCallback(async (role: PenalitosRole) => {
    if (!visitorId || isPlaying || isInQueue) return;
    try {
      await fetch("/api/mundial/penalitos/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, name: displayName, role }),
      });
    } catch (err) {
      console.error("[penalitos] join error", err);
    }
  }, [displayName, isInQueue, isPlaying, visitorId]);

  const joinQueue = useCallback(async (role: PenalitosRole) => {
    if (!visitorId || isPlaying || isInQueue) return;
    try {
      await fetch("/api/mundial/penalitos/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, name: displayName, role }),
      });
    } catch (err) {
      console.error("[penalitos] queue error", err);
    }
  }, [displayName, isInQueue, isPlaying, visitorId]);

  const leaveQueue = useCallback(async () => {
    if (!visitorId) return;
    try {
      await fetch("/api/mundial/penalitos/join", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });
    } catch {}
  }, [visitorId]);

  const makeChoice = useCallback(async (choice: PenalitosDirection) => {
    if (!canChoose || !visitorId) return;
    setMyChoice(choice);
    try {
      const res = await fetch("/api/mundial/penalitos/choice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, choice }),
      });
      if (!res.ok) {
        setMyChoice(null);
        return;
      }
      const data = await res.json() as Partial<SSEPayload>;
      if (data.game !== undefined || data.queue !== undefined || data.scores !== undefined) {
        applyPayload({
          game: data.game ?? null,
          queue: data.queue ?? [],
          scores: data.scores ?? {},
          liveMatch: data.liveMatch ?? null,
          viewerCount: data.viewerCount ?? 0,
        });
      }
    } catch {
      setMyChoice(null);
    }
  }, [applyPayload, canChoose, visitorId]);

  // ------- Empty state -------
  if (!liveMatch && !sseLiveMatch) {
    return (
      <div className="mt-8 rounded-3xl border border-white/10 bg-black/40 p-8 text-center">
        <p className="font-black text-white/50 text-lg">
          Penalitos se activa cuando empiece un partido en vivo ⚽
        </p>
      </div>
    );
  }

  // ------- Status badge -------
  const statusBadge = game?.status === "waiting"
    ? { text: "ESPERANDO JUGADORES", color: "text-white/50 bg-white/5" }
    : game?.status === "choosing"
    ? { text: `ELIGIENDO • ${timerSec}s`, color: "text-[#f0b429] bg-[#f0b429]/10 animate-pulse" }
    : game?.status === "finished" && isAnimating
    ? { text: "EN VUELO...", color: "text-blue-300 bg-blue-900/20" }
    : game?.status === "finished"
    ? {
        text: game.outcome === "goal" ? "¡GOL! ⚽" : "¡PARADA! 🧤",
        color: game.outcome === "goal"
          ? "text-emerald-300 bg-emerald-900/30"
          : "text-orange-300 bg-orange-900/30",
      }
    : { text: "EN ESPERA", color: "text-white/30 bg-white/5" };

  return (
    <div className="mt-6 md:mt-10 px-1 sm:px-2">
      <div className="rounded-3xl border border-[#f0b429]/20 bg-gradient-to-br from-[#091a0f] via-black/95 to-black shadow-2xl overflow-hidden">

        {/* ═══ HEADER ═══ */}
        <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-white/5">
          {/* Row 1: title + round + status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#f0b429] p-2.5 text-black text-2xl leading-none">⚽</div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tighter leading-none">
                  PENALITOS
                </h2>
                <p className="text-white/40 text-xs mt-0.5 font-bold uppercase tracking-widest">
                  Mini-partido en vivo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {game && (
                <span className="text-xs text-white/40 font-mono">
                  Ronda {game.roundNumber}
                </span>
              )}
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                statusBadge.color
              )}>
                {statusBadge.text}
              </span>
            </div>
          </div>

          {/* Row 2: live score chip + viewers + connection */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {displayMatch && (
              <LiveScoreChip match={displayMatch} />
            )}

            <span className="text-white/30 text-xs">
              {displayMatch
                ? `${displayMatch.homeTeam} vs ${displayMatch.awayTeam}`
                : (liveMatch?.homeTeam ?? "") + " vs " + (liveMatch?.awayTeam ?? "")}
            </span>

            <div className="ml-auto flex items-center gap-3">
              {viewerCount > 1 && (
                <div className="flex items-center gap-1 text-white/35 text-[11px] font-bold">
                  <Eye className="h-3 w-3" />
                  <span>{viewerCount}</span>
                </div>
              )}

              {reconnecting ? (
                <span className="flex items-center gap-1 text-[10px] font-black text-orange-400 animate-pulse">
                  <WifiOff className="h-3.5 w-3.5" />
                  RECONECTANDO
                </span>
              ) : connected ? (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                  <Wifi className="h-3.5 w-3.5" />
                  LIVE
                </span>
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-red-400" />
              )}
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-5 space-y-5">

          {/* ═══ TIMER BAR ═══ */}
          {game?.status === "choosing" && (
            <div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${timerPct}%`,
                    background: timerPct > 40
                      ? "linear-gradient(90deg,#f0b429,#fde68a)"
                      : timerPct > 15
                      ? "linear-gradient(90deg,#f97316,#fbbf24)"
                      : "linear-gradient(90deg,#ef4444,#f97316)",
                  }}
                />
              </div>
            </div>
          )}

          {/* ═══ SOCCER FIELD ═══ */}
          <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden bg-[#0a3d1f] border border-white/5 shadow-inner">
            {/* Field grid */}
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* Penalty arc */}
            <div className="absolute left-14 top-1/2 -translate-y-1/2 w-16 h-28 rounded-r-full border-2 border-white/20 border-l-0" />
            {/* Goal post */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-32 border-4 border-white/60 rounded-r-2xl border-l-0 bg-black/20" />

            {/* Goalkeeper emoji */}
            <div
              className="absolute text-5xl drop-shadow-xl transition-transform duration-700"
              style={{
                left: "24px",
                top: "50%",
                transform: `translateY(-50%) translateX(${isAnimating || showResult ? gkDirX : "0px"})`,
              }}
            >
              🧤
            </div>

            {/* Shooter emoji */}
            <div className="absolute right-8 bottom-8 text-4xl drop-shadow-xl">🥾</div>

            {/* Ball */}
            <div
              className="absolute text-5xl drop-shadow-xl transition-all duration-700"
              style={{
                left: "50%",
                top: "55%",
                transform: `translate(-50%, -50%) translateX(${isAnimating || showResult ? `calc(${ballDirX} - 80px)` : "0px"}) translateY(${isAnimating || showResult ? ballDirY : "0px"})`,
              }}
            >
              ⚽
            </div>

            {/* Result overlay */}
            {showResult && game?.outcome && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                {game.outcome === "goal" ? (
                  <>
                    <p className="text-6xl sm:text-7xl font-black text-emerald-300 drop-shadow-2xl tracking-tight">
                      ¡GOL!
                    </p>
                    <p className="text-white/70 text-sm mt-2 font-bold">
                      🥾 {game.shooter?.name} anotó
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-5xl sm:text-6xl font-black text-orange-300 drop-shadow-2xl tracking-tight">
                      ¡PARADA!
                    </p>
                    <p className="text-white/70 text-sm mt-2 font-bold">
                      🧤 {game.goalkeeper?.name} lo atajó
                    </p>
                  </>
                )}
                <div className="mt-4 flex gap-6 text-xs font-mono text-white/50">
                  {game.goalkeeperChoice && (
                    <span>🧤 {game.goalkeeperChoice === "left" ? "←" : game.goalkeeperChoice === "center" ? "↑" : "→"}</span>
                  )}
                  {game.shooterChoice && (
                    <span>🥾 {game.shooterChoice === "left" ? "←" : game.shooterChoice === "center" ? "↑" : "→"}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ═══ PLAYER CARDS ═══ */}
          <div className="grid grid-cols-2 gap-3">
            <PlayerCard
              emoji="🧤"
              label="Portero"
              labelColor="text-emerald-400"
              name={game?.goalkeeper?.name ?? null}
              isMe={isGoalkeeper}
              choice={game?.goalkeeperChoice ?? null}
              revealed={showResult}
            />
            <PlayerCard
              emoji="🥾"
              label="Lanzador"
              labelColor="text-orange-400"
              name={game?.shooter?.name ?? null}
              isMe={isShooter}
              choice={game?.shooterChoice ?? null}
              revealed={showResult}
            />
          </div>

          {/* ═══ DIRECTION BUTTONS ═══ */}
          {(game?.status === "choosing" || alreadyChose) && isPlaying && (
            <div>
              <p className="text-center mb-3 font-black text-sm uppercase tracking-widest text-white/60">
                {myRole === "goalkeeper" ? "🧤 ¿A dónde te tiras?" : "🥾 ¿A dónde disparas?"}
              </p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {CHOICES.map((dir) => (
                  <DirectionButton
                    key={dir}
                    dir={dir}
                    chosen={selectedChoice}
                    disabled={!!selectedChoice}
                    onChoose={makeChoice}
                  />
                ))}
              </div>
              {alreadyChose && (
                <p className="text-center mt-3 text-[#f0b429] text-sm font-bold animate-pulse">
                  ✓ Elegiste. Esperando al contrincante...
                </p>
              )}
            </div>
          )}

          {/* ═══ SPECTATOR MESSAGE ═══ */}
          {game?.status === "choosing" && !isPlaying && (
            <p className="text-center text-white/40 text-sm italic">
              Ronda en curso — únete a la cola para jugar.
            </p>
          )}

          {/* ═══ JOIN / QUEUE BUTTONS ═══ */}
          {(showJoinGoalkeeper || showJoinShooter) && (
            <div className={cn("grid gap-3", showJoinGoalkeeper && showJoinShooter ? "grid-cols-2" : "grid-cols-1")}>
              {showJoinGoalkeeper && (
                <button
                  onClick={() => joinAs("goalkeeper")}
                  className="py-5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 font-black text-lg transition active:scale-95"
                >
                  🧤 SER PORTERO
                </button>
              )}
              {showJoinShooter && (
                <button
                  onClick={() => joinAs("shooter")}
                  className="py-5 rounded-2xl bg-orange-700 hover:bg-orange-600 font-black text-lg transition active:scale-95"
                >
                  🥾 SER LANZADOR
                </button>
              )}
            </div>
          )}

          {showQueue && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => joinQueue("goalkeeper")}
                className="py-4 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800/60 font-bold text-sm transition border border-emerald-700/30 active:scale-95"
              >
                🧤 Cola portero
              </button>
              <button
                onClick={() => joinQueue("shooter")}
                className="py-4 rounded-2xl bg-orange-900/60 hover:bg-orange-800/60 font-bold text-sm transition border border-orange-700/30 active:scale-95"
              >
                🥾 Cola lanzador
              </button>
            </div>
          )}

          {isInQueue && (
            <div className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3">
              <p className="text-sm font-bold text-white/70">
                Estás <span className="text-[#f0b429] font-black">#{queuePosition}</span> en la cola
              </p>
              <button
                onClick={leaveQueue}
                className="text-xs text-white/40 hover:text-white/70 transition"
              >
                Salir
              </button>
            </div>
          )}

          {isPlaying && game?.status === "waiting" && (
            <p className="text-center text-white/50 text-sm animate-pulse">
              Esperando al otro jugador...
            </p>
          )}

          {/* ═══ QUEUE LIST ═══ */}
          {queue.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-3.5 w-3.5 text-white/30" />
                <p className="text-xs uppercase tracking-widest text-white/30">
                  Cola de espera ({queue.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {queue.map((p, i) => (
                  <div
                    key={p.visitorId + i}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                      p.visitorId === visitorId
                        ? "bg-[#f0b429]/20 text-[#f0b429] ring-1 ring-[#f0b429]/40"
                        : "bg-white/8 text-white/60"
                    )}
                  >
                    <span className="tabular-nums text-white/30">#{i + 1}</span>
                    {p.name}
                    {p.preferredRole === "goalkeeper" ? " 🧤" : " 🥾"}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ SCOREBOARD ═══ */}
          {topScorers.length > 0 && (
            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-3.5 w-3.5 text-[#f0b429]" />
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Goleadores de la sesión
                </p>
              </div>
              <div className="space-y-1.5">
                {topScorers.map(([name, goals], i) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-xs text-white/30 tabular-nums w-4">{i + 1}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#f0b429]/70 to-[#f0b429]/40 rounded-full flex items-center px-2"
                        style={{
                          width: `${Math.min(100, (goals / (topScorers[0][1] || 1)) * 100)}%`,
                          minWidth: "2rem",
                        }}
                      >
                        <span className="text-[10px] font-black text-black/80 truncate">{name}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#f0b429] tabular-nums w-8 text-right">
                      {goals}⚽
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
