import type { Db } from "mongodb";

export const RACE_COLLECTION = "ghost_race_rooms";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I

function genCode(): string {
  return Array.from({ length: 4 }, () =>
    CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  ).join("");
}

export type RacePlayer = {
  id: string;
  name: string;
  ready: boolean;
  pct: number;       // 0-100 progress through the level
  finished: boolean;
  rank?: number;
  finishedAt?: number; // ms timestamp
};

export type RaceStatus = "lobby" | "racing" | "finished";

export type RaceRoomDoc = {
  _id: string;         // 4-char code
  hostId: string;
  status: RaceStatus;
  levelIndex: number;
  players: RacePlayer[];
  startedAt: Date | null;
  updatedAt: Date;
  expiresAt: Date;     // TTL field
  version: number;
};

function col(db: Db) {
  return db.collection<RaceRoomDoc>(RACE_COLLECTION);
}

async function ensureIndexes(db: Db) {
  const c = col(db);
  await c.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true });
}

export async function createRoom(
  db: Db,
  hostId: string,
  hostName: string,
  levelIndex = 0
): Promise<string> {
  await ensureIndexes(db);
  const code = genCode();
  const now = new Date();
  const doc: RaceRoomDoc = {
    _id: code,
    hostId,
    status: "lobby",
    levelIndex,
    players: [{ id: hostId, name: hostName, ready: false, pct: 0, finished: false }],
    startedAt: null,
    updatedAt: now,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2h TTL
    version: 1,
  };
  await col(db).insertOne(doc);
  return code;
}

export async function getRoom(db: Db, code: string): Promise<RaceRoomDoc | null> {
  return col(db).findOne({ _id: code } as any);
}

export async function joinRoom(
  db: Db,
  code: string,
  playerId: string,
  name: string
): Promise<{ ok: boolean; error?: string; room?: RaceRoomDoc }> {
  const room = await getRoom(db, code);
  if (!room) return { ok: false, error: "room_not_found" };
  if (room.status !== "lobby") return { ok: false, error: "already_started" };
  if (room.players.length >= 8) return { ok: false, error: "room_full" };

  const already = room.players.find((p) => p.id === playerId);
  if (already) return { ok: true, room };

  const player: RacePlayer = { id: playerId, name, ready: false, pct: 0, finished: false };
  const now = new Date();
  await col(db).updateOne(
    { _id: code } as any,
    { $push: { players: player }, $set: { updatedAt: now }, $inc: { version: 1 } } as any
  );
  return { ok: true, room: (await getRoom(db, code))! };
}

export async function setReady(
  db: Db,
  code: string,
  playerId: string,
  ready: boolean
): Promise<RaceRoomDoc | null> {
  const now = new Date();
  await col(db).updateOne(
    { _id: code, "players.id": playerId } as any,
    { $set: { "players.$.ready": ready, updatedAt: now }, $inc: { version: 1 } } as any
  );
  return getRoom(db, code);
}

export async function startRace(
  db: Db,
  code: string,
  hostId: string
): Promise<{ ok: boolean; error?: string; room?: RaceRoomDoc }> {
  const room = await getRoom(db, code);
  if (!room) return { ok: false, error: "room_not_found" };
  if (room.hostId !== hostId) return { ok: false, error: "not_host" };
  if (room.status !== "lobby") return { ok: false, error: "already_started" };
  if (room.players.length < 2) return { ok: false, error: "need_more_players" };

  const now = new Date();
  await col(db).updateOne(
    { _id: code } as any,
    {
      $set: {
        status: "racing",
        startedAt: now,
        updatedAt: now,
        // reset all progress
        players: room.players.map((p) => ({ ...p, pct: 0, finished: false, rank: undefined, finishedAt: undefined })),
      },
      $inc: { version: 1 },
    } as any
  );
  return { ok: true, room: (await getRoom(db, code))! };
}

export async function updateProgress(
  db: Db,
  code: string,
  playerId: string,
  pct: number
): Promise<void> {
  const now = new Date();
  await col(db).updateOne(
    { _id: code, "players.id": playerId, status: "racing" } as any,
    { $set: { "players.$.pct": Math.min(100, Math.max(0, pct)), updatedAt: now }, $inc: { version: 1 } } as any
  );
}

export async function finishPlayer(
  db: Db,
  code: string,
  playerId: string
): Promise<RaceRoomDoc | null> {
  const room = await getRoom(db, code);
  if (!room || room.status !== "racing") return room;

  const finishedCount = room.players.filter((p) => p.finished).length;
  const rank = finishedCount + 1;
  const now = new Date();

  await col(db).updateOne(
    { _id: code, "players.id": playerId } as any,
    {
      $set: {
        "players.$.finished": true,
        "players.$.pct": 100,
        "players.$.rank": rank,
        "players.$.finishedAt": now.getTime(),
        updatedAt: now,
      },
      $inc: { version: 1 },
    } as any
  );

  // If all players finished → mark room as finished
  const updated = await getRoom(db, code);
  if (updated && updated.players.every((p) => p.finished)) {
    await col(db).updateOne(
      { _id: code } as any,
      { $set: { status: "finished", updatedAt: now }, $inc: { version: 1 } } as any
    );
  }

  return getRoom(db, code);
}

export async function leaveRoom(db: Db, code: string, playerId: string): Promise<void> {
  const now = new Date();
  await col(db).updateOne(
    { _id: code } as any,
    { $pull: { players: { id: playerId } }, $set: { updatedAt: now }, $inc: { version: 1 } } as any
  );
  // If room is now empty, delete it
  const room = await getRoom(db, code);
  if (room && room.players.length === 0) {
    await col(db).deleteOne({ _id: code } as any);
  }
}

export function serializeRoom(room: RaceRoomDoc | null) {
  if (!room) return null;
  return {
    code: room._id,
    hostId: room.hostId,
    status: room.status,
    levelIndex: room.levelIndex,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      ready: p.ready,
      pct: p.pct,
      finished: p.finished,
      rank: p.rank ?? null,
      finishedAt: p.finishedAt ?? null,
    })),
    startedAt: room.startedAt?.toISOString() ?? null,
    updatedAt: room.updatedAt.toISOString(),
    version: room.version,
  };
}
