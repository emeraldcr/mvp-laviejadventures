"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, Mail, Phone, Sparkles, Upload, X } from "lucide-react";
import { cn, normalizeKey } from "../utils";

interface Props {
  playerName: string;
  open: boolean;
  onClose: () => void;
  onSaved?: (data: { email: string; phone: string; avatarDataUrl: string | null }) => void;
  isFirstTime?: boolean;
}

// ── Legend avatars ─────────────────────────────────────────────────────────

type Legend = {
  id: string;
  name: string;
  short: string;   // shown inside the SVG (max ~10 chars)
  number: number;
  primary: string;
  secondary: string;
  flag: string;
};

const LEGENDS: Legend[] = [
  { id: "messi",        name: "Messi",       short: "MESSI",    number: 10, primary: "#2C87D5", secondary: "#FFFFFF", flag: "🇦🇷" },
  { id: "cr7",          name: "C. Ronaldo",  short: "CR7",      number: 7,  primary: "#C8102E", secondary: "#006A4E", flag: "🇵🇹" },
  { id: "ronaldinho",   name: "Ronaldinho",  short: "R10",      number: 10, primary: "#009A44", secondary: "#FEDD00", flag: "🇧🇷" },
  { id: "mbappe",       name: "Mbappé",      short: "MBAPPE",   number: 10, primary: "#002395", secondary: "#ED2939", flag: "🇫🇷" },
  { id: "neymar",       name: "Neymar Jr",   short: "NEYMAR",   number: 10, primary: "#FEDD00", secondary: "#009A44", flag: "🇧🇷" },
  { id: "pele",         name: "Pelé",        short: "PELE",     number: 10, primary: "#009A44", secondary: "#FEDD00", flag: "🇧🇷" },
  { id: "maradona",     name: "Maradona",    short: "D10S",     number: 10, primary: "#74ACDF", secondary: "#FFFFFF", flag: "🇦🇷" },
  { id: "zidane",       name: "Zidane",      short: "ZOU ZOU",  number: 5,  primary: "#002395", secondary: "#FFFFFF", flag: "🇫🇷" },
  { id: "haaland",      name: "Haaland",     short: "HAALAND",  number: 9,  primary: "#EF2B2D", secondary: "#FFFFFF", flag: "🇳🇴" },
  { id: "lewandowski",  name: "Lewandowski", short: "LEWA",     number: 9,  primary: "#DC143C", secondary: "#FFFFFF", flag: "🇵🇱" },
  { id: "benzema",      name: "Benzema",     short: "BENZEMA",  number: 9,  primary: "#002395", secondary: "#F5A623", flag: "🇫🇷" },
  { id: "beckham",      name: "Beckham",     short: "BECKS",    number: 7,  primary: "#CC0000", secondary: "#FFFFFF", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
];

function makeLegendSvg(l: Legend): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <clipPath id="c"><circle cx="100" cy="100" r="100"/></clipPath>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${l.primary}"/>
      <stop offset="100%" stop-color="${l.primary}BB"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#c)">
    <rect width="200" height="200" fill="url(#g)"/>
    <rect y="125" width="200" height="75" fill="${l.secondary}" opacity="0.35"/>
    <text x="100" y="110" font-family="Arial Black,Arial,sans-serif" font-size="82" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="white" opacity="0.95">${l.number}</text>
    <text x="100" y="163" font-family="Arial,sans-serif" font-size="19" font-weight="700" text-anchor="middle" fill="white" opacity="0.92">${l.short}</text>
  </g>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const LEGEND_SVGS = Object.fromEntries(LEGENDS.map((l) => [l.id, makeLegendSvg(l)]));

// ── Photo compression ──────────────────────────────────────────────────────

async function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const SIZE = 256;
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("canvas")); return; }
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Component ─────────────────────────────────────────────────────────────

export function ProfileModal({ playerName, open, onClose, onSaved, isFirstTime }: Props) {
  const playerKey = normalizeKey(playerName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const [loadingFetch, setLoadingFetch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !playerKey) return;
    setError("");
    setSaved(false);
    setShowUpload(false);
    setLoadingFetch(true);
    fetch(`/api/mundial/profile?name=${encodeURIComponent(playerKey)}`)
      .then((r) => r.json())
      .then((data: { email?: string; phone?: string; avatarDataUrl?: string | null }) => {
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
        setAvatarDataUrl(data.avatarDataUrl ?? null);
      })
      .catch(() => setError("No se pudo cargar el perfil."))
      .finally(() => setLoadingFetch(false));
  }, [open, playerKey]);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { setError("Solo se aceptan imágenes."); return; }
    try {
      const dataUrl = await compressAvatar(file);
      setAvatarDataUrl(dataUrl);
      setError("");
    } catch {
      setError("No se pudo procesar la imagen.");
    }
  }

  async function handleSave() {
    if (!playerKey || !playerName) return;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("El email no tiene un formato válido.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/mundial/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ normalizedName: playerKey, playerName, email, phone, avatarDataUrl }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Error al guardar");
      setSaved(true);
      onSaved?.({ email, phone, avatarDataUrl });
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  const initials = playerName.trim().slice(0, 2).toUpperCase() || "?";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#f0b429]/20 bg-[#080f0b] shadow-[0_32px_80px_rgba(0,0,0,0.9)]">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#f0b429]/70">Mundial 2026</p>
            <h2 className="text-base font-black text-white">
              {isFirstTime ? "¡Elegí tu avatar!" : "Mi Perfil"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/40 transition hover:border-white/25 hover:text-white/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loadingFetch ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#f0b429]/60" />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-5 p-5">

              {/* Current avatar preview */}
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/15">
                  {avatarDataUrl ? (
                    <>
                      <img src={avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAvatarDataUrl(null)}
                        className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-white/70 transition hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a3020] to-[#0a1a0d]">
                      <span className="text-xl font-black text-[#f0b429]">{initials}</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/30">Jugador</p>
                  <p className="truncate text-sm font-black text-white/80">{playerName}</p>
                  {isFirstTime && (
                    <p className="mt-1 text-xs text-[#f0b429]/80">
                      Elegí un ídolo o subí tu foto
                    </p>
                  )}
                </div>
              </div>

              {/* Legend avatar grid */}
              <div>
                <div className="mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#f0b429]" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Elige tu ídolo
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {LEGENDS.map((legend) => {
                    const svgUrl = LEGEND_SVGS[legend.id];
                    const isSelected = avatarDataUrl === svgUrl;
                    return (
                      <button
                        key={legend.id}
                        type="button"
                        onClick={() => { setAvatarDataUrl(isSelected ? null : svgUrl); setError(""); }}
                        className={cn(
                          "group flex flex-col items-center gap-1.5 rounded-xl border p-2 transition",
                          isSelected
                            ? "border-[#f0b429] bg-[#f0b429]/10 shadow-[0_0_12px_rgba(240,180,41,0.25)]"
                            : "border-white/10 bg-white/4 hover:border-white/25 hover:bg-white/8"
                        )}
                      >
                        <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/15">
                          <img src={svgUrl} alt={legend.name} className="h-full w-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Check className="h-5 w-5 text-[#f0b429]" />
                            </div>
                          )}
                        </div>
                        <span className="max-w-full truncate text-center text-[9px] font-black leading-tight text-white/60">
                          {legend.flag} {legend.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo upload section */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowUpload((v) => !v)}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/4 px-3.5 py-2.5 text-xs font-black text-white/50 transition hover:border-white/20 hover:text-white/75"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>O subí tu propia foto</span>
                  <span className="ml-auto text-white/25">{showUpload ? "▲" : "▼"}</span>
                </button>

                {showUpload && (
                  <div
                    className={cn(
                      "mt-2 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition",
                      isDragging
                        ? "border-[#f0b429] bg-[#f0b429]/8"
                        : "border-white/15 hover:border-white/30"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file) void handleFile(file);
                    }}
                  >
                    <Upload className="h-6 w-6 text-white/30" />
                    <p className="text-xs font-bold text-white/45">
                      Arrastrá o tocá para seleccionar
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFile(file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/8" />

              {/* Email */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white/45">
                  <Mail className="h-3 w-3 text-[#f0b429]/70" />
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="tu@correo.com"
                  className="w-full rounded-lg border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm font-bold text-white placeholder-white/20 outline-none transition focus:border-[#f0b429]/50 focus:bg-white/8 focus:ring-1 focus:ring-[#f0b429]/20"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-white/45">
                  <Phone className="h-3 w-3 text-[#f0b429]/70" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(""); }}
                  placeholder="+506 8888-8888"
                  className="w-full rounded-lg border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm font-bold text-white placeholder-white/20 outline-none transition focus:border-[#f0b429]/50 focus:bg-white/8 focus:ring-1 focus:ring-[#f0b429]/20"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-900/20 px-3.5 py-2.5 text-sm font-bold text-red-300">
                  {error}
                </p>
              )}

              {/* Save */}
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-black uppercase tracking-wide transition",
                  saved
                    ? "border-[#9dff34]/50 bg-[#9dff34]/15 text-[#9dff34]"
                    : "border-[#f0b429]/40 bg-[#f0b429] text-[#07110b] hover:bg-[#f5c842] disabled:opacity-50"
                )}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
                {saving ? "Guardando..." : saved ? "¡Guardado!" : isFirstTime ? "Guardar y continuar" : "Guardar cambios"}
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
