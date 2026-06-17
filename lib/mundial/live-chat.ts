import type { Db } from "mongodb";

export const MUNDIAL_LIVE_CHAT_COLLECTION = "mundial_live_chat";

const MAX_CHAT_MESSAGES = 80;

export type LiveChatMessageDoc = {
  id: string;
  matchId: string;
  visitorId: string;
  playerName: string;
  text: string;
  createdAt: Date;
};

export type SerializedLiveChatMessage = {
  id: string;
  matchId: string;
  visitorId: string;
  playerName: string;
  text: string;
  createdAt: string;
};

function col(db: Db) {
  return db.collection<LiveChatMessageDoc>(MUNDIAL_LIVE_CHAT_COLLECTION);
}

function newMessageId() {
  return `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function cleanChatName(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 24) : "";
}

export function cleanChatText(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 180) : "";
}

export function serializeLiveChatMessage(message: LiveChatMessageDoc): SerializedLiveChatMessage {
  return {
    id: message.id,
    matchId: message.matchId,
    visitorId: message.visitorId,
    playerName: message.playerName,
    text: message.text,
    createdAt: message.createdAt.toISOString(),
  };
}

export async function listLiveChatMessages(db: Db, matchId: string): Promise<SerializedLiveChatMessage[]> {
  const messages = await col(db)
    .find({ matchId })
    .sort({ createdAt: -1 })
    .limit(MAX_CHAT_MESSAGES)
    .toArray();

  return messages.reverse().map(serializeLiveChatMessage);
}

export async function addLiveChatMessage(
  db: Db,
  input: {
    matchId: string;
    visitorId: string;
    playerName: string;
    text: string;
  }
): Promise<SerializedLiveChatMessage[]> {
  const createdAt = new Date();
  await col(db).insertOne({
    id: newMessageId(),
    matchId: input.matchId,
    visitorId: input.visitorId,
    playerName: input.playerName,
    text: input.text,
    createdAt,
  });

  const oldMessages = await col(db)
    .find({ matchId: input.matchId })
    .sort({ createdAt: -1 })
    .skip(MAX_CHAT_MESSAGES)
    .project<{ id: string }>({ id: 1, _id: 0 })
    .toArray();

  if (oldMessages.length > 0) {
    await col(db).deleteMany({ matchId: input.matchId, id: { $in: oldMessages.map((message) => message.id) } });
  }

  return listLiveChatMessages(db, input.matchId);
}
