"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Heart, MessageCircle, RefreshCw, Repeat2, Search, WifiOff } from "lucide-react";
import type { MundialMatch } from "../types";
import { cn, teamCode } from "../utils";

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
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function cleanText(text: string) {
  return text.replace(/\s*https:\/\/t\.co\/\S+/g, "").trim();
}

export function XLivePanel({ liveMatch }: Props) {
  const [payload, setPayload] = useState<XPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const matchLabel = `${liveMatch.homeTeam} vs ${liveMatch.awayTeam}`;
  const homeCode = teamCode(liveMatch.homeTeam);
  const awayCode = teamCode(liveMatch.awayTeam);
  const searchUrl = payload?.searchUrl ?? `https://x.com/search?q=${encodeURIComponent(`${homeCode}vs${awayCode} WorldCup26`)}&src=typed_query&f=live`;
  const posts = useMemo(() => payload?.posts ?? [], [payload]);

  const loadFeed = useCallback(async (background = false) => {
    if (background) setIsRefreshing(true);
    else { setIsLoading(true); setPayload(null); }
    try {
      const res = await fetch(
        `/api/mundial/x-live?home=${encodeURIComponent(homeCode)}&away=${encodeURIComponent(awayCode)}`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as XPayload;
      setPayload(data);
    } catch {
      setPayload({
        configured: false,
        query: `${homeCode}vs${awayCode}`,
        searchUrl: `https://x.com/search?q=${encodeURIComponent(`${homeCode}vs${awayCode} WorldCup26`)}&src=typed_query&f=live`,
        posts: [],
        fetchedAt: null,
        error: "No se pudo cargar X.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [homeCode, awayCode]);

  useEffect(() => {
    void loadFeed();
    const timer = setInterval(() => void loadFeed(true), 90_000);
    return () => clearInterval(timer);
  }, [loadFeed]);

  return (
    <section className="overflow-hidden rounded-xl border border-white/12 bg-[#06140f]/95 shadow-[0_18px_58px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 bg-black/25 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d5ff3f]">X live</p>
          <h2 className="mt-0.5 truncate text-base font-black text-white">{homeCode}vs{awayCode} WorldCup26</h2>
          <p className="mt-0.5 truncate text-xs font-bold text-white/45">{matchLabel}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void loadFeed(true)}
            disabled={isRefreshing}
            aria-label="Refrescar X"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/12 bg-black/35 text-white/60 transition hover:border-[#d5ff3f]/50 hover:text-white disabled:opacity-40"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </button>
          <a
            href={searchUrl}
            target="_blank"
            rel="noreferrer"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/12 bg-black/35 text-white/60 transition hover:border-[#d5ff3f]/50 hover:text-white"
            aria-label="Abrir busqueda en X"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="max-h-[28rem] overflow-y-auto px-3 py-3">
        {isLoading ? (
          <div className="grid min-h-36 place-items-center text-center">
            <div>
              <RefreshCw className="mx-auto h-7 w-7 animate-spin text-[#f0b429]" />
              <p className="mt-2 text-sm font-black text-white/55">Cargando X...</p>
            </div>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-2.5">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-white/10 bg-black/30 p-3 transition hover:border-[#d5ff3f]/35 hover:bg-[#10240b]/70"
              >
                <div className="flex items-start gap-2.5">
                  {post.author.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.author.avatarUrl}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full border border-white/10 bg-black/35"
                    />
                  ) : (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-black/35 text-xs font-black text-white/50">
                      X
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-sm font-black text-white">{post.author.name}</span>
                      {post.author.verified && <span className="text-[10px] font-black text-[#8fd7ff]">OK</span>}
                      <span className="truncate text-xs font-bold text-white/35">@{post.author.username}</span>
                      <span className="shrink-0 text-xs font-bold text-white/25">{relativeTime(post.createdAt)}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm font-bold leading-snug text-white/82">
                      {cleanText(post.text)}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] font-black text-white/35">
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {compactNumber(post.metrics.replies)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Repeat2 className="h-3 w-3" />
                        {compactNumber(post.metrics.reposts)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {compactNumber(post.metrics.likes)}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-white/12 bg-black/25 p-5 text-center">
            <div>
              {payload?.configured === false ? (
                <WifiOff className="mx-auto h-7 w-7 text-[#f0b429]/70" />
              ) : (
                <Search className="mx-auto h-7 w-7 text-[#f0b429]/70" />
              )}
              <p className="mt-2 text-sm font-black text-white/70">
                {payload?.configured === false ? "Conecta credenciales de X para traer posts aqui." : "No hay posts recientes en este filtro."}
              </p>
              {payload?.error && <p className="mt-1 text-xs font-bold text-[#ffd2c2]">{payload.error}</p>}
              <a
                href={searchUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#d5ff3f]/35 bg-[#10240b] px-3 py-2 text-xs font-black text-[#d5ff3f] transition hover:bg-[#12351f]"
              >
                Abrir en X
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-black/20 px-4 py-2 text-[11px] font-bold text-white/35">
        {payload?.fetchedAt ? `Actualizado ${relativeTime(payload.fetchedAt)}` : "Busqueda live en X"}
      </div>
    </section>
  );
}
