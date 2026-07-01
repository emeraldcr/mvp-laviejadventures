"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import * as THREE from "three";
import { GAME_LEVELS } from "../data/levelData";

// ── Dynamic import to avoid SSR ───────────────────────────────────────────────
const Game = dynamic(() => import("../components/Game"), { ssr: false });

// ── Types (mirrored from race.ts serializer) ──────────────────────────────────
type RacePlayerView = {
  id: string;
  name: string;
  ready: boolean;
  pct: number;
  finished: boolean;
  rank: number | null;
  finishedAt: number | null;
};

type RaceRoomView = {
  code: string;
  hostId: string;
  status: "lobby" | "racing" | "finished";
  levelIndex: number;
  players: RacePlayerView[];
  startedAt: string | null;
  updatedAt: string;
  version: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function getOrCreateId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("race_player_id");
  if (!id) { id = genId(); localStorage.setItem("race_player_id", id); }
  return id;
}

function getSavedName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("race_player_name") ?? "";
}

const WS_URL = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_WS_URL ?? `ws://${window.location.hostname}:3001`)
  : "ws://localhost:3001";

const PLAYER_COLORS = ["#00e676", "#ff6b35", "#4fc3f7", "#ffd700", "#e040fb", "#ff4081", "#64dd17", "#ff6d00"];

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  root: {
    minHeight: "100vh",
    background: "#060c10",
    color: "#e0e0e0",
    fontFamily: '"Courier New", monospace',
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
  },
  card: {
    background: "#0d1a12",
    border: "1px solid #1a3a20",
    borderRadius: 12,
    padding: "32px 28px",
    maxWidth: 480,
    width: "100%",
    boxShadow: "0 0 40px rgba(0,230,118,0.08)",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#00e676",
    marginBottom: 6,
    textShadow: "0 0 16px rgba(0,230,118,0.6)",
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 12,
    color: "#4caf50",
    marginBottom: 28,
    textAlign: "center" as const,
    letterSpacing: 2,
  },
  label: { fontSize: 11, color: "#4caf50", letterSpacing: 1.5, marginBottom: 6 },
  input: {
    width: "100%",
    background: "#111d14",
    border: "1px solid #2a4a2e",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#e0e0e0",
    fontFamily: '"Courier New", monospace',
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
    marginBottom: 16,
  },
  btn: (primary = true) => ({
    width: "100%",
    padding: "12px 0",
    borderRadius: 8,
    border: "none",
    background: primary ? "#00e676" : "#1a3a20",
    color: primary ? "#060c10" : "#00e676",
    fontFamily: '"Courier New", monospace',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: 1,
    cursor: "pointer",
    marginBottom: 10,
    transition: "opacity 0.15s",
  }),
  divider: {
    display: "flex" as const,
    alignItems: "center",
    gap: 10,
    margin: "16px 0",
  },
  dividerLine: { flex: 1, height: 1, background: "#1a3a20" },
  dividerText: { fontSize: 11, color: "#2a5a30", letterSpacing: 1 },
  codeBox: {
    background: "#111d14",
    border: "2px solid #00e676",
    borderRadius: 10,
    padding: "18px 20px",
    marginBottom: 24,
    textAlign: "center" as const,
  },
  codeNum: {
    fontSize: 38,
    fontWeight: 900,
    color: "#00e676",
    letterSpacing: 10,
    textShadow: "0 0 20px rgba(0,230,118,0.8)",
    fontVariantNumeric: "tabular-nums",
  },
  codeHint: { fontSize: 11, color: "#4caf50", marginTop: 6, letterSpacing: 1 },
  playerRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 0",
    borderBottom: "1px solid #1a3a20",
  },
  playerDot: (color: string) => ({
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
    boxShadow: `0 0 6px ${color}`,
  }),
  badge: (ok: boolean) => ({
    marginLeft: "auto",
    fontSize: 10,
    letterSpacing: 1,
    padding: "2px 8px",
    borderRadius: 4,
    background: ok ? "#1b3a1f" : "#1a1a1a",
    color: ok ? "#00e676" : "#555",
    border: `1px solid ${ok ? "#2a5a2e" : "#333"}`,
  }),
  raceOverlay: {
    position: "fixed" as const,
    top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: "none" as const,
    zIndex: 20,
  },
  racePanel: {
    position: "absolute" as const,
    top: 16, right: 16,
    background: "rgba(6,12,16,0.88)",
    border: "1px solid #1a3a20",
    borderRadius: 10,
    padding: "14px 16px",
    minWidth: 180,
    pointerEvents: "auto" as const,
    backdropFilter: "blur(6px)",
  },
  raceTitle: {
    fontSize: 10,
    color: "#4caf50",
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: "center" as const,
  },
  progressBar: (pct: number, color: string) => ({
    height: 6,
    borderRadius: 3,
    background: "#1a3a20",
    overflow: "hidden" as const,
    marginTop: 4,
    marginBottom: 8,
  }),
  progressFill: (pct: number, color: string) => ({
    height: "100%",
    width: `${pct}%`,
    background: color,
    borderRadius: 3,
    boxShadow: `0 0 6px ${color}`,
    transition: "width 0.4s ease",
  }),
  error: { color: "#ef5350", fontSize: 12, marginBottom: 12, textAlign: "center" as const },
  hint: { color: "#4caf50", fontSize: 11, textAlign: "center" as const, marginTop: 8, letterSpacing: 0.5 },
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function OnlineGameClient() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get("code")?.toUpperCase() ?? "";

  // Player identity
  const [playerId] = useState<string>(() => getOrCreateId());
  const [name, setName] = useState<string>(() => getSavedName());
  const [nameSubmitted, setNameSubmitted] = useState(() => !!getSavedName());

  // Room state
  const [room, setRoom] = useState<RaceRoomView | null>(null);
  const [joinCode, setJoinCode] = useState(inviteCode);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // WS
  const wsRef = useRef<WebSocket | null>(null);
  const roomRef = useRef<RaceRoomView | null>(null);

  // Race mode: shared position ref for progress polling
  const sharedPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [myPct, setMyPct] = useState(0);

  roomRef.current = room;

  // ── Apply room update ────────────────────────────────────────────────────────
  const applyRoom = useCallback((r: RaceRoomView) => {
    setRoom(r);
  }, []);

  // ── WS subscribe ─────────────────────────────────────────────────────────────
  const subscribeWs = useCallback((code: string) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => ws.send(JSON.stringify({ action: "subscribe_race", code }));
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === "race_room" && msg.room) applyRoom(msg.room);
      } catch {}
    };
    ws.onclose = () => { if (wsRef.current === ws) wsRef.current = null; };
  }, [applyRoom]);

  // ── Progress polling during race ─────────────────────────────────────────────
  const startProgressPolling = useCallback((code: string, levelIndex: number) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    const level = GAME_LEVELS[levelIndex] ?? GAME_LEVELS[0];
    const spawnX = level.spawnPosition[0];
    const goalX  = level.goalPosition[0];
    const span   = goalX - spawnX;

    progressIntervalRef.current = setInterval(async () => {
      const px = sharedPosRef.current.x;
      const pct = Math.min(100, Math.max(0, ((px - spawnX) / span) * 100));
      setMyPct(Math.round(pct));
      if (pct < 100) {
        try {
          await fetch("/api/race/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, playerId, pct }),
          });
        } catch {}
      }
    }, 400);
  }, [playerId]);

  const stopProgressPolling = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    stopProgressPolling();
    wsRef.current?.close();
  }, [stopProgressPolling]);

  // Auto-join if arrived via invite link and name is already set
  useEffect(() => {
    if (inviteCode && nameSubmitted && !room) {
      setJoinCode(inviteCode);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Start polling when race begins ───────────────────────────────────────────
  useEffect(() => {
    if (room?.status === "racing") {
      startProgressPolling(room.code, room.levelIndex);
    } else {
      stopProgressPolling();
    }
  }, [room?.status, room?.code, room?.levelIndex, startProgressPolling, stopProgressPolling]);

  // ── Actions ───────────────────────────────────────────────────────────────────
  async function doCreate() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/race/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: playerId, name }),
      });
      const j = await res.json();
      if (!j.ok) { setError(j.error ?? "Error al crear"); return; }
      applyRoom(j.room);
      subscribeWs(j.code);
    } catch { setError("Error de red"); }
    finally { setLoading(false); }
  }

  async function doJoin() {
    if (!joinCode.trim()) { setError("Ingresa el código"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/race/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim(), playerId, name }),
      });
      const j = await res.json();
      if (!j.ok) {
        setError(
          j.error === "room_not_found" ? "Sala no encontrada" :
          j.error === "already_started" ? "La carrera ya empezó" :
          j.error === "room_full" ? "Sala llena (máx 8)" :
          j.error ?? "Error"
        );
        return;
      }
      applyRoom(j.room);
      subscribeWs(joinCode.trim().toUpperCase());
    } catch { setError("Error de red"); }
    finally { setLoading(false); }
  }

  async function doToggleReady() {
    if (!room) return;
    const me = room.players.find((p) => p.id === playerId);
    const newReady = !(me?.ready ?? false);
    setLoading(true);
    try {
      const res = await fetch("/api/race/ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: room.code, playerId, ready: newReady }),
      });
      const j = await res.json();
      if (j.ok) applyRoom(j.room);
    } catch { setError("Error"); }
    finally { setLoading(false); }
  }

  async function doStart() {
    if (!room) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/race/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: room.code, hostId: playerId }),
      });
      const j = await res.json();
      if (!j.ok) { setError(j.error === "need_more_players" ? "Necesitas al menos 2 jugadores" : j.error ?? "Error"); return; }
      applyRoom(j.room);
    } catch { setError("Error"); }
    finally { setLoading(false); }
  }

  async function doWin() {
    if (!room) return;
    stopProgressPolling();
    try {
      await fetch("/api/race/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: room.code, playerId }),
      });
    } catch {}
  }

  function doLeave() {
    stopProgressPolling();
    wsRef.current?.close();
    wsRef.current = null;
    setRoom(null);
    setMyPct(0);
    setError("");
  }

  // ── Name step ────────────────────────────────────────────────────────────────
  if (!nameSubmitted) {
    return (
      <div style={S.root}>
        <div style={S.card}>
          <div style={S.title}>👻 CARRERA ONLINE</div>
          <div style={S.subtitle}>FANTASMA DE LA CIUDAD ESMERALDA</div>
          <div style={S.label}>TU NOMBRE</div>
          <input
            style={S.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Escribe tu nombre..."
            maxLength={18}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) {
                localStorage.setItem("race_player_name", name.trim());
                setName(name.trim());
                setNameSubmitted(true);
              }
            }}
          />
          <button
            style={S.btn(true)}
            disabled={!name.trim()}
            onClick={() => {
              localStorage.setItem("race_player_name", name.trim());
              setName(name.trim());
              setNameSubmitted(true);
            }}
          >
            CONTINUAR →
          </button>
        </div>
      </div>
    );
  }

  // ── Main menu (no room yet) ───────────────────────────────────────────────────
  if (!room) {
    return (
      <div style={S.root}>
        <div style={S.card}>
          <div style={S.title}>👻 CARRERA ONLINE</div>
          <div style={S.subtitle}>HOLA, {name.toUpperCase()}</div>

          {error && <div style={S.error}>⚠ {error}</div>}

          <button style={S.btn(true)} onClick={doCreate} disabled={loading}>
            {loading ? "..." : "＋ CREAR SALA"}
          </button>

          <div style={S.divider}>
            <div style={S.dividerLine} /> <div style={S.dividerText}>O</div> <div style={S.dividerLine} />
          </div>

          <div style={S.label}>CÓDIGO DE SALA</div>
          <input
            style={{ ...S.input, textTransform: "uppercase", letterSpacing: 6, textAlign: "center" }}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="XXXX"
            maxLength={4}
            onKeyDown={(e) => { if (e.key === "Enter") doJoin(); }}
          />
          <button style={S.btn(false)} onClick={doJoin} disabled={loading || !joinCode.trim()}>
            {loading ? "..." : "UNIRSE A SALA →"}
          </button>

          <div style={S.hint}>
            <span style={{ cursor: "pointer", color: "#2a5a30" }} onClick={() => setNameSubmitted(false)}>
              cambiar nombre
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Lobby ─────────────────────────────────────────────────────────────────────
  if (room.status === "lobby") {
    const isHost = room.hostId === playerId;
    const me = room.players.find((p) => p.id === playerId);
    const allReady = room.players.length >= 2 && room.players.every((p) => p.ready);
    const shareUrl = typeof window !== "undefined"
      ? `${window.location.origin}/mapa/juego/online?code=${room.code}`
      : "";

    return (
      <div style={S.root}>
        <div style={{ ...S.card, maxWidth: 520 }}>
          <div style={S.title}>🏁 SALA DE CARRERA</div>

          <div style={S.codeBox}>
            <div style={S.codeNum}>{room.code}</div>
            <div style={S.codeHint}>Comparte este código para que otros se unan</div>
            {shareUrl && (
              <div
                style={{ fontSize: 10, color: "#2a5a30", marginTop: 8, cursor: "pointer" }}
                onClick={() => { navigator.clipboard?.writeText(shareUrl); }}
                title="Clic para copiar link"
              >
                📋 {shareUrl}
              </div>
            )}
          </div>

          {error && <div style={S.error}>⚠ {error}</div>}

          <div style={{ fontSize: 11, color: "#4caf50", letterSpacing: 1, marginBottom: 10 }}>
            JUGADORES ({room.players.length}/8)
          </div>

          {room.players.map((p, i) => (
            <div key={p.id} style={S.playerRow}>
              <div style={S.playerDot(PLAYER_COLORS[i % PLAYER_COLORS.length])} />
              <span style={{ fontSize: 13, flex: 1 }}>
                {p.name}
                {p.id === room.hostId && <span style={{ color: "#ffd700", fontSize: 10, marginLeft: 6 }}>HOST</span>}
                {p.id === playerId && <span style={{ color: "#4fc3f7", fontSize: 10, marginLeft: 6 }}>TÚ</span>}
              </span>
              <div style={S.badge(p.ready)}>{p.ready ? "✓ LISTO" : "ESPERANDO"}</div>
            </div>
          ))}

          {room.players.length < 2 && (
            <div style={{ ...S.hint, marginTop: 16 }}>
              Esperando más jugadores… comparte el código <strong style={{ color: "#00e676" }}>{room.code}</strong>
            </div>
          )}

          <div style={{ height: 20 }} />

          {/* Ready toggle for non-hosts (hosts don't need to ready up, they start) */}
          {!isHost && (
            <button
              style={S.btn(me?.ready ? false : true)}
              onClick={doToggleReady}
              disabled={loading}
            >
              {loading ? "..." : me?.ready ? "✓ LISTO — click para cancelar" : "MARCAR COMO LISTO"}
            </button>
          )}

          {isHost && (
            <button
              style={{
                ...S.btn(true),
                opacity: allReady ? 1 : 0.45,
                cursor: allReady ? "pointer" : "not-allowed",
              }}
              onClick={doStart}
              disabled={loading || !allReady}
              title={!allReady ? "Todos los jugadores deben estar listos" : ""}
            >
              {loading ? "..." : allReady ? "🚀 INICIAR CARRERA" : "🚀 INICIAR (esperando listos)"}
            </button>
          )}

          <button style={{ ...S.btn(false), marginTop: 4 }} onClick={doLeave}>
            SALIR DE SALA
          </button>
        </div>
      </div>
    );
  }

  // ── Racing ────────────────────────────────────────────────────────────────────
  if (room.status === "racing") {
    const me = room.players.find((p) => p.id === playerId);
    const myFinished = me?.finished ?? false;

    return (
      <div style={{ position: "fixed", inset: 0, background: "#060c10" }}>
        {/* 3D Game */}
        <Game
          sharedPosRef={sharedPosRef}
          onRaceWin={doWin}
          raceLevelIndex={room.levelIndex}
          racePlayerName={name}
        />

        {/* Race overlay */}
        <div style={S.raceOverlay}>
          <div style={S.racePanel}>
            <div style={S.raceTitle}>🏁 CARRERA EN VIVO</div>
            {room.players
              .slice()
              .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))
              .map((p, i) => {
                const color = PLAYER_COLORS[room.players.indexOf(p) % PLAYER_COLORS.length];
                const isMe = p.id === playerId;
                return (
                  <div key={p.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: isMe ? "#00e676" : "#aaa", fontWeight: isMe ? 700 : 400 }}>
                        {i + 1}. {p.name.slice(0, 12)}{isMe ? " ★" : ""}
                      </span>
                      <span style={{ fontSize: 10, color: p.finished ? "#ffd700" : "#555" }}>
                        {p.finished ? `#${p.rank}` : `${Math.round(isMe ? myPct : (p.pct ?? 0))}%`}
                      </span>
                    </div>
                    <div style={S.progressBar(p.pct, color)}>
                      <div style={S.progressFill(isMe ? myPct : (p.pct ?? 0), color)} />
                    </div>
                  </div>
                );
              })}
            {myFinished && (
              <div style={{ textAlign: "center", color: "#ffd700", fontSize: 11, marginTop: 8 }}>
                ¡TERMINASTE! Posición #{me?.rank}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Finished / Podium ─────────────────────────────────────────────────────────
  const sorted = [...room.players].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={S.root}>
      <div style={{ ...S.card, maxWidth: 460 }}>
        <div style={S.title}>🏁 CARRERA TERMINADA</div>
        <div style={S.subtitle}>RESULTADOS FINALES</div>

        <div style={{ marginBottom: 24 }}>
          {sorted.map((p, i) => {
            const color = PLAYER_COLORS[room.players.indexOf(p) % PLAYER_COLORS.length];
            const isMe = p.id === playerId;
            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: isMe ? "rgba(0,230,118,0.07)" : "transparent",
                  border: isMe ? "1px solid #1a3a20" : "1px solid transparent",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 22, minWidth: 30 }}>{medals[i] ?? `${i + 1}.`}</span>
                <div style={S.playerDot(color)} />
                <span style={{ flex: 1, fontSize: 14, color: isMe ? "#00e676" : "#e0e0e0", fontWeight: isMe ? 700 : 400 }}>
                  {p.name}{isMe ? " (TÚ)" : ""}
                </span>
                {p.finishedAt && room.startedAt && (
                  <span style={{ fontSize: 11, color: "#4caf50" }}>
                    {((p.finishedAt - new Date(room.startedAt).getTime()) / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button style={S.btn(true)} onClick={doLeave}>
          VOLVER AL MENÚ
        </button>
      </div>
    </div>
  );
}
