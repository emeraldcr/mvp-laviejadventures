"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, Mail, Phone, X } from "lucide-react";
import { cn, normalizeKey } from "../utils";

interface Props {
  playerName: string;
  open: boolean;
  onClose: () => void;
  onSaved?: (data: { email: string; phone: string; avatarDataUrl: string | null }) => void;
}

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

export function ProfileModal({ playerName, open, onClose, onSaved }: Props) {
  const playerKey = normalizeKey(playerName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [loadingFetch, setLoadingFetch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing profile when modal opens
  useEffect(() => {
    if (!open || !playerKey) return;
    setError("");
    setSaved(false);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-[#f0b429]/20 bg-[#080f0b] shadow-[0_32px_80px_rgba(0,0,0,0.85)]">

        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#f0b429]/70">
              Mundial 2026
            </p>
            <h2 className="text-base font-black text-white">Mi Perfil</h2>
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
          <div className="p-5 space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  "relative cursor-pointer group",
                  isDragging && "scale-105"
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
                {/* Avatar circle */}
                <div className={cn(
                  "relative h-24 w-24 overflow-hidden rounded-full border-2 transition-all",
                  isDragging
                    ? "border-[#f0b429] shadow-[0_0_24px_rgba(240,180,41,0.5)]"
                    : "border-white/15 group-hover:border-[#f0b429]/60"
                )}>
                  {avatarDataUrl ? (
                    <img
                      src={avatarDataUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a3020] to-[#0a1a0d]">
                      <span className="text-2xl font-black text-[#f0b429]">{initials}</span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Hidden file input */}
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

              <p className="text-center text-xs text-white/35">
                Toca la foto para cambiarla
              </p>
            </div>

            {/* Player name (read-only) */}
            <div className="rounded-lg border border-white/8 bg-white/4 px-3.5 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-wider text-white/30">Jugador</p>
              <p className="text-sm font-black text-white/70">{playerName}</p>
            </div>

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

            {/* Error */}
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-900/20 px-3.5 py-2.5 text-sm font-bold text-red-300">
                {error}
              </p>
            )}

            {/* Save button */}
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
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4" />
              ) : null}
              {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
