"use client";

/**
 * WeatherMessage
 * Displays a unique AI-generated funny comment based on current weather.
 * Fetches a fresh message from Anthropic every time the parent triggers a refresh.
 */
import { useEffect, useState } from "react";
import type { WeatherSnapshot } from "@/lib/weatherMessageHelpers";

type Props = { snap: WeatherSnapshot | null };

export default function WeatherMessage({ snap }: Props) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!snap) return;


    let cancelled = false;
    fetch("/api/tiempo/mensaje", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // cache: "no-store" is the default for fetch in Next.js App Router client components
      body: JSON.stringify(snap),
    })
      .then((r) => r.json())
      .then(({ message }) => { if (!cancelled) setMessage(message); })
      .catch(() => { if (!cancelled) setMessage(null); })
      ;

    return () => { cancelled = true; };
  }, [snap]);

  if (!snap && !message) return null;

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-4">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">
        El pronóstico del humor
      </p>
      {snap && !message ? (
        <div className="h-5 w-3/4 rounded bg-white/5 animate-pulse" />
      ) : message ? (
        <p className="text-sm text-zinc-300 leading-relaxed italic">{message}</p>
      ) : null}
    </div>
  );
}
