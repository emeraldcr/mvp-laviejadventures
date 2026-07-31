"use client";

/**
 * WeatherMessage
 * Displays a short, practical guide note based on current weather.
 * Fetches a fresh message from OpenAI every time the parent triggers a refresh.
 */
import { useEffect, useState } from "react";
import type { WeatherSnapshot } from "@/lib/helpers/weatherMessageHelpers";

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
    <div className="rounded-3xl border border-[#00C4B0]/20 bg-[#00C4B0]/[0.06] px-5 py-5">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">
        Nota de nuestros guías
      </p>
      {snap && !message ? (
        <div className="h-5 w-3/4 rounded bg-white/5 animate-pulse" />
      ) : message ? (
        <p className="text-sm text-zinc-200 leading-6">{message}</p>
      ) : null}
    </div>
  );
}
