import type { Db } from "mongodb";
import { notifyLiveGameChanged, getViewerCount } from "../realtime/online-game";

export const GAME_COLLECTION = "ghost_game_state";

export type GamePlayer = {
  visitorId: string;
  name: string;
  positionSegment: number; // current segment index
  finished: boolean;
  joinedAt: Date;
};

export type GameStateDoc = {
  _id: string; // gameId
  totalSegments: number;
  currentSegment: number;
  viewerCount?: number;
  players: GamePlayer[];
  winnerVisitorId: string | null;
  startedAt: Date | null;
  updatedAt: Date;
  version?: number;
};

function col(db: Db) {
  return db.collection<GameStateDoc>(GAME_COLLECTION);
}

export async function createGame(db: Db, totalSegments = 10): Promise<string> {
  const id = `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date();
  const doc: GameStateDoc = {
    _id: id,
    totalSegments,
    currentSegment: 0,
    viewerCount: 0,
    players: [],
    winnerVisitorId: null,
    startedAt: null,
    updatedAt: now,
    version: 1,
  };
  await col(db).insertOne(doc);
  notifyLiveGameChanged(id);
  return id;
}

export async function getGame(db: Db, gameId: string): Promise<GameStateDoc | null> {
  return col(db).findOne({ _id: gameId } as any);
}

export async function joinGame(db: Db, gameId: string, visitorId: string, name: string): Promise<GameStateDoc | null> {
  const now = new Date();
  const player: GamePlayer = { visitorId, name, positionSegment: 0, finished: false, joinedAt: now };
  await col(db).updateOne({ _id: gameId } as any, { $push: { players: player }, $set: { updatedAt: now }, $inc: { version: 1 } } as any);
  notifyLiveGameChanged(gameId);
  return getGame(db, gameId);
}

export async function leaveGame(db: Db, gameId: string, visitorId: string): Promise<void> {
  const now = new Date();
  await col(db).updateOne({ _id: gameId } as any, { $pull: { players: { visitorId } }, $set: { updatedAt: now }, $inc: { version: 1 } } as any);
  notifyLiveGameChanged(gameId);
}

export async function movePlayer(db: Db, gameId: string, visitorId: string, toSegment: number): Promise<GameStateDoc | null> {
  const now = new Date();
  // clamp
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const game = await col(db).findOne({ _id: gameId } as any);
  if (!game) return null;
  const seg = Math.max(0, Math.min(game.totalSegments, Math.floor(toSegment)));

  // update the player position
  await col(db).updateOne({ _id: gameId, "players.visitorId": visitorId } as any, { $set: { "players.$.positionSegment": seg, "players.$.finished": seg >= game.totalSegments, updatedAt: now }, $inc: { version: 1 } } as any);

  // recompute currentSegment and winner
  const updated = await getGame(db, gameId);
  if (!updated) return null;

  const maxSeg = updated.players.reduce((m, p) => Math.max(m, p.positionSegment), 0);
  const winner = updated.players.find((p) => p.positionSegment >= updated.totalSegments) ?? null;

  const set: any = { currentSegment: maxSeg, updatedAt: now };
  if (winner && !updated.winnerVisitorId) set.winnerVisitorId = winner.visitorId;

  await col(db).updateOne({ _id: gameId } as any, { $set: set, $inc: { version: 1 } } as any);

  notifyLiveGameChanged(gameId);
  return getGame(db, gameId);
}

export function serializeGame(state: GameStateDoc | null) {
  if (!state) return null;
  return {
    id: state._id,
    totalSegments: state.totalSegments,
    currentSegment: state.currentSegment,
    players: state.players.map((p) => ({ visitorId: p.visitorId, name: p.name, positionSegment: p.positionSegment, finished: p.finished })),
    winnerVisitorId: state.winnerVisitorId,
    startedAt: state.startedAt?.toISOString() ?? null,
    updatedAt: state.updatedAt.toISOString(),
    viewerCount: state.viewerCount ?? 0,
    version: state.version ?? 0,
  };
}
