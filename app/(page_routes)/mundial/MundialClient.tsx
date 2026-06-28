"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Check, CircleAlert, Crown, Gamepad2, Lock, Loader2, Sparkles, Star, Target, X } from "lucide-react";
import type { LiveMatchStatus, MundialMatch } from "./types";
import { normalizeKey } from "./utils";
import { useMundial } from "./useMundial";
import { useLiveMatch } from "./useLiveMatch";
import { MineView } from "./components/MineView";
import { NextView } from "./components/NextView";
import { PlayersView } from "./components/PlayersView";
import { GroupsView } from "./components/GroupsView";
import { PlayerPickerModal } from "./components/PlayerPickerModal";
import { PinModal } from "./components/PinModal";
import { MundialHeader } from "./components/MundialHeader";
import { ProfileModal } from "./components/ProfileModal";

import { PenalitosPanel } from "./components/PenalitosPanel";
import { ProximoEnAnotarPanel } from "./components/ProximoEnAnotarPanel";
import { LiveMatchChat } from "./components/LiveMatchChat";
import { XLivePanel } from "./components/XLivePanel";
import { PronosticosView } from "./components/PronosticosView";
import { MUNDIAL_PREMIUM_PRICE_USD } from "./constants";

export default function MundialClient() {
  const router = useRouter();
  const {
    playerName,
    isBanned,
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

  // Redirect banned players to the suspended account page
  useEffect(() => {
    if (isBanned) router.replace("/mundial/banned");
  }, [isBanned, router]);

  // SSE: receives live match updates pushed to all clients simultaneously
  const { data: liveSSE } = useLiveMatch();

  const [selectedInfoMatchId, setSelectedInfoMatchId] = useState<string | null>(null);
  const [featuredMatchId, setFeaturedMatchId] = useState<string | null>(null);
  const [focusedMineMatchId, setFocusedMineMatchId] = useState<string | null>(null);
  const [liveModal, setLiveModal] = useState<"penalitos" | "scorer" | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileIsFirstTime, setProfileIsFirstTime] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [showProfileBanner, setShowProfileBanner] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);

  const playerKey = normalizeKey(playerName);

  // Check premium status whenever the player changes
  useEffect(() => {
    if (!playerKey) { setHasPremium(false); return; }
    fetch(`/api/mundial/premium/check?name=${encodeURIComponent(playerKey)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d: { hasPremium: boolean } | null) => setHasPremium(Boolean(d?.hasPremium)))
      .catch(() => setHasPremium(false));
  }, [playerKey]);

  // Load avatar whenever the active player changes; show banner for players without one
  useEffect(() => {
    if (!playerKey) { setProfileAvatar(null); setShowProfileBanner(false); return; }
    fetch(`/api/mundial/profile?name=${encodeURIComponent(playerKey)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: { avatarDataUrl?: string | null } | null) => {
        const avatar = data?.avatarDataUrl ?? null;
        setProfileAvatar(avatar);
        if (!avatar) {
          const key = `mundial-profile-banner-${playerKey}`;
          const dismissed = Boolean(localStorage.getItem(key));
          setShowProfileBanner(!dismissed);
        } else {
          setShowProfileBanner(false);
        }
      })
      .catch(() => {});
  }, [playerKey]);

  function dismissProfileBanner() {
    setShowProfileBanner(false);
    if (playerKey) localStorage.setItem(`mundial-profile-banner-${playerKey}`, "1");
  }

  function handlePinSuccess() {
    const isNew = pinMode === "set";
    onPinSuccess();
    if (isNew) {
      setProfileIsFirstTime(true);
      setShowProfile(true);
    }
  }

  // Merge SSE live fields onto the polled liveMatch so all clients see updates
  // at the same instant. Falls back to polling data when SSE has nothing new.
  const effectiveLiveMatch = useMemo<MundialMatch | null>(() => {
    const sseHasMatch = Boolean(liveSSE.matchId);
    // If SSE says there's a live match, find it in the matches array
    // (works even if polling hasn't refreshed the liveStatus yet)
    const base = liveMatch ?? (
      sseHasMatch
        ? (matches.find((m) => m.id === liveSSE.matchId) ?? null)
        : null
    );

    if (!base) return null;

    // Only overlay SSE data when the matchId matches
    if (liveSSE.matchId !== base.id) return base;

    const isFulltime = liveSSE.liveStatus === "fulltime";

    return {
      ...base,
      liveStatus: liveSSE.liveStatus as LiveMatchStatus,
      homeLiveScore: liveSSE.homeLiveScore,
      awayLiveScore: liveSSE.awayLiveScore,
      homeFinalScore: isFulltime && liveSSE.homeLiveScore !== null ? liveSSE.homeLiveScore : base.homeFinalScore,
      awayFinalScore: isFulltime && liveSSE.awayLiveScore !== null ? liveSSE.awayLiveScore : base.awayFinalScore,
      closed: isFulltime ? true : base.closed,
      liveMinute: liveSSE.liveMinute,
      liveMinuteUpdatedAt: liveSSE.liveMinuteUpdatedAt,
      liveNote: liveSSE.liveNote,
      liveEvents: liveSSE.liveEvents,
      liveStats: liveSSE.liveStats,
      liveUpdatedAt: liveSSE.liveUpdatedAt,
    };
  }, [liveMatch, liveSSE, matches]);

  const activeLiveMatch =
    effectiveLiveMatch?.liveStatus === "live" || effectiveLiveMatch?.liveStatus === "halftime"
      ? effectiveLiveMatch
      : null;

  const mostRecentMatch = useMemo(
    () => effectiveLiveMatch ?? recentClosedMatches[0] ?? activeMatch ?? matches[0] ?? null,
    [activeMatch, effectiveLiveMatch, matches, recentClosedMatches]
  );

  // Upgrade the explicitly selected match with SSE live data if it's the live one
  const explicitSelectedMatch = useMemo(() => {
    const m = matches.find((match) => match.id === selectedInfoMatchId) ?? null;
    if (!m || !effectiveLiveMatch || m.id !== effectiveLiveMatch.id) return m;
    return effectiveLiveMatch;
  }, [matches, selectedInfoMatchId, effectiveLiveMatch]);

  // Upgrade the featured match with SSE live data if it's the live one
  const featuredMatch = useMemo(() => {
    if (featuredMatchId) {
      const m = matches.find((match) => match.id === featuredMatchId) ?? activeMatch;
      if (m && effectiveLiveMatch && m?.id === effectiveLiveMatch.id) return effectiveLiveMatch;
      return m;
    }
    return effectiveLiveMatch ?? activeMatch;
  }, [activeMatch, featuredMatchId, effectiveLiveMatch, matches]);

  const selectedInfoMatch = explicitSelectedMatch ?? featuredMatch ?? mostRecentMatch;

  function handlePickPlayer(name: string) {
    selectPlayer(name);
  }

  function handleSelectMatch(match: MundialMatch) {
    setSelectedInfoMatchId(match.id);
    setFeaturedMatchId(match.id);
  }

  function handleGoToMine(matchId?: string) {
    setFocusedMineMatchId(matchId ?? null);
    setViewMode("mine");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07110b] text-white [background-image:linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(135deg,#06100b_0%,#0b2216_45%,#14351d_74%,#07110b_100%)] [background-size:96px_96px,96px_96px,100%_100%]">

      <MundialHeader
        playerName={playerName}
        avatarDataUrl={profileAvatar}
        hasPremium={hasPremium}
        dirtyDrafts={dirtyDrafts}
        isSavingBulk={isSavingBulk}
        viewMode={viewMode}
        setViewMode={setViewMode}
        loadQuiniela={loadQuiniela}
        isLoading={isLoading}
        saveDirtyDrafts={saveDirtyDrafts}
        openPlayerPicker={openPlayerPicker}
        openProfile={() => setShowProfile(true)}
      />

      <section className="mx-auto w-full max-w-[1600px] px-2.5 py-3 min-[380px]:px-3 sm:px-5 sm:py-4">
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
                activeMatchId={activeMatchId}
                nowMs={nowMs}
                activeCountdown={activeCountdown}
                playerName={playerName}
                todayEditableMatchIds={todayEditableMatchIds}
                onGoToMine={handleGoToMine}
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
                focusMatchId={focusedMineMatchId}
                onUpdateDraft={updateDraft}
                onSave={saveMatch}
              />
            )}

            {viewMode === "players" && (
              <PlayersView
                leaderboard={leaderboard}
                matches={matches}
                predictions={predictions}
                playerName={playerName}
                onOpenProfile={() => setShowProfile(true)}
              />
            )}

            {viewMode === "groups" && (
              <GroupsView matches={matches} />
            )}

            {viewMode === "pronosticos" && (
              <PronosticosView
                playerName={playerName}
                onOpenPlayerPicker={openPlayerPicker}
                matches={matches}
              />
            )}

            {/* Premium teaser — shown on all other views */}
            {viewMode !== "pronosticos" && !isLoading && (
              <PremiumTeaser onGoToPremium={() => setViewMode("pronosticos")} />
            )}

            {/* ====================== LIVE SECTION ========================== */}
            {activeLiveMatch && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-2 rounded-xl border border-[#f0b429]/20 bg-black/30 p-2.5 min-[380px]:gap-3 min-[380px]:p-3 sm:grid-cols-2">
                  {/* Penalitos — siempre gratis */}
                  <LiveToolButton
                    icon={<Gamepad2 className="h-5 w-5" />}
                    title="Penalitos"
                    description="Mini-juego en vivo · Gratis"
                    onClick={() => setLiveModal("penalitos")}
                  />
                  {/* Próximo en anotar — solo premium */}
                  {hasPremium ? (
                    <LiveToolButton
                      icon={<Target className="h-5 w-5" />}
                      title="Próximo en anotar"
                      description="Mini apuestas live"
                      onClick={() => setLiveModal("scorer")}
                    />
                  ) : (
                    <LiveToolButtonLocked
                      icon={<Target className="h-5 w-5" />}
                      title="Próximo en anotar"
                      description="Solo para Premium"
                      onUnlock={() => setViewMode("pronosticos")}
                    />
                  )}
                </div>

                {/* Chat — solo premium */}
                {hasPremium ? (
                  <LiveMatchChat
                    liveMatch={activeLiveMatch}
                    playerName={playerName}
                    onOpenPlayerPicker={openPlayerPicker}
                  />
                ) : (
                  <LiveChatPremiumGate onUnlock={() => setViewMode("pronosticos")} />
                )}

                <XLivePanel liveMatch={activeLiveMatch} />
              </div>
            )}
            {!activeLiveMatch && mostRecentMatch?.closed && (
              <div className="mt-6">
                <XLivePanel liveMatch={mostRecentMatch} />
              </div>
            )}
            {/* ============================================================= */}
          </>
        )}
      </section>

      {activeLiveMatch && liveModal === "penalitos" && (
        <LiveToolModal title="Penalitos" onClose={() => setLiveModal(null)}>
          <PenalitosPanel liveMatch={activeLiveMatch} playerName={playerName} />
        </LiveToolModal>
      )}

      {activeLiveMatch && liveModal === "scorer" && (
        <LiveToolModal title="Próximo en anotar" onClose={() => setLiveModal(null)}>
          <ProximoEnAnotarPanel liveMatch={activeLiveMatch} playerName={playerName} embedded />
        </LiveToolModal>
      )}

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
          onSuccess={handlePinSuccess}
          onChangePlayer={openPlayerPicker}
        />
      )}

      <ProfileModal
        playerName={playerName}
        open={showProfile}
        hasPremium={hasPremium}
        isFirstTime={profileIsFirstTime}
        onClose={() => { setShowProfile(false); setProfileIsFirstTime(false); }}
        onSaved={({ avatarDataUrl }) => {
          setProfileAvatar(avatarDataUrl);
          if (avatarDataUrl) setShowProfileBanner(false);
        }}
      />

      {/* Profile setup banner for existing players without an avatar */}
      {showProfileBanner && playerName && !showProfile && (
        <div className="fixed inset-x-2 bottom-3 z-40 flex items-center gap-2 rounded-2xl border border-[#f0b429]/40 bg-[#080f0b]/95 px-3 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md sm:inset-x-auto sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:gap-3 sm:px-4">
          <Sparkles className="h-4 w-4 shrink-0 text-[#f0b429]" />
          <p className="min-w-0 flex-1 text-sm font-bold leading-snug text-white/80">
            ¡Personalizá tu avatar de jugador!
          </p>
          <button
            type="button"
            onClick={() => { dismissProfileBanner(); setShowProfile(true); }}
            className="shrink-0 rounded-lg border border-[#f0b429]/50 bg-[#f0b429] px-3 py-1.5 text-xs font-black text-[#07110b] transition hover:bg-[#f5c842]"
          >
            Ver
          </button>
          <button
            type="button"
            onClick={dismissProfileBanner}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-white/30 transition hover:text-white/70 sm:h-6 sm:w-6"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </main>
  );
}

function PremiumTeaser({ onGoToPremium }: { onGoToPremium: () => void }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-[#f0b429]/25 bg-[#06100b] shadow-[0_0_40px_rgba(240,180,41,0.08)]">
      <div className="relative flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center sm:p-5 [background:radial-gradient(ellipse_at_right,rgba(240,180,41,0.1),transparent_55%)]">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#f0b429]/35 bg-[#f0b429]/10">
          <Crown className="h-6 w-6 text-[#f0b429]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full border border-[#f0b429]/30 bg-[#f0b429]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#f0b429]">
              Premium
            </span>
          </div>
          <p className="font-black text-white">Pronósticos de Eliminación Directa</p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/45">
            Predecí Octavos, Cuartos, Semis, 3er Lugar y la Gran Final. Acceso único por <span className="font-bold text-white/70">${MUNDIAL_PREMIUM_PRICE_USD} USD</span>.
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToPremium}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#f0b429]/50 bg-[#f0b429] px-4 py-2.5 text-sm font-black text-[#07110b] transition hover:bg-[#f5c842] hover:shadow-[0_0_16px_rgba(240,180,41,0.4)]"
        >
          <Lock className="h-3.5 w-3.5" />
          Desbloquear
        </button>
      </div>
    </div>
  );
}

function LiveToolButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 items-center gap-3 rounded-lg border border-white/12 bg-[#06140f] px-3 py-3 text-left transition hover:border-[#f0b429]/45 hover:bg-[#10240b] sm:px-4"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#f0b429]/35 bg-[#1a2206] text-[#f0b429]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block min-w-0 break-words text-sm font-black uppercase leading-tight text-white sm:truncate">{title}</span>
        <span className="mt-0.5 block min-w-0 break-words text-xs font-bold leading-snug text-white/45 sm:truncate">{description}</span>
      </span>
    </button>
  );
}

function LiveToolButtonLocked({
  icon,
  title,
  description,
  onUnlock,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onUnlock: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onUnlock}
      className="group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-lg border border-[#f0b429]/20 bg-[#06140f] px-3 py-3 text-left transition hover:border-[#f0b429]/40 sm:px-4"
    >
      {/* dim overlay */}
      <span className="pointer-events-none absolute inset-0 bg-black/40" />
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/30">
        {icon}
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="block min-w-0 break-words text-sm font-black uppercase leading-tight text-white/40 sm:truncate">{title}</span>
          <Lock className="h-3 w-3 shrink-0 text-white/30" />
        </span>
        <span className="mt-0.5 block min-w-0 break-words text-xs font-bold leading-snug text-white/25 sm:truncate">{description}</span>
      </span>
      <span className="relative hidden shrink-0 items-center gap-1 rounded-lg border border-[#f0b429]/40 bg-[#f0b429]/10 px-2.5 py-1.5 text-[10px] font-black text-[#f0b429] transition group-hover:bg-[#f0b429]/20 min-[380px]:flex">
        <Crown className="h-3 w-3" /> Premium
      </span>
    </button>
  );
}

function LiveChatPremiumGate({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#f0b429]/20 bg-[#0b0d14]">
      {/* blurred fake chat rows */}
      <div className="pointer-events-none select-none space-y-3 p-5 blur-[3px] opacity-40">
        {["🔥 Qué golazo!", "Ese defensa estuvo muy lento", "VAR lo va a anular 😬", "Vamos, quedan 10 min!"].map((msg, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-white/10" />
            <div className="min-w-0 flex-1">
              <div className="mb-1 h-2.5 w-16 rounded bg-white/10" />
              <div className="rounded-xl rounded-tl-none bg-white/8 px-3 py-2 text-xs text-white/60">{msg}</div>
            </div>
          </div>
        ))}
      </div>

      {/* overlay gate */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-[#0b0d14] via-[#0b0d14]/90 to-transparent p-6 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[#f0b429]/35 bg-[#f0b429]/10 shadow-[0_0_28px_rgba(240,180,41,0.2)]">
          <Crown className="h-7 w-7 text-[#f0b429]" />
        </div>
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[#f0b429]/30 bg-[#f0b429]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#f0b429]">
            <Star className="h-2.5 w-2.5" /> Solo Premium
          </div>
          <p className="mt-2 text-base font-black text-white">Chat en vivo · Exclusivo</p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-white/45">
            El chat durante el partido es una función exclusiva de los jugadores premium. Charlá con todos en tiempo real.
          </p>
        </div>
        <button
          type="button"
          onClick={onUnlock}
          className="inline-flex items-center gap-2 rounded-xl border border-[#f0b429]/50 bg-[#f0b429] px-5 py-2.5 text-sm font-black text-[#07110b] transition hover:bg-[#f5c842] hover:shadow-[0_0_20px_rgba(240,180,41,0.4)]"
        >
          <Lock className="h-3.5 w-3.5" /> Desbloquear por $5 USD
        </button>
      </div>
    </div>
  );
}

function LiveToolModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-2 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[#f0b429]/35 bg-[#06140f] shadow-[0_24px_90px_rgba(0,0,0,0.85)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/12 bg-[#12351f] px-4 py-3 [background-image:linear-gradient(135deg,rgba(240,180,41,0.18),transparent_58%)]">
          <p className="truncate font-black text-white">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/20 bg-black/20 text-white/75 transition hover:border-[#d5ff3f] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
