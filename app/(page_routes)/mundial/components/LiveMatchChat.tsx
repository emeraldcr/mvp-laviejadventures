"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, SmilePlus, Wifi, WifiOff } from "lucide-react";
import { cn } from "../utils";
import type { MundialMatch } from "../types";

const VISITOR_KEY = "mundial-live-chat-vid";
const QUICK_EMOJIS = ["⚽", "🔥", "😂", "😱", "👏", "💚", "🏆", "😤"];
const MAX_MESSAGE_LENGTH = 180;

type LiveChatMessage = {
  id: string;
  matchId: string;
  visitorId: string;
  playerName: string;
  text: string;
  createdAt: string;
  pending?: boolean;
};

type ChatPayload = {
  messages: LiveChatMessage[];
};

type SendPayload = Partial<ChatPayload> & {
  message?: LiveChatMessage;
  error?: string;
};

type Props = {
  liveMatch: MundialMatch;
  playerName: string;
  onOpenPlayerPicker: () => void;
};

function getOrCreateVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return `chat-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function cleanDraft(value: string): string {
  return value.replace(/\s+/g, " ").slice(0, MAX_MESSAGE_LENGTH);
}

function chatTime(iso: string): string {
  return iso.slice(11, 16);
}

function mergeMessages(current: LiveChatMessage[], incoming: LiveChatMessage[]): LiveChatMessage[] {
  const byId = new Map<string, LiveChatMessage>();
  for (const message of current) {
    if (message.pending) byId.set(message.id, message);
  }
  for (const message of incoming) {
    byId.set(message.id, { ...message, pending: false });
  }
  return Array.from(byId.values())
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(-80);
}

const ChatMessageBubble = memo(function ChatMessageBubble({
  message,
  mine,
}: {
  message: LiveChatMessage;
  mine: boolean;
}) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[86%] rounded-lg px-3 py-2 shadow-sm sm:max-w-[72%]",
          mine
            ? "bg-[#f0b429] text-black"
            : "border border-white/10 bg-black/35 text-white"
        )}
      >
        <div className="mb-0.5 flex items-baseline gap-2">
          <span className={cn("truncate text-[11px] font-black uppercase", mine ? "text-black/65" : "text-[#d5ff3f]")}>
            {mine ? "Vos" : message.playerName}
          </span>
          <span className={cn("shrink-0 text-[10px] font-mono", mine ? "text-black/45" : "text-white/35")}>
            {chatTime(message.createdAt)}
          </span>
        </div>
        <p className="break-words text-sm font-bold leading-snug">{message.text}</p>
      </div>
    </div>
  );
});

export function LiveMatchChat({ liveMatch, playerName, onOpenPlayerPicker }: Props) {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [visitorId, setVisitorId] = useState("");
  const [connected, setConnected] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const lastPayloadRef = useRef("");
  const listRef = useRef<HTMLDivElement>(null);

  const matchLabel = `${liveMatch.homeTeam} vs ${liveMatch.awayTeam}`;
  const canSend = Boolean(playerName.trim()) && Boolean(visitorId) && draft.trim().length > 0;

  const applyPayload = useCallback((payload: ChatPayload) => {
    const signature = JSON.stringify(payload.messages);
    if (signature === lastPayloadRef.current) return;
    lastPayloadRef.current = signature;
    setMessages((current) => mergeMessages(current, payload.messages));
  }, []);

  useEffect(() => {
    queueMicrotask(() => setVisitorId(getOrCreateVisitorId()));
  }, []);

  useEffect(() => {
    const url = `/api/mundial/chat/live?matchId=${encodeURIComponent(liveMatch.id)}`;
    let es: EventSource | null = null;
    let reconnect: ReturnType<typeof setTimeout>;

    const connect = () => {
      es = new EventSource(url);
      es.onopen = () => {
        setConnected(true);
        setError("");
      };
      es.onmessage = (event) => {
        try {
          applyPayload(JSON.parse(event.data) as ChatPayload);
        } catch (err) {
          console.error("[mundial/chat] SSE parse error", err);
        }
      };
      es.onerror = () => {
        setConnected(false);
        es?.close();
        reconnect = setTimeout(connect, 2_500);
      };
    };

    connect();
    return () => {
      es?.close();
      clearTimeout(reconnect);
    };
  }, [applyPayload, liveMatch.id]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const visibleMessages = useMemo(() => messages.slice(-80), [messages]);

  const appendEmoji = useCallback((emoji: string) => {
    setDraft((current) => cleanDraft(`${current}${current.endsWith(" ") || current.length === 0 ? "" : " "}${emoji}`));
  }, []);

  const sendMessage = useCallback(async () => {
    const text = draft.trim();
    if (!canSend || !text) {
      if (!playerName.trim()) onOpenPlayerPicker();
      return;
    }

    const tempMessage: LiveChatMessage = {
      id: `temp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      matchId: liveMatch.id,
      visitorId,
      playerName,
      text,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((current) => mergeMessages(current, [tempMessage]));
    setDraft("");
    setIsSending(true);
    setError("");
    try {
      const res = await fetch("/api/mundial/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: liveMatch.id,
          visitorId,
          playerName,
          text,
        }),
      });

      const payload = await res.json() as SendPayload;
      if (!res.ok) {
        setError(payload.error ?? "No se pudo enviar.");
        setMessages((current) => current.filter((message) => message.id !== tempMessage.id));
        return;
      }
      if (payload.message) {
        setMessages((current) => mergeMessages(
          current.filter((message) => message.id !== tempMessage.id),
          [payload.message as LiveChatMessage],
        ));
      } else {
        applyPayload({ messages: payload.messages ?? [] });
      }
    } catch {
      setError("No se pudo enviar.");
      setMessages((current) => current.filter((message) => message.id !== tempMessage.id));
      setDraft(text);
    } finally {
      setIsSending(false);
    }
  }, [applyPayload, canSend, draft, liveMatch.id, onOpenPlayerPicker, playerName, visitorId]);

  return (
    <section className="mt-4 overflow-hidden rounded-xl border border-[#f0b429]/25 bg-[#06140f]/95 shadow-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0d2818] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f0b429] text-black">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-white">Chat live</h2>
            <p className="truncate text-xs font-bold text-white/45">{matchLabel}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-black uppercase text-white/55">
          {connected ? <Wifi className="h-3.5 w-3.5 text-emerald-400" /> : <WifiOff className="h-3.5 w-3.5 text-red-400" />}
          {connected ? "Live" : "Reconectando"}
        </div>
      </div>

      <div ref={listRef} className="max-h-80 min-h-48 space-y-2 overflow-y-auto px-4 py-4">
        {visibleMessages.length > 0 ? (
          visibleMessages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} mine={message.visitorId === visitorId} />
          ))
        ) : (
          <div className="grid min-h-36 place-items-center text-center">
            <div>
              <SmilePlus className="mx-auto h-8 w-8 text-[#f0b429]/75" />
              <p className="mt-3 text-sm font-black text-white/65">Sé el primero en reaccionar al partido.</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-black/20 px-4 py-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => appendEmoji(emoji)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/6 text-lg transition hover:border-[#f0b429]/50 hover:bg-[#f0b429]/10"
            >
              {emoji}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
        >
          <input
            value={draft}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(event) => setDraft(cleanDraft(event.target.value))}
            placeholder={playerName ? "Escribí al chat..." : "Elegí tu jugador para chatear"}
            className="min-w-0 flex-1 rounded-lg border border-white/12 bg-black/35 px-3 py-3 text-sm font-bold text-white outline-none transition placeholder:text-white/30 focus:border-[#f0b429]/70"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Enviar mensaje"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#f0b429] text-black transition hover:bg-[#ffd36b] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Send className={cn("h-4 w-4", isSending && "animate-pulse")} />
          </button>
        </form>
        {error && <p className="mt-2 text-xs font-bold text-red-300">{error}</p>}
      </div>
    </section>
  );
}
