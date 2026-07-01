import type { RaceRoomView } from "../types";

type RaceApiResponse = {
  ok: boolean;
  code?: string;
  room?: RaceRoomView;
  error?: string;
};

const postRace = async (url: string, body: Record<string, unknown>): Promise<RaceApiResponse> => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
};

export const createRaceRoom = (hostId: string, name: string) => (
  postRace("/api/race/create", { hostId, name })
);

export const joinRaceRoom = (code: string, playerId: string, name: string) => (
  postRace("/api/race/join", { code, playerId, name })
);

export const setRaceReady = (code: string, playerId: string, ready: boolean) => (
  postRace("/api/race/ready", { code, playerId, ready })
);

export const startRaceRoom = (code: string, hostId: string) => (
  postRace("/api/race/start", { code, hostId })
);

export const updateRaceProgress = (code: string, playerId: string, pct: number) => (
  postRace("/api/race/progress", { code, playerId, pct })
);

export const finishRaceRoom = (code: string, playerId: string) => (
  postRace("/api/race/finish", { code, playerId })
);
