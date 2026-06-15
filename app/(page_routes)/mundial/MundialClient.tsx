"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  ChevronDown,
  CircleAlert,
  Loader2,
  ListChecks,
  RefreshCw,
  Save,
  Shield,
  Target,
  Trophy,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { VIEW_OPTIONS } from "./constants";
import type { MundialMatch, ViewMode } from "./types";
import { useMundial } from "./useMundial";
import { cn, normalizeKey } from "./utils";
import { MineView } from "./components/MineView";
import { NextView } from "./components/NextView";
import { OtherPicksPanel } from "./components/OtherPicksPanel";
import { PlayersView } from "./components/PlayersView";
import { PlayerPickerModal } from "./components/PlayerPickerModal";
import { PinModal } from "./components/PinModal";
import { StatBetsPanel } from "./components/StatBetsPanel";

function ViewIcon({ id, active }: { id: ViewMode; active: boolean }) {
  const className = cn("h-4 w-4 shrink-0", active ? "text-[#62ffe6]" : "text-white/55");

  if (id === "next") return <Target className={className} />;
  if (id === "mine") return <ListChecks className={className} />;
  return <Users className={className} />;
}

function MatchMenuActions({
  pickCount,
  onOpenPicks,
  onOpenBets,
}: {
  pickCount: number;
  onOpenPicks: () => void;
  onOpenBets: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
      <button
        type="button"
        onClick={onOpenPicks}
        className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-md border border-[#62ffe6]/55 bg-[#071d2a] px-2.5 text-xs font-black text-[#62ffe6] transition hover:border-white hover:text-white sm:px-3"
      >
        <Users className="h-4 w-4 shrink-0" />
        <span className="truncate">Picks amigos</span>
        <span className="rounded bg-black/40 px-1.5 py-0.5 text-xs tabular-nums text-white">{pickCount}</span>
      </button>
      <button
        type="button"
        onClick={onOpenBets}
        className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-md border border-[#d5ff3f]/55 bg-[#1a2206] px-2.5 text-xs font-black text-[#d5ff3f] transition hover:border-white hover:text-white sm:px-3"
      >
        <Zap className="h-4 w-4 shrink-0" />
        <span className="truncate">Apuestas</span>
      </button>
    </div>
  );
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
  } = useMundial();

  const [selectedInfoMatchId, setSelectedInfoMatchId] = useState<string | null>(null);
  const [featuredMatchId, setFeaturedMatchId] = useState<string | null>(null);
  const [showPicksModal, setShowPicksModal] = useState(false);
  const [showBetsModal, setShowBetsModal] = useState(false);

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
  const modalMatch = explicitSelectedMatch ?? featuredMatch ?? mostRecentMatch;
  const modalPickCount = useMemo(
    () => (modalMatch ? predictions.filter((prediction) => prediction.matchId === modalMatch.id).length : 0),
    [modalMatch, predictions]
  );

  function handlePickPlayer(name: string) {
    selectPlayer(name);
  }

  function handleSelectMatch(match: MundialMatch) {
    setSelectedInfoMatchId(match.id);
    setFeaturedMatchId(match.id);
    setShowPicksModal(false);
    setShowBetsModal(false);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#102b10] text-white [background-image:radial-gradient(circle_at_50%_-10%,rgba(157,255,52,0.26),transparent_34%),linear-gradient(135deg,#1b2f86_0%,#2c256d_30%,#0b3320_68%,#193e0f_100%)]">
      <header className="relative overflow-hidden border-b border-white/15 bg-[#12236c]/80">
        <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:linear-gradient(120deg,rgba(255,255,255,0.10)_0,rgba(255,255,255,0)_32%),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:100%_100%,92px_92px,92px_92px]" />

        <div className="relative mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-3 py-2 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/25 bg-white text-[#17206b] shadow-[0_0_0_2px_rgba(157,255,52,0.32)]">
              <Trophy className="h-4 w-4" />
            </span>
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d5ff3f]">Mundial 2026</p>
              <h1 className="truncate text-lg font-black uppercase leading-none text-white sm:text-2xl">Quiniela live</h1>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs font-black uppercase tracking-wide text-white/60 sm:flex">
            <span>{savedCount} guardados</span>
            <span className="h-1 w-1 rounded-full bg-[#d5ff3f]" />
            <span>{lockedCount} cerrados</span>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-20 border-b border-white/15 bg-[#090915]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-1.5 px-2 py-1.5 min-[760px]:flex-row min-[760px]:items-center min-[760px]:justify-between sm:px-5">
          <div className="grid grid-cols-3 gap-1.5 sm:flex sm:min-w-0">
            {VIEW_OPTIONS.map((option) => {
              const active = viewMode === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setViewMode(option.id);
                    if (option.id !== "next") {
                      setShowPicksModal(false);
                      setShowBetsModal(false);
                    }
                  }}
                  className={cn(
                    "inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-md border px-2 text-center text-xs font-black uppercase tracking-wide transition sm:px-3",
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

          <div className="flex min-w-0 flex-col gap-1.5 min-[1100px]:flex-row min-[1100px]:items-center">
            {viewMode === "next" && modalMatch && (
              <MatchMenuActions
                pickCount={modalPickCount}
                onOpenPicks={() => setShowPicksModal(true)}
                onOpenBets={() => setShowBetsModal(true)}
              />
            )}

            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-1.5 sm:flex sm:items-center">
              <button
                type="button"
                onClick={openPlayerPicker}
                className="flex h-9 max-w-full min-w-0 items-center justify-center gap-1.5 rounded-md border border-white/20 bg-black/45 px-2.5 transition hover:border-[#62ffe6] hover:bg-black/65 sm:px-3"
              >
                <UserRound className="h-4 w-4 shrink-0 text-[#62ffe6]" />
                <span
                  className={cn(
                    "max-w-[38vw] truncate text-sm font-black sm:max-w-44",
                    playerName ? "text-white" : "text-white/60"
                  )}
                >
                  {playerName || "Jugador"}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#d5ff3f]" />
              </button>
              <button
                type="button"
                onClick={() => void saveDirtyDrafts()}
                disabled={isSavingBulk || !dirtyDrafts.length}
                className="relative inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-md border border-[#d5ff3f] bg-[#9dff34] px-3 text-xs font-black text-[#06121c] transition hover:border-white hover:bg-[#d5ff3f] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/35"
              >
                {isSavingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span className="truncate">Guardar{dirtyDrafts.length > 0 ? ` (${dirtyDrafts.length})` : ""}</span>
              </button>
              <button
                type="button"
                onClick={() => void loadQuiniela()}
                disabled={isLoading}
                aria-label="Sincronizar quiniela"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/70 transition hover:border-[#62ffe6] hover:text-white disabled:opacity-40 sm:w-auto sm:px-3"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-1.5 hidden text-xs font-black sm:inline">Sync</span>
              </button>
              {normalizeKey(playerName) === "ALLAN" && (
                <Link
                  href="/mundial/admin"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-500/50 bg-red-900/30 text-red-400 transition hover:border-red-400 hover:bg-red-900/50 hover:text-red-300 sm:w-auto sm:px-3 sm:gap-1.5"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden text-xs font-black sm:inline">Admin</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

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
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#62ffe6]" />
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

      {showPicksModal && modalMatch && (
        <MundialModal title="Picks de amigos" onClose={() => setShowPicksModal(false)}>
          <OtherPicksPanel
            match={modalMatch}
            predictions={predictions}
            playerName={playerName}
            showEmpty
          />
        </MundialModal>
      )}

      {showBetsModal && modalMatch && (
        <MundialModal title="Apuestas del partido" onClose={() => setShowBetsModal(false)}>
          <StatBetsPanel matchId={modalMatch.id} playerName={playerName} />
        </MundialModal>
      )}

      {showPlayerPicker && (
        <PlayerPickerModal
          players={players}
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

function MundialModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-2 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-[#62ffe6]/45 bg-[#071018] shadow-[0_24px_90px_rgba(0,0,0,0.85)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/15 bg-[#3151ff] px-4 py-3">
          <p className="min-w-0 truncate text-sm font-black uppercase tracking-[0.18em] text-white">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/20 bg-black/20 text-white/75 transition hover:border-[#d5ff3f] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">{children}</div>
      </div>
    </div>
  );
}
