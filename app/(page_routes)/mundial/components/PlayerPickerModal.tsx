"use client";

import { useState } from "react";
import { UserRound, X, Trophy } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 px-2 pb-2 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-md flex-col rounded-2xl border border-[#1e3a1e] bg-[#080f08] sm:max-h-[80vh]"
        style={{ boxShadow: "0 0 40px rgba(34,197,94,0.12), 0 24px 80px rgba(0,0,0,0.8)" }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#1a2e1a] px-4 pb-4 pt-5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-green-700/50 bg-green-950/50">
              <UserRound className="h-4 w-4 text-green-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-white">¿Quién sos?</h2>
              <p className="text-[11px] font-bold text-[#3a5a3a]">Elegí tu perfil para jugar</p>
            </div>
          </div>
          {allowClose && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#1a2e1a] text-[#3a5a3a] hover:border-[#2a4a2a] hover:text-[#6aab6a] transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search / filter */}
        {players.length > 6 && (
          <div className="shrink-0 px-4 py-3 sm:px-5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jugador..."
              className="w-full rounded-xl border border-[#1e3a1e] bg-[#0c160c] px-3 py-2.5 text-sm text-[#d4f0d4] placeholder:text-[#2a4020] outline-none focus:border-green-600 transition"
              autoFocus
            />
          </div>
        )}

        {/* Players list */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 pt-1 sm:px-5">
          {sorted.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {sorted.map((p) => (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() => handleSelect(p.playerName)}
                    className="group flex w-full items-center justify-between rounded-xl border border-[#1a2e1a] bg-[#0c160c] px-3 py-3 transition-all hover:border-green-600/60 hover:bg-green-950/30 sm:px-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-7 w-7 shrink-0 rounded-lg border border-[#1e3a1e] bg-[#080f08] flex items-center justify-center">
                        <Trophy className="h-3.5 w-3.5 text-[#3a5a3a] group-hover:text-green-400 transition" />
                      </div>
                      <span className="text-sm font-bold text-[#d4f0d4] group-hover:text-white transition truncate">
                        {p.playerName}
                      </span>
                    </div>
                    <span className="text-[11px] font-black text-[#3a5a3a] tabular-nums group-hover:text-green-400 transition shrink-0 ml-2">
                      {p.totalPredictions} picks
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-[#3a5a3a]">
              {search ? "Sin resultados." : "Aún no hay jugadores."}
            </p>
          )}
        </div>

        {/* Divider + new player */}
        <div className="shrink-0 border-t border-[#1a2e1a] px-4 pb-4 pt-4 sm:px-5 sm:pb-6">
          <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-[#3a5a3a]">
            Soy nuevo — registrarme
          </p>
          <div className="flex flex-col gap-2 min-[380px]:flex-row">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
              placeholder="Tu nombre..."
              maxLength={40}
              className="min-w-0 flex-1 rounded-xl border border-[#1e3a1e] bg-[#0c160c] px-3 py-2.5 text-sm text-[#d4f0d4] outline-none transition placeholder:text-[#2a4020] focus:border-green-600"
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              disabled={!customName.trim()}
              className={cn(
                "shrink-0 rounded-xl px-5 py-2.5 text-sm font-black transition-all",
                customName.trim()
                  ? "bg-green-600 text-white hover:bg-green-500 border border-green-500"
                  : "bg-[#080f08] border border-[#1a2e1a] text-[#2a4020] cursor-not-allowed"
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
