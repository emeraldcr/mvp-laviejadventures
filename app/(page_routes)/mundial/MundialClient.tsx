"use client";

import {
  Check,
  ChevronDown,
  CircleAlert,
  Loader2,
  ListChecks,
  RefreshCw,
  Save,
  Target,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { VIEW_OPTIONS } from "./constants";
import type { ViewMode } from "./types";
import { useMundial } from "./useMundial";
import { cn } from "./utils";
import { MineView } from "./components/MineView";
import { NextView } from "./components/NextView";
import { PlayersView } from "./components/PlayersView";
import { PlayerPickerModal } from "./components/PlayerPickerModal";

function ViewIcon({ id, active }: { id: ViewMode; active: boolean }) {
  const className = cn("h-4 w-4 shrink-0", active ? "text-[#62ffe6]" : "text-white/55");

  if (id === "next") return <Target className={className} />;
  if (id === "mine") return <ListChecks className={className} />;
  return <Users className={className} />;
}

export default function MundialClient() {
  const {
    playerName,
    setPlayerName,
    showPlayerPicker,
    setShowPlayerPicker,
    matches,
    predictions,
    players,
    leaderboard,
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
    todayEditableMatchIds,
    drafts,
    dirtyDrafts,
    savedCount,
    lockedCount,
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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#102b10] text-white [background-image:radial-gradient(circle_at_50%_-10%,rgba(157,255,52,0.26),transparent_34%),linear-gradient(135deg,#1b2f86_0%,#2c256d_30%,#0b3320_68%,#193e0f_100%)]">
      <header className="relative overflow-hidden border-b border-white/15 bg-[#12236c]/80">
        <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:linear-gradient(120deg,rgba(255,255,255,0.10)_0,rgba(255,255,255,0)_32%),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:100%_100%,92px_92px,92px_92px]" />

        <div className="relative mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/25 bg-white text-[#17206b] shadow-[0_0_0_3px_rgba(157,255,52,0.35)]">
              <Trophy className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d5ff3f]">Mundial 2026</p>
              <h1 className="truncate text-2xl font-black leading-tight text-white sm:text-4xl">Quiniela live</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPlayerPicker(true)}
            className="flex min-h-11 max-w-full min-w-0 items-center gap-2 rounded-lg border border-white/20 bg-black/45 px-3 py-2 transition hover:border-[#62ffe6] hover:bg-black/65 sm:px-4"
          >
            <UserRound className="h-4 w-4 shrink-0 text-[#62ffe6]" />
            <span
              className={cn(
                "max-w-[58vw] truncate text-base font-black sm:max-w-none",
                playerName ? "text-white" : "text-white/60"
              )}
            >
              {playerName || "Elegir jugador"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#d5ff3f]" />
          </button>
        </div>
      </header>

      <nav className="sticky top-0 z-20 border-y border-white/15 bg-[#090915]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="grid grid-cols-3 gap-2 sm:flex sm:min-w-0">
            {VIEW_OPTIONS.map((option) => {
              const active = viewMode === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setViewMode(option.id)}
                  className={cn(
                    "inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-lg border px-2.5 text-center text-sm font-black uppercase tracking-wide transition sm:px-5",
                    active
                      ? "border-[#62ffe6] bg-[#3151ff] text-white shadow-[0_0_24px_rgba(98,255,230,0.20)]"
                      : "border-white/15 bg-white/5 text-white/65 hover:border-[#d5ff3f] hover:bg-white/10 hover:text-white"
                  )}
                >
                  <ViewIcon id={option.id} active={active} />
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={() => void saveDirtyDrafts()}
              disabled={isSavingBulk || !dirtyDrafts.length}
              className="relative inline-flex h-12 min-w-0 items-center justify-center gap-2 rounded-lg border border-[#d5ff3f] bg-[#9dff34] px-4 text-sm font-black text-[#06121c] transition hover:border-white hover:bg-[#d5ff3f] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/35"
            >
              {isSavingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span className="truncate">Guardar cambios{dirtyDrafts.length > 0 ? ` (${dirtyDrafts.length})` : ""}</span>
            </button>
            <button
              type="button"
              onClick={() => void loadQuiniela()}
              disabled={isLoading}
              aria-label="Sincronizar quiniela"
              className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/70 transition hover:border-[#62ffe6] hover:text-white disabled:opacity-40 sm:w-auto sm:px-4"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2 hidden text-sm font-black sm:inline">Sync</span>
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 sm:py-6">
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-[#ff6a3d]/60 bg-[#35130d]/80 p-4 text-sm font-bold text-[#ffd2c2]">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <span className="min-w-0 break-words">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-[#9dff34]/60 bg-[#10240b]/80 p-4 text-sm font-bold text-[#e7ffc0]">
            <Check className="mt-0.5 h-5 w-5 shrink-0" />
            <span className="min-w-0 break-words">{success}</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-white/20 bg-black/35 p-8 text-center">
            <div>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#62ffe6]" />
              <p className="mt-4 text-base font-black text-white/75">Cargando quiniela...</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "next" && (
              <NextView
                activeMatch={activeMatch}
                matches={matches}
                drafts={drafts}
                savingId={savingId}
                isSavingBulk={isSavingBulk}
                activeMatchId={activeMatchId}
                nowMs={nowMs}
                activeCountdown={activeCountdown}
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
                todayEditableMatchIds={todayEditableMatchIds}
                nowMs={nowMs}
                onUpdateDraft={updateDraft}
                onSave={saveMatch}
              />
            )}
            {viewMode === "players" && <PlayersView leaderboard={leaderboard} />}
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
