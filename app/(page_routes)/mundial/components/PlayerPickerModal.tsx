"use client";

import { useState } from "react";
import { Trophy, UserRound, X } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 px-2 pb-2 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-[#62ffe6]/45 bg-[#071018] shadow-[0_24px_80px_rgba(0,0,0,0.8)] sm:max-h-[84vh]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/15 bg-[#3151ff] px-4 py-5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/25 bg-white text-[#17206b]">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-black uppercase leading-tight text-white">Quien sos?</h2>
              <p className="mt-1 text-sm font-bold text-white/70">Elegi tu perfil para jugar</p>
            </div>
          </div>
          {allowClose && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar selector de jugador"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white/75 transition hover:border-[#d5ff3f] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {players.length > 6 && (
          <div className="shrink-0 px-4 py-4 sm:px-5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar jugador..."
              className="h-12 w-full rounded-lg border border-white/15 bg-black/45 px-4 text-base font-bold text-white outline-none transition placeholder:text-white/35 focus:border-[#62ffe6] focus:ring-2 focus:ring-[#62ffe6]/20"
              autoFocus
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-3 pt-1 sm:px-5">
          {sorted.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {sorted.map((p) => (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() => handleSelect(p.playerName)}
                    className="group flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border border-white/15 bg-black/35 px-3 py-3 transition-all hover:border-[#62ffe6] hover:bg-[#071d2a] sm:px-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-black/45">
                        <Trophy className="h-4 w-4 text-white/50 transition group-hover:text-[#d5ff3f]" />
                      </div>
                      <span className="truncate text-base font-black text-white">
                        {p.playerName}
                      </span>
                    </div>
                    <span className="ml-2 shrink-0 rounded-md border border-[#62ffe6]/45 px-2 py-1 text-xs font-black tabular-nums text-[#62ffe6] transition group-hover:text-white">
                      {p.totalPredictions} picks
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-5 text-center text-base font-bold text-white/55">
              {search ? "Sin resultados." : "Aun no hay jugadores."}
            </p>
          )}
        </div>

        <div className="shrink-0 border-t border-white/15 bg-black/35 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#d5ff3f]">
            Soy nuevo - registrarme
          </p>
          <div className="flex flex-col gap-2 min-[420px]:flex-row">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
              placeholder="Tu nombre..."
              maxLength={40}
              className="h-12 min-w-0 flex-1 rounded-lg border border-white/15 bg-black/45 px-4 text-base font-bold text-white outline-none transition placeholder:text-white/35 focus:border-[#62ffe6] focus:ring-2 focus:ring-[#62ffe6]/20"
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              disabled={!customName.trim()}
              className={cn(
                "min-h-12 shrink-0 rounded-lg border px-6 text-base font-black transition-all",
                customName.trim()
                  ? "border-[#d5ff3f] bg-[#9dff34] text-[#06121c] hover:border-white hover:bg-[#d5ff3f]"
                  : "cursor-not-allowed border-white/10 bg-white/10 text-white/35"
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
