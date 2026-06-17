"use client";

import { useMemo, useState } from "react";
import { Check, CircleAlert, Loader2 } from "lucide-react";
import type { MundialMatch } from "./types";
import { useMundial } from "./useMundial";
import { MineView } from "./components/MineView";
import { NextView } from "./components/NextView";
import { PlayersView } from "./components/PlayersView";
import { PlayerPickerModal } from "./components/PlayerPickerModal";
import { PinModal } from "./components/PinModal";
import { MundialHeader } from "./components/MundialHeader";

import { PenalitosPanel } from "./components/PenalitosPanel";
import { ProximoEnAnotarPanel } from "./components/ProximoEnAnotarPanel";
import { LiveMatchChat } from "./components/LiveMatchChat";

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
      
      <MundialHeader
        playerName={playerName}
        dirtyDrafts={dirtyDrafts}
        isSavingBulk={isSavingBulk}
        viewMode={viewMode}
        setViewMode={setViewMode}
        loadQuiniela={loadQuiniela}
        isLoading={isLoading}
        saveDirtyDrafts={saveDirtyDrafts}
        openPlayerPicker={openPlayerPicker}
      />

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

            {viewMode === "players" && (
              <PlayersView leaderboard={leaderboard} matches={matches} predictions={predictions} />
            )}

            {/* ====================== LIVE PANELS ========================== */}
            {liveMatch && (
              <>
                <PenalitosPanel liveMatch={liveMatch} playerName={playerName} />
                <ProximoEnAnotarPanel liveMatch={liveMatch} playerName={playerName} />
                <LiveMatchChat
                  liveMatch={liveMatch}
                  playerName={playerName}
                  onOpenPlayerPicker={openPlayerPicker}
                />
              </>
            )}
            {/* ============================================================= */}
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
