import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const dynamic = "force-dynamic";

const CACHE_MS = 60_000;

type XUser = {
  id: string;
  name?: string;
  username?: string;
  profile_image_url?: string;
  verified?: boolean;
};

type XTweet = {
  id: string;
  text?: string;
  author_id?: string;
  created_at?: string;
  lang?: string;
  public_metrics?: {
    like_count?: number;
    retweet_count?: number;
    reply_count?: number;
    quote_count?: number;
  };
};

type XSearchPayload = {
  data?: XTweet[];
  includes?: { users?: XUser[] };
};

type XPost = {
  id: string;
  text: string;
  createdAt: string | null;
  url: string;
  author: {
    id: string | null;
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

type CacheEntry = {
  key: string;
  expiresAt: number;
  payload: {
    configured: boolean;
    query: string;
    searchUrl: string;
    posts: XPost[];
    fetchedAt: string | null;
    error?: string;
  };
};

let cache: CacheEntry | null = null;

function buildQuery(home: string, away: string): string {
  const tag = `${home}vs${away}`;
  return `(${tag} OR "${home} vs ${away}" OR #${tag}) (WorldCup26 OR "World Cup 2026" OR FIFA) -is:retweet`;
}

function searchUrl(query: string) {
  return `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
}

function getClient() {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN?.trim();
  if (bearerToken) return new TwitterApi(bearerToken);

  const appKey = process.env.TWITTER_API_KEY?.trim();
  const appSecret = process.env.TWITTER_API_SECRET?.trim();
  const accessToken = process.env.TWITTER_ACCESS_TOKEN?.trim();
  const accessSecret = process.env.TWITTER_ACCESS_SECRET?.trim();

  if (!appKey || !appSecret || !accessToken || !accessSecret) return null;

  return new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
}

function serializePosts(payload: XSearchPayload): XPost[] {
  const users = new Map((payload.includes?.users ?? []).map((user) => [user.id, user]));

  return (payload.data ?? []).slice(0, 8).map((tweet) => {
    const user = tweet.author_id ? users.get(tweet.author_id) : undefined;
    const username = user?.username ?? "x";
    const metrics = tweet.public_metrics ?? {};

    return {
      id: tweet.id,
      text: tweet.text ?? "",
      createdAt: tweet.created_at ?? null,
      url: `https://x.com/${username}/status/${tweet.id}`,
      author: {
        id: tweet.author_id ?? null,
        name: user?.name ?? username,
        username,
        avatarUrl: user?.profile_image_url ?? null,
        verified: Boolean(user?.verified),
      },
      metrics: {
        likes: metrics.like_count ?? 0,
        reposts: metrics.retweet_count ?? 0,
        replies: metrics.reply_count ?? 0,
        quotes: metrics.quote_count ?? 0,
      },
    };
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const home = searchParams.get("home")?.trim().toUpperCase() ?? "";
  const away = searchParams.get("away")?.trim().toUpperCase() ?? "";

  if (!home || !away) {
    return NextResponse.json({ error: "Missing home/away params" }, { status: 400 });
  }

  const cacheKey = `${home}:${away}`;
  const now = Date.now();

  if (cache && cache.key === cacheKey && cache.expiresAt > now) {
    return NextResponse.json(cache.payload);
  }

  const query = buildQuery(home, away);
  const client = getClient();
  const fallback = {
    configured: false,
    query,
    searchUrl: searchUrl(query),
    posts: [] as XPost[],
    fetchedAt: null,
  };

  if (!client) {
    cache = { key: cacheKey, expiresAt: now + CACHE_MS, payload: fallback };
    return NextResponse.json(fallback);
  }

  try {
    const raw = await client.v2.get("tweets/search/recent", {
      query,
      max_results: 10,
      sort_order: "recency",
      "tweet.fields": ["author_id", "created_at", "lang", "public_metrics"],
      expansions: ["author_id"],
      "user.fields": ["name", "username", "profile_image_url", "verified"],
    });

    const payload = {
      configured: true,
      query,
      searchUrl: searchUrl(query),
      posts: serializePosts(raw as XSearchPayload),
      fetchedAt: new Date().toISOString(),
    };

    cache = { key: cacheKey, expiresAt: now + CACHE_MS, payload };
    return NextResponse.json(payload);
  } catch (error) {
    // 403 = credentials valid but plan doesn't include search (requires Basic tier+)
    const is403 =
      (error instanceof Error && error.message.includes("403")) ||
      (typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === 403);

    const payload = {
      ...fallback,
      configured: !is403,
      fetchedAt: new Date().toISOString(),
      error: is403
        ? "El plan de API de X no incluye búsqueda de tweets. Se requiere el nivel Basic o superior."
        : (error instanceof Error ? error.message : "No se pudo conectar con X."),
    };
    cache = { key: cacheKey, expiresAt: now + CACHE_MS, payload };
    return NextResponse.json(payload, { status: 200 });
  }
}
