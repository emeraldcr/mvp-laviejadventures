"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  CircleAlert,
  Loader2,
  ListChecks,
  MoreHorizontal,
  RefreshCw,
  Save,
  Shield,
  Target,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { VIEW_OPTIONS } from "./constants";
import type { MundialMatch, ViewMode } from "./types";
import { useMundial } from "./useMundial";
import { cn, normalizeKey } from "./utils";
import { MineView } from "./components/MineView";
import { NextView } from "./components/NextView";
import { PlayersView } from "./components/PlayersView";
import { PlayerPickerModal } from "./components/PlayerPickerModal";
import { PinModal } from "./components/PinModal";

function ViewIcon({ id, active }: { id: ViewMode; active: boolean }) {
  const className = cn("h-4 w-4 shrink-0", active ? "text-[#07110b]" : "text-white/55");

  if (id === "next") return <Target className={className} />;
  if (id === "mine") return <ListChecks className={className} />;
  return <Users className={className} />;
}

export default function MundialClient() {
  const {
    playerName,
    showPlayerPicker,
    canClosePlayerPicker,
    selectPlayer,
    openPlayerPicker,
    closePlayerPicker,
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
    liveMatch,
    activeMatchId,
    recentClosedMatches,
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
    showPinModal,
    pinMode,
    onPinSuccess,
    registeredNames,
  } = useMundial();

  const [selectedInfoMatchId, setSelectedInfoMatchId] = useState<string | null>(null);
  const [featuredMatchId, setFeaturedMatchId] = useState<string | null>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  const mostRecentMatch = useMemo(
    () => liveMatch ?? recentClosedMatches[0] ?? activeMatch ?? matches[0] ?? null,
    [activeMatch, liveMatch, matches, recentClosedMatches]
  );

  const explicitSelectedMatch = useMemo(
    () => matches.find((match) => match.id === selectedInfoMatchId) ?? null,
    [matches, selectedInfoMatchId]
  );

  const featuredMatch = useMemo(() => {
    if (featuredMatchId) return matches.find((match) => match.id === featuredMatchId) ?? activeMatch;
    return liveMatch ?? activeMatch;
  }, [activeMatch, featuredMatchId, liveMatch, matches]);

  const selectedInfoMatch = explicitSelectedMatch ?? featuredMatch ?? mostRecentMatch;

  function handlePickPlayer(name: string) {
    selectPlayer(name);
  }

  function handleSelectMatch(match: MundialMatch) {
    setSelectedInfoMatchId(match.id);
    setFeaturedMatchId(match.id);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07110b] text-white [background-image:linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(135deg,#06100b_0%,#0b2216_45%,#14351d_74%,#07110b_100%)] [background-size:96px_96px,96px_96px,100%_100%]">
      <header className="sticky top-0 z-20 border-b border-[#f0b429]/20 bg-[#060a08]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-2 px-3 py-1.5 sm:px-5">
          {/* Logo */}
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded border border-[#f0b429]/40 bg-[#f0b429] text-[#07110b]">
            <Trophy className="h-3.5 w-3.5" />
          </span>

          {/* View tabs */}
          <div className="flex min-w-0 flex-1 gap-1">
            {VIEW_OPTIONS.map((option) => {
              const active = viewMode === option.id;
              const shortLabels: Record<string, string> = { next: "Ahora", mine: "Picks", players: "Tabla" };
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setViewMode(option.id)}
                  className={cn(
                    "inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1 rounded border px-1.5 font-black uppercase tracking-wide transition sm:flex-none sm:gap-1.5 sm:px-3",
                    active
                      ? "border-[#f0b429] bg-[#f0b429] text-[#07110b] shadow-[0_0_18px_rgba(240,180,41,0.28)]"
                      : "border-white/12 bg-white/4 text-white/55 hover:border-white/25 hover:text-white/80"
                  )}
                >
                  <ViewIcon id={option.id} active={active} />
                  <span className="text-[10px] sm:hidden">{shortLabels[option.id]}</span>
                  <span className="hidden text-xs sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Save badge — visible shortcut when there are dirty drafts */}
          {dirtyDrafts.length > 0 && (
            <button
              type="button"
              onClick={() => void saveDirtyDrafts()}
              disabled={isSavingBulk}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded border border-[#d5ff3f] bg-[#9dff34] px-2.5 text-xs font-black text-[#06121c] transition hover:bg-[#d5ff3f] disabled:opacity-50"
            >
              {isSavingBulk ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>{dirtyDrafts.length}</span>
            </button>
          )}

          {/* ··· menu */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowHeaderMenu((v) => !v)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded border px-2.5 text-xs font-black transition",
                showHeaderMenu
                  ? "border-white/30 bg-white/12 text-white"
                  : "border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white/90"
              )}
              aria-label="Menú"
            >
              <UserRound className="h-3.5 w-3.5 text-[#f0b429]" />
              <span className="hidden max-w-28 truncate sm:inline">{playerName || "Jugador"}</span>
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

            {showHeaderMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowHeaderMenu(false)} />
                <div className="absolute right-0 top-full z-20 mt-1.5 w-56 overflow-hidden rounded-lg border border-[#f0b429]/20 bg-[#08130d] shadow-[0_16px_48px_rgba(0,0,0,0.7)]">
                  {/* Player */}
                  <button
                    type="button"
                    onClick={() => { openPlayerPicker(); setShowHeaderMenu(false); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-white/8"
                  >
                    <UserRound className="h-4 w-4 shrink-0 text-[#f0b429]" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-white/35">Jugador</p>
                      <p className="truncate text-sm font-black text-white">{playerName || "—"}</p>
                    </div>
                    <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-[#d5ff3f]" />
                  </button>

                  <div className="mx-3 h-px bg-white/10" />

                  {/* Guardar */}
                  <button
                    type="button"
                    onClick={() => { void saveDirtyDrafts(); setShowHeaderMenu(false); }}
                    disabled={isSavingBulk || !dirtyDrafts.length}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-white/8 disabled:opacity-35"
                  >
                    {isSavingBulk ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white/50" /> : <Save className="h-4 w-4 shrink-0 text-white/50" />}
                    <span className="text-sm font-black text-white/80">
                      Guardar{dirtyDrafts.length > 0 ? ` (${dirtyDrafts.length})` : ""}
                    </span>
                  </button>

                  {/* Sync */}
                  <button
                    type="button"
                    onClick={() => { void loadQuiniela(); setShowHeaderMenu(false); }}
                    disabled={isLoading}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-white/8 disabled:opacity-35"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white/50" /> : <RefreshCw className="h-4 w-4 shrink-0 text-white/50" />}
                    <span className="text-sm font-black text-white/80">Sincronizar</span>
                  </button>

                  {/* Admin */}
                  {normalizeKey(playerName) === "ALLAN" && (
                    <>
                      <div className="mx-3 h-px bg-white/10" />
                      <Link
                        href="/mundial/admin"
                        onClick={() => setShowHeaderMenu(false)}
                        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-red-900/30"
                      >
                        <Shield className="h-4 w-4 shrink-0 text-red-400" />
                        <span className="text-sm font-black text-red-400">Admin</span>
                      </Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1600px] px-3 py-3 sm:px-5 sm:py-4">
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
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#f0b429]" />
              <p className="mt-4 text-base font-black text-white/75">Cargando quiniela...</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "next" && (
              <NextView
                activeMatch={activeMatch}
                selectedInfoMatch={selectedInfoMatch}
                featuredMatch={featuredMatch}
                matches={matches}
                predictions={predictions}
                drafts={drafts}
                savingId={savingId}
                isSavingBulk={isSavingBulk}
                activeMatchId={activeMatchId}
                nowMs={nowMs}
                activeCountdown={activeCountdown}
                playerName={playerName}
                onUpdateDraft={updateDraft}
                onSave={saveMatch}
                onSelectMatch={handleSelectMatch}
                onOpenPlayerPicker={openPlayerPicker}
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
            {viewMode === "players" && <PlayersView leaderboard={leaderboard} matches={matches} predictions={predictions} />}
          </>
        )}
      </section>

      {showPlayerPicker && (
        <PlayerPickerModal
          players={registeredNames}
          onSelect={handlePickPlayer}
          onClose={closePlayerPicker}
          allowClose={Boolean(playerName) && canClosePlayerPicker}
        />
      )}

      {showPinModal && (
        <PinModal
          playerName={playerName}
          mode={pinMode}
          onSuccess={onPinSuccess}
          onChangePlayer={openPlayerPicker}
        />
      )}
    </main>
  );
}
