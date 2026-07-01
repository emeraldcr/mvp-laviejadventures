"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GAME_LEVELS } from "../../data/levelData";
import { WS_URL } from "../../constants/online";
import { getOrCreateId, getSavedName } from "../../lib/onlineId";
import {
  createRaceRoom,
  finishRaceRoom,
  joinRaceRoom,
  setRaceReady,
  startRaceRoom,
  updateRaceProgress,
} from "../lib/raceApi";
import type { RaceRoomView } from "../types";

const getRaceError = (error?: string) => {
  if (error === "room_not_found") return "Sala no encontrada";
  if (error === "already_started") return "La carrera ya empezo";
  if (error === "room_full") return "Sala llena (max 8)";
  if (error === "need_more_players") return "Necesitas al menos 2 jugadores";
  return error ?? "Error";
};

export function useOnlineRace(inviteCode: string) {
  const [playerId] = useState<string>(() => getOrCreateId());
  const [name, setName] = useState<string>(() => getSavedName());
  const [nameSubmitted, setNameSubmitted] = useState(() => !!getSavedName());
  const [room, setRoom] = useState<RaceRoomView | null>(null);
  const [joinCode, setJoinCode] = useState(inviteCode);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [myPct, setMyPct] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const sharedPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyRoom = useCallback((nextRoom: RaceRoomView) => {
    setRoom(nextRoom);
  }, []);

  const subscribeWs = useCallback((code: string) => {
    wsRef.current?.close();
    wsRef.current = null;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => ws.send(JSON.stringify({ action: "subscribe_race", code }));
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg?.type === "race_room" && msg.room) applyRoom(msg.room);
      } catch {}
    };
    ws.onclose = () => {
      if (wsRef.current === ws) wsRef.current = null;
    };
  }, [applyRoom]);

  const stopProgressPolling = useCallback(() => {
    if (!progressIntervalRef.current) return;
    clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = null;
  }, []);

  const startProgressPolling = useCallback((code: string, levelIndex: number) => {
    stopProgressPolling();

    const level = GAME_LEVELS[levelIndex] ?? GAME_LEVELS[0];
    const spawnX = level.spawnPosition[0];
    const goalX = level.goalPosition[0];
    const span = goalX - spawnX;

    progressIntervalRef.current = setInterval(async () => {
      const px = sharedPosRef.current.x;
      const pct = Math.min(100, Math.max(0, ((px - spawnX) / span) * 100));
      setMyPct(Math.round(pct));

      if (pct >= 100) return;

      try {
        await updateRaceProgress(code, playerId, pct);
      } catch {}
    }, 400);
  }, [playerId, stopProgressPolling]);

  useEffect(() => () => {
    stopProgressPolling();
    wsRef.current?.close();
  }, [stopProgressPolling]);

  useEffect(() => {
    if (inviteCode && nameSubmitted && !room) {
      setJoinCode(inviteCode);
    }
  }, [inviteCode, nameSubmitted, room]);

  useEffect(() => {
    if (room?.status === "racing") {
      startProgressPolling(room.code, room.levelIndex);
      return;
    }

    stopProgressPolling();
  }, [room?.status, room?.code, room?.levelIndex, startProgressPolling, stopProgressPolling]);

  const submitName = useCallback((nextName: string) => {
    const safeName = nextName.trim();
    if (!safeName) return;
    localStorage.setItem("race_player_name", safeName);
    setName(safeName);
    setNameSubmitted(true);
  }, []);

  const createRoom = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const json = await createRaceRoom(playerId, name);
      if (!json.ok || !json.room || !json.code) {
        setError(json.error ?? "Error al crear");
        return;
      }
      applyRoom(json.room);
      subscribeWs(json.code);
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }, [applyRoom, name, playerId, subscribeWs]);

  const joinRoom = useCallback(async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setError("Ingresa el codigo");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const json = await joinRaceRoom(code, playerId, name);
      if (!json.ok || !json.room) {
        setError(getRaceError(json.error));
        return;
      }
      applyRoom(json.room);
      subscribeWs(code);
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }, [applyRoom, joinCode, name, playerId, subscribeWs]);

  const toggleReady = useCallback(async () => {
    if (!room) return;
    const me = room.players.find((player) => player.id === playerId);
    const ready = !(me?.ready ?? false);

    setLoading(true);
    try {
      const json = await setRaceReady(room.code, playerId, ready);
      if (json.ok && json.room) applyRoom(json.room);
    } catch {
      setError("Error");
    } finally {
      setLoading(false);
    }
  }, [applyRoom, playerId, room]);

  const startRace = useCallback(async () => {
    if (!room) return;

    setLoading(true);
    setError("");
    try {
      const json = await startRaceRoom(room.code, playerId);
      if (!json.ok || !json.room) {
        setError(getRaceError(json.error));
        return;
      }
      applyRoom(json.room);
    } catch {
      setError("Error");
    } finally {
      setLoading(false);
    }
  }, [applyRoom, playerId, room]);

  const finishRace = useCallback(async () => {
    if (!room) return;
    stopProgressPolling();

    try {
      await finishRaceRoom(room.code, playerId);
    } catch {}
  }, [playerId, room, stopProgressPolling]);

  const leaveRoom = useCallback(() => {
    stopProgressPolling();
    wsRef.current?.close();
    wsRef.current = null;
    setRoom(null);
    setMyPct(0);
    setError("");
  }, [stopProgressPolling]);

  return {
    playerId,
    name,
    setName,
    nameSubmitted,
    room,
    joinCode,
    setJoinCode,
    error,
    loading,
    myPct,
    sharedPosRef,
    submitName,
    createRoom,
    joinRoom,
    toggleReady,
    startRace,
    finishRace,
    leaveRoom,
    editName: () => setNameSubmitted(false),
  };
}
