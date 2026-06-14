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
    predictions,
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
    <main className="min-h-screen overflow-x-hidden bg-[#050905] text-white">
      {/* Hero header */}
      <header
        style={{
          background: "linear-gradient(180deg, #060e06 0%, #080f08 40%, #050905 100%)",
          borderBottom: "1px solid #1a2e1a",
        }}
      >
        {/* Top strip */}
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-2 px-3 pb-3 pt-3 sm:flex-nowrap sm:px-6 sm:pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="text-base leading-none">⚽</span>
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#2a4a2a]">
              Mundial 2026
            </span>
          </div>

          {/* Player selector */}
          <button
            type="button"
            onClick={() => setShowPlayerPicker(true)}
            className="flex min-h-9 max-w-full min-w-0 items-center gap-1.5 rounded-lg border border-[#1a2e1a] bg-[#0a140a] px-2.5 py-1.5 transition hover:border-green-700/50 hover:bg-green-950/20 sm:px-3"
          >
            <UserRound className="h-3.5 w-3.5 shrink-0 text-[#3a5a3a]" />
            <span className={cn(
              "max-w-[58vw] truncate text-sm font-black sm:max-w-none",
              playerName ? "text-green-400" : "text-[#3a5a3a]"
            )}>
              {playerName || "Elegí quién sos"}
            </span>
            <ChevronDown className="h-3 w-3 shrink-0 text-[#2a4020]" />
          </button>
        </div>

        {/* Active match showcase */}
        <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6">
          {activeMatch ? (
            <>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-green-400"
                  style={{ boxShadow: "0 0 6px rgba(74,222,128,0.8)" }}
                />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400">
                  Partido #{activeMatch.number}
                  {activeMatch.group ? ` · Grupo ${activeMatch.group}` : ` · ${activeMatch.stageLabel}`}
                </span>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 sm:gap-4">
                {/* Home */}
                <div className="flex min-w-0 flex-col items-center gap-1.5 sm:gap-2">
                  <span className="text-[44px] leading-none drop-shadow-lg sm:text-[64px]" aria-hidden="true">
                    {getCountryFlag(activeMatch.homeTeam)}
                  </span>
                  <span className="max-w-full break-words text-center text-[10px] font-black uppercase leading-tight tracking-wide text-[#c0d8c0] sm:text-sm">
                    {activeMatch.homeTeam}
                  </span>
                </div>

                {/* Countdown center */}
                <div
                  className="flex max-w-[34vw] shrink-0 flex-col items-center gap-0.5 rounded-xl border border-amber-700/30 bg-amber-950/20 px-2 py-2 sm:max-w-none sm:px-4 sm:py-3"
                  style={{ boxShadow: "0 0 20px rgba(245,158,11,0.10)" }}
                >
                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-700 sm:text-[9px]">
                    Cierra en
                  </span>
                  <span
                    className="text-xl font-black leading-none tabular-nums text-amber-400 sm:text-4xl"
                    style={{ textShadow: "0 0 20px rgba(251,191,36,0.4)" }}
                  >
                    {activeCountdown}
                  </span>
                  <span className="mt-1 max-w-[7rem] text-center text-[9px] font-bold leading-tight text-[#2a4020] sm:max-w-none sm:text-[10px]">
                    {formatKickoff(activeMatch.kickoffAt)}
                  </span>
                </div>

                {/* Away */}
                <div className="flex min-w-0 flex-col items-center gap-1.5 sm:gap-2">
                  <span className="text-[44px] leading-none drop-shadow-lg sm:text-[64px]" aria-hidden="true">
                    {getCountryFlag(activeMatch.awayTeam)}
                  </span>
                  <span className="max-w-full break-words text-center text-[10px] font-black uppercase leading-tight tracking-wide text-[#c0d8c0] sm:text-sm">
                    {activeMatch.awayTeam}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 sm:py-8">
              <span className="text-5xl leading-none">🏆</span>
              <p className="text-lg font-black text-white">
                {closedMatchCount > 0 && closedMatchCount === matches.length
                  ? "¡Quiniela cerrada!"
                  : "Sin partido activo"}
              </p>
              <p className="text-xs font-bold text-[#3a5a3a]">Esperando el próximo pitazo.</p>
            </div>
          )}
        </div>

        {/* Player HUD stats */}
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-2 px-3 pb-4 pt-4 min-[420px]:grid-cols-2 sm:px-6 sm:pb-5 sm:pt-5">
          <div className="rounded-xl border border-[#1a2e1a] bg-[#0a140a] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2a4020]">
                Guardado
              </span>
              <span className="text-xs font-black tabular-nums text-green-400">{completionPct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#080f08] border border-[#1a2e1a]">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{
                  width: `${completionPct}%`,
                  boxShadow: completionPct > 0 ? "0 0 6px rgba(34,197,94,0.5)" : undefined,
                }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-[#1a2e1a] bg-[#0a140a] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2a4020]">
                Cerrado
              </span>
              <span className="text-xs font-black tabular-nums text-amber-400">{lockedPct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#080f08] border border-[#1a2e1a]">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{
                  width: `${lockedPct}%`,
                  boxShadow: lockedPct > 0 ? "0 0 6px rgba(245,158,11,0.4)" : undefined,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Sticky nav bar */}
      <nav
        className="sticky top-0 z-20 border-b border-[#1a2e1a] backdrop-blur-md"
        style={{ background: "rgba(5,9,5,0.95)" }}
      >
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 sm:flex sm:items-center">
          <div className="grid grid-cols-3 sm:flex sm:min-w-0">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setViewMode(option.id)}
                className={cn(
                  "relative min-h-11 px-2 py-3 text-center text-[10px] font-black uppercase tracking-wide transition sm:flex-none sm:px-8 sm:text-[11px] sm:tracking-widest",
                  viewMode === option.id
                    ? "text-green-400"
                    : "text-[#2a4020] hover:text-[#4a6e4a]"
                )}
              >
                <span className="block truncate">{option.label}</span>
                {viewMode === option.id && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-green-500"
                    style={{ boxShadow: "0 0 8px rgba(34,197,94,0.6)" }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-[#1a2e1a] px-3 py-2 sm:ml-auto sm:border-t-0 sm:px-4 sm:py-0">
            <button
              type="button"
              onClick={() => void saveDirtyDrafts()}
              disabled={isSavingBulk || !dirtyDrafts.length}
              className="relative inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-green-700 bg-green-800 px-3 text-xs font-black text-white transition hover:border-green-500 hover:bg-green-600 disabled:cursor-not-allowed disabled:border-[#1a2e1a] disabled:bg-transparent disabled:opacity-30 sm:h-8 sm:flex-none"
            >
              {isSavingBulk ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              {dirtyDrafts.length > 0 && !isSavingBulk && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-green-600 bg-green-500 text-[10px] font-black leading-none text-white sm:hidden">
                  {dirtyDrafts.length}
                </span>
              )}
              <span className="truncate">
                Guardar{dirtyDrafts.length > 0 ? ` (${dirtyDrafts.length})` : ""}
              </span>
            </button>
            <button
              type="button"
              onClick={() => void loadQuiniela()}
              disabled={isLoading}
              aria-label="Sincronizar quiniela"
              className="inline-flex h-9 w-10 items-center justify-center gap-1.5 rounded-lg border border-[#1a2e1a] bg-[#0a140a] px-0 text-xs font-black text-[#4a6e4a] transition hover:border-[#2a4a2a] hover:text-[#6aab6a] disabled:opacity-40 sm:h-8 sm:w-auto sm:px-3"
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
      <section className="mx-auto w-full max-w-[1600px] px-3 py-3 sm:px-6 sm:py-4">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-900/50 bg-red-950/30 p-3 text-sm font-bold text-red-400">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-green-800/50 bg-green-950/30 p-3 text-sm font-bold text-green-400">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 break-words">{success}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-[#1a2e1a] bg-[#080f08] p-8 text-center">
            <div>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-600" />
              <p className="mt-3 text-sm font-black text-[#4a6e4a]">Cargando quiniela...</p>
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
                predictions={predictions}
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
