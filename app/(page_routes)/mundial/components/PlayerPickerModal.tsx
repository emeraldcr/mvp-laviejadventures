"use client";

import { useState } from "react";
import { UserRound, X } from "lucide-react";
import type { PlayerProgress } from "../types";
import { cn } from "../utils";

type Props = {
  players: PlayerProgress[];
  onSelect: (name: string) => void;
  onClose?: () => void;
  allowClose?: boolean;
};

export function PlayerPickerModal({ players, onSelect, onClose, allowClose }: Props) {
  const [customName, setCustomName] = useState("");
  const [search, setSearch] = useState("");

  const filtered = players.filter((p) =>
    p.playerName.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) =>
    a.playerName.localeCompare(b.playerName)
  );

  function handleSelect(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSelect(trimmed);
  }

  function handleCustomSubmit() {
    const trimmed = customName.trim();
    if (!trimmed) return;
    onSelect(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#0c1a2e] border border-white/[0.08] shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-black text-white">¿Quién sos?</h2>
          </div>
          {allowClose && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search / filter */}
        {players.length > 6 && (
          <div className="px-5 pb-3 shrink-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nombre..."
              className="w-full rounded-xl bg-white/[0.06] border border-white/[0.10] px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-400 transition"
              autoFocus
            />
          </div>
        )}

        {/* Players list */}
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          {sorted.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {sorted.map((p) => (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() => handleSelect(p.playerName)}
                    className="w-full flex items-center justify-between rounded-xl px-4 py-3 bg-white/[0.04] border border-white/[0.07] hover:bg-emerald-500/20 hover:border-emerald-500/40 transition group"
                  >
                    <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                      {p.playerName}
                    </span>
                    <span className="text-[11px] font-black text-slate-500 tabular-nums group-hover:text-emerald-400 transition">
                      {p.totalPredictions} picks
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-slate-500">
              {search ? "Sin resultados." : "Aún no hay jugadores registrados."}
            </p>
          )}
        </div>

        {/* Divider + new player */}
        <div className="px-5 pb-6 pt-3 border-t border-white/[0.06] shrink-0">
          <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
            Soy nuevo
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
              placeholder="Tu nombre..."
              maxLength={40}
              className="flex-1 rounded-xl bg-white/[0.06] border border-white/[0.10] px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-400 transition"
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              disabled={!customName.trim()}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2 text-sm font-black transition",
                customName.trim()
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
              )}
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
