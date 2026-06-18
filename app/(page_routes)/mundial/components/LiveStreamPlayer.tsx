'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import type { MundialMatch } from '../types';

const DEFAULT_M3U8 = "https://live-sa.streann.tech/foxsport2_abr/stream/foxsport2/stream_5/chunks.m3u8?auth=eyJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI2MjA5NDRiMzhmMDgwOGQ3NGUyMmQyYWUiLCJleHAiOjE3ODE3MzE0MzQsInJpZCI6IjYxMzE2NzA1ZTRiMDI5NWY4N2RhZTM5NiIsImtleSI6ImtleTEiLCJjaWQiOiI2ODliODBjNDhmMDhjOGJlNzdmOGUwMTMifQ.2hCFFiT54TFVnEmb6BhYjOGP09qHPbVpW_C6Psqd5Zo";

export default function LiveStreamPlayer({ liveMatch }: { liveMatch: MundialMatch }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Cargando transmisión...");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    const proxiedUrl = `/api/stream?url=${encodeURIComponent(DEFAULT_M3U8)}`;

    if (Hls.isSupported()) {
      hls = new Hls({
        liveSyncDurationCount: 3,
        maxBufferLength: 30,
        lowLatencyMode: true,
      });

      hls.loadSource(proxiedUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus("Transmisión en vivo");
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setStatus("Token expirado - actualiza la página");
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = proxiedUrl;
      setStatus("Transmisión en vivo (Safari)");
    }

    return () => hls?.destroy();
  }, []);

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
      <div className="bg-[#0a1a12] px-4 py-2 text-sm font-medium flex items-center gap-2 border-b border-white/10">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        EN VIVO — {liveMatch.homeTeam} vs {liveMatch.awayTeam}
      </div>
      
      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        className="w-full aspect-video bg-black"
      />

      <div className="px-4 py-2 text-xs text-gray-400 text-center">
        {status} • Actualiza la página si el token expira
      </div>
    </div>
  );
}