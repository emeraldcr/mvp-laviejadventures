"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, MessageCircle, RefreshCw, Repeat2, Search } from "lucide-react";
import type { MundialMatch } from "../types";
import { cn } from "../utils";

type XPost = {
  id: string;
  text: string;
  createdAt: string | null;
  url: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string | null;
    verified: boolean;
  };
  metrics: {
    likes: number;
    reposts: number;
    replies: number;
    quotes: number;
  };
};

type XPayload = {
  configured: boolean;
  query: string;
  searchUrl: string;
  posts: XPost[];
  fetchedAt: string | null;
  error?: string;
};

type Props = {
  liveMatch: MundialMatch;
};

function relativeTime(iso: string | null) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diffMs)) return "";
  const minutes = Math.max(0, Math.floor(diffMs / 60_000));
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function compactNumber(value: number) {
  if (value <= 0) return "";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function VerifiedBadge() {
  return (
    <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#1d9bf0] text-[10px] font-black leading-none text-white">
      ✓
    </span>
  );
}

function XAvatar() {
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-lg font-black text-black">
      X
    </div>
  );
}

export function XLivePanel({ liveMatch }: Props) {
  const [payload, setPayload] = useState<XPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const matchLabel = `${liveMatch.homeTeam} vs ${liveMatch.awayTeam}`;
  const posts = useMemo(() => payload?.posts ?? [], [payload]);

  const loadFeed = useCallback(async (background = false) => {
    if (background) setIsRefreshing(true);
    else { setIsLoading(true); setPayload(null); }
    try {
      const res = await fetch(
        `/api/mundial/x-live?matchId=${encodeURIComponent(liveMatch.id)}`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as XPayload;
      setPayload(data);
    } catch {
      setPayload({
        configured: true,
        query: matchLabel,
        searchUrl: "#",
        posts: [],
        fetchedAt: null,
        error: "No se pudo cargar el feed.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [liveMatch.id, matchLabel]);

  useEffect(() => {
    void loadFeed();
    const timer = setInterval(() => void loadFeed(true), 45_000);
    return () => clearInterval(timer);
  }, [loadFeed]);

  return (
    <section className="overflow-hidden rounded-xl border border-[#2f3336] bg-black text-white shadow-[0_18px_58px_rgba(0,0,0,0.35)]">
      <div className="sticky top-0 z-10 border-b border-[#2f3336] bg-black/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-lg font-black leading-tight text-white">X</p>
              <span className="rounded-full bg-[#1d9bf0]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#1d9bf0]">
                Partido live
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs font-bold text-[#71767b]">{matchLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadFeed(true)}
            disabled={isRefreshing}
            aria-label="Refrescar feed"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#e7e9ea] transition hover:bg-[#181818] disabled:opacity-40"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="max-h-[32rem] overflow-y-auto">
        {isLoading ? (
          <div className="grid min-h-36 place-items-center text-center">
            <div>
              <RefreshCw className="mx-auto h-7 w-7 animate-spin text-[#1d9bf0]" />
              <p className="mt-2 text-sm font-black text-[#71767b]">Cargando feed...</p>
            </div>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.id} className="border-b border-[#2f3336] px-4 py-3 transition hover:bg-[#080808]">
              <div className="flex items-start gap-3">
                {post.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.author.avatarUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full bg-[#16181c]"
                  />
                ) : (
                  <XAvatar />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    <span className="truncate text-sm font-black text-[#e7e9ea]">{post.author.name}</span>
                    {post.author.verified && <VerifiedBadge />}
                    <span className="truncate text-sm font-medium text-[#71767b]">@{post.author.username}</span>
                    <span className="text-sm font-medium text-[#71767b]">·</span>
                    <span className="shrink-0 text-sm font-medium text-[#71767b]">{relativeTime(post.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-[15px] font-medium leading-snug text-[#e7e9ea]">
                    {post.text}
                  </p>
                  <div className="mt-3 grid max-w-xs grid-cols-3 text-[#71767b]">
                    <span className="inline-flex items-center gap-1 text-xs font-bold">
                      <MessageCircle className="h-4 w-4" />
                      {compactNumber(post.metrics.replies)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold">
                      <Repeat2 className="h-4 w-4" />
                      {compactNumber(post.metrics.reposts)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold">
                      <Heart className="h-4 w-4" />
                      {compactNumber(post.metrics.likes)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="grid min-h-44 place-items-center px-6 py-8 text-center">
            <div>
              <Search className="mx-auto h-8 w-8 text-[#71767b]" />
              <p className="mt-3 text-base font-black text-[#e7e9ea]">Sin noticias todavia</p>
              <p className="mt-1 text-sm font-bold leading-relaxed text-[#71767b]">
                Cuando el admin publique desde el panel del partido, va a aparecer aqui como un post de X.
              </p>
              {payload?.error && <p className="mt-2 text-xs font-bold text-[#ff7a7a]">{payload.error}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#2f3336] px-4 py-2 text-[11px] font-bold text-[#71767b]">
        {payload?.fetchedAt ? `Actualizado ${relativeTime(payload.fetchedAt)}` : "Feed local del partido"}
      </div>
    </section>
  );
}
