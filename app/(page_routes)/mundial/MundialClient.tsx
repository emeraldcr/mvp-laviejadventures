"use client";

import { Check, ChevronDown, CircleAlert, Loader2, RefreshCw, Save, UserRound } from "lucide-react";
import { VIEW_OPTIONS } from "./constants";
import { useMundial } from "./useMundial";
import { cn, formatKickoff, getCountryFlag } from "./utils";
import { MineView } from "./components/MineView";
import { NextView } from "./components/NextView";
import { PlayersView } from "./components/PlayersView";
import { PlayerPickerModal } from "./components/PlayerPickerModal";

export default function MundialClient() {
  const {
    playerName,
    setPlayerName,
    showPlayerPicker,
    setShowPlayerPicker,
    matches,
    players,
    viewMode,
    setViewMode,
    nowMs,
    isLoading,
    savingId,
    isSavingBulk,
    error,
    success,
    activeMatch,
    activeMatchId,
    slideMatches,
    recentClosedMatches,
    drafts,
    dirtyDrafts,
    savedCount,
    lockedCount,
    closedMatchCount,
    completionPct,
    lockedPct,
    activeCountdown,
    mineMatches,
    loadQuiniela,
    updateDraft,
    saveMatch,
    saveDirtyDrafts,
  } = useMundial();

  function handlePickPlayer(name: string) {
    setPlayerName(name);
    setShowPlayerPicker(false);
  }

  const openMatchCount = Math.max(matches.length - closedMatchCount, 0);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      {/* Game Hero */}
      <header className="bg-gradient-to-b from-[#04080f] via-[#081220] to-[#0c1a2e]">
        {/* Top strip: branding + player input */}
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">⚽</span>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">
              Mundial 2026
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPlayerPicker(true)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-white/[0.06] transition"
          >
            <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className={cn(
              "text-sm font-black",
              playerName ? "text-white" : "text-slate-600"
            )}>
              {playerName || "Elegí quién sos"}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-600" />
          </button>
        </div>

        {/* Active match showcase */}
        <div className="px-4 sm:px-6">
          {activeMatch ? (
            <>
              <div className="mb-4 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Partido #{activeMatch.number}
                  {activeMatch.group ? ` · Grupo ${activeMatch.group}` : ` · ${activeMatch.stageLabel}`}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                {/* Home */}
                <div className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[52px] leading-none sm:text-[64px]" aria-hidden="true">
                    {getCountryFlag(activeMatch.homeTeam)}
                  </span>
                  <span className="text-center text-[11px] font-black leading-tight text-white/70 sm:text-sm">
                    {activeMatch.homeTeam}
                  </span>
                </div>

                {/* Countdown center */}
                <div className="flex shrink-0 flex-col items-center gap-1 px-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Cierra en
                  </span>
                  <span className="text-[22px] font-black tabular-nums text-amber-400 leading-none sm:text-3xl">
                    {activeCountdown}
                  </span>
                  <span className="mt-1 text-center text-[10px] font-bold text-white/20">
                    {formatKickoff(activeMatch.kickoffAt)}
                  </span>
                </div>

                {/* Away */}
                <div className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[52px] leading-none sm:text-[64px]" aria-hidden="true">
                    {getCountryFlag(activeMatch.awayTeam)}
                  </span>
                  <span className="text-center text-[11px] font-black leading-tight text-white/70 sm:text-sm">
                    {activeMatch.awayTeam}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6">
              <span className="text-5xl leading-none">🏆</span>
              <p className="text-base font-black text-white">
                {closedMatchCount > 0 && closedMatchCount === matches.length
                  ? "¡Quiniela cerrada!"
                  : "Sin partido activo"}
              </p>
              <p className="text-xs font-bold text-slate-500">Esperando el próximo pitazo.</p>
            </div>
          )}
        </div>

        {/* Player HUD */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-4 pt-5 sm:px-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Guardado
              </span>
              <span className="text-xs font-black tabular-nums text-white">{completionPct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Cerrado
              </span>
              <span className="text-xs font-black tabular-nums text-amber-400">{lockedPct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: `${lockedPct}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Sticky nav bar */}
      <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px]">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setViewMode(option.id)}
              className={cn(
                "flex-1 py-3 text-xs font-black uppercase tracking-wide transition sm:flex-none sm:px-6",
                viewMode === option.id
                  ? "bg-slate-950 text-white"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              {option.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5 px-3 sm:px-4">
            <button
              type="button"
              onClick={() => void saveDirtyDrafts()}
              disabled={isSavingBulk || !dirtyDrafts.length}
              className="relative inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSavingBulk ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              {dirtyDrafts.length > 0 && !isSavingBulk && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black leading-none text-emerald-700 sm:hidden">
                  {dirtyDrafts.length}
                </span>
              )}
              <span className="hidden sm:inline">
                Guardar{dirtyDrafts.length > 0 ? ` (${dirtyDrafts.length})` : ""}
              </span>
            </button>
            <button
              type="button"
              onClick={() => void loadQuiniela()}
              disabled={isLoading}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6">
        {error && (
          <div className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-900">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        {isLoading ? (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <div>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
              <p className="mt-3 text-sm font-black text-slate-600">Cargando quiniela...</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "next" && (
              <NextView
                activeMatch={activeMatch}
                drafts={drafts}
                savingId={savingId}
                isSavingBulk={isSavingBulk}
                activeMatchId={activeMatchId}
                nowMs={nowMs}
                activeCountdown={activeCountdown}
                slideMatches={slideMatches}
                recentClosedMatches={recentClosedMatches}
                closedMatchCount={closedMatchCount}
                openMatchCount={openMatchCount}
                playerName={playerName}
                onUpdateDraft={updateDraft}
                onSave={saveMatch}
              />
            )}
            {viewMode === "mine" && (
              <MineView
                savedCount={savedCount}
                lockedCount={lockedCount}
                mineMatches={mineMatches}
                drafts={drafts}
                savingId={savingId}
                isSavingBulk={isSavingBulk}
                activeMatchId={activeMatchId}
                nowMs={nowMs}
                onUpdateDraft={updateDraft}
                onSave={saveMatch}
              />
            )}
            {viewMode === "players" && <PlayersView players={players} />}
          </>
        )}
      </section>

      {showPlayerPicker && (
        <PlayerPickerModal
          players={players}
          onSelect={handlePickPlayer}
          onClose={() => setShowPlayerPicker(false)}
          allowClose={Boolean(playerName)}
        />
      )}
    </main>
  );
}
