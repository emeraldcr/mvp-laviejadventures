"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Check, ChevronRight, CircleAlert, ClipboardList, Gamepad2, GitBranch, Loader2, Sparkles, Target, Users, X } from "lucide-react";
import type { Draft, LiveMatchStatus, MundialMatch, Prediction } from "./types";
import { formatKickoff, normalizeKey, predictionResult, teamCode } from "./utils";
import { useMundial } from "./useMundial";
import { useLiveMatch } from "./useLiveMatch";
import { MineView } from "./components/MineView";
import { NextView } from "./components/NextView";
import { PlayersView } from "./components/PlayersView";
import { PlayerPickerModal } from "./components/PlayerPickerModal";
import { PinModal } from "./components/PinModal";
import { MundialHeader } from "./components/MundialHeader";
import { ProfileModal } from "./components/ProfileModal";
import { PenalitosPanel } from "./components/PenalitosPanel";
import { ProximoEnAnotarPanel } from "./components/ProximoEnAnotarPanel";
import { LiveMatchChat } from "./components/LiveMatchChat";
import { BracketView } from "./components/BracketView";
import { Flag } from "./components/Flag";

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

  const playerKey = normalizeKey(playerName);

  // Load avatar whenever the active player changes; show banner for players without one
  useEffect(() => {
    if (!playerKey) {
      queueMicrotask(() => {
        setProfileAvatar(null);
        setShowProfileBanner(false);
      });
      return;
    }
    fetch(`/api/mundial/profile?name=${encodeURIComponent(playerKey)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: { avatarDataUrl?: string | null } | null) => {
        const avatar = data?.avatarDataUrl ?? null;
        queueMicrotask(() => {
          setProfileAvatar(avatar);
          if (!avatar) {
            const key = `mundial-profile-banner-${playerKey}`;
            const dismissed = Boolean(localStorage.getItem(key));
            setShowProfileBanner(!dismissed);
          } else {
            setShowProfileBanner(false);
          }
        });
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
  const commandMatch = activeLiveMatch ?? (viewMode === "next" ? featuredMatch : null);

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

  function handleGoToBracket(match: MundialMatch) {
    setSelectedInfoMatchId(match.id);
    setFeaturedMatchId(match.id);
    setViewMode("bracket");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07110b] text-white [background-image:linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(135deg,#06100b_0%,#0b2216_45%,#14351d_74%,#07110b_100%)] [background-size:96px_96px,96px_96px,100%_100%]">

      <MundialHeader
        playerName={playerName}
        avatarDataUrl={profileAvatar}
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

      <section className="mx-auto w-full max-w-[1600px] px-2.5 py-2 min-[380px]:px-3 sm:px-5 sm:py-3">
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
            {commandMatch && (
              <LiveCommandCenter
                match={commandMatch}
                isLive={Boolean(activeLiveMatch && commandMatch.id === activeLiveMatch.id)}
                draft={drafts[commandMatch.id]}
                predictions={predictions}
                playerName={playerName}
                matches={matches}
                onGoToMine={handleGoToMine}
                onGoToBracket={handleGoToBracket}
                onOpenPlayerPicker={openPlayerPicker}
                onOpenPenalitos={() => setLiveModal("penalitos")}
                onOpenScorer={() => setLiveModal("scorer")}
              />
            )}

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

            {viewMode === "bracket" && (
              <BracketView
                matches={matches}
                leaderboard={leaderboard}
                predictions={predictions}
                playerName={playerName}
              />
            )}

            {/* ====================== LIVE SECTION ========================== */}
            {activeLiveMatch && (
              <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,0.82fr)_minmax(360px,0.6fr)]">
                <div className="grid gap-2 rounded-xl border border-[#f0b429]/20 bg-black/30 p-2.5 sm:grid-cols-2 xl:self-start">
                  {/* Penalitos - siempre gratis */}
                  <LiveToolButton
                    icon={<Gamepad2 className="h-5 w-5" />}
                    title="Penalitos"
                    description="Mini-juego en vivo · Gratis"
                    onClick={() => setLiveModal("penalitos")}
                  />
                  <LiveToolButton
                    icon={<Target className="h-5 w-5" />}
                    title="Próximo en anotar"
                    description="Mini apuestas live"
                    onClick={() => setLiveModal("scorer")}
                  />
                </div>

                <div className="min-w-0">
                  <LiveMatchChat
                    liveMatch={activeLiveMatch}
                    playerName={playerName}
                    onOpenPlayerPicker={openPlayerPicker}
                  />
                </div>

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

function LiveCommandCenter({
  match,
  isLive,
  draft,
  predictions,
  playerName,
  matches,
  onGoToMine,
  onGoToBracket,
  onOpenPlayerPicker,
  onOpenPenalitos,
  onOpenScorer,
}: {
  match: MundialMatch;
  isLive: boolean;
  draft?: Draft;
  predictions: Prediction[];
  playerName: string;
  matches: MundialMatch[];
  onGoToMine: (matchId?: string) => void;
  onGoToBracket: (match: MundialMatch) => void;
  onOpenPlayerPicker: () => void;
  onOpenPenalitos: () => void;
  onOpenScorer: () => void;
}) {
  const safeDraft: Draft = draft ?? {
    homeScore: 0,
    awayScore: 0,
    winnerPick: null,
    winnerPickMethod: null,
    locked: false,
    dirty: false,
    saved: false,
    updatedAt: null,
  };
  const matchPredictions = predictions.filter((prediction) => prediction.matchId === match.id);
  const playerPrediction = playerName
    ? matchPredictions.find((prediction) => normalizeKey(prediction.playerName) === normalizeKey(playerName))
    : null;
  const homeLiveScore = match.homeLiveScore ?? match.homeFinalScore ?? 0;
  const awayLiveScore = match.awayLiveScore ?? match.awayFinalScore ?? 0;
  const nextKnockout = getNextKnockoutMatch(match, matches);
  const badgeLabel = isLive ? "Live ahora" : "Pick abierto";
  const matchLine = isLive ? match.liveNote : "Marcador, ganador y bracket del partido en un solo lugar.";

  return (
    <section className="mb-3 overflow-hidden rounded-xl border border-[#9dff34]/45 bg-[#06140f] shadow-[0_18px_54px_rgba(0,0,0,0.28)]">
      <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.72fr)_minmax(270px,0.55fr)]">
        <div className="border-b border-white/10 p-3 lg:border-b-0 lg:border-r lg:border-white/10">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#9dff34]/35 bg-[#10240b] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#d5ff3f]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#9dff34]" />
              {badgeLabel}
            </span>
            <span className="text-xs font-bold text-white/45">{formatKickoff(match.kickoffAt)}</span>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
            <LiveTeamBlock team={match.homeTeam} align="left" />
            <div className="flex items-center gap-1">
              <LiveScoreBox value={homeLiveScore} />
              <span className="text-lg font-black text-white/25">-</span>
              <LiveScoreBox value={awayLiveScore} />
            </div>
            <LiveTeamBlock team={match.awayTeam} align="right" />
          </div>

          {matchLine && (
            <p className="mt-2 rounded-lg border border-[#9dff34]/18 bg-black/30 px-3 py-2 text-sm font-bold leading-snug text-[#e7ffc0]">
              {matchLine}
            </p>
          )}
        </div>

        <div className="border-b border-white/10 p-3 lg:border-b-0 lg:border-r lg:border-white/10">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#f0b429]">
              <ClipboardList className="h-3.5 w-3.5" />
              Tu pick
            </p>
            <span className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-black text-white/45">
              {playerPrediction ? "Guardado" : "Sin pick"}
            </span>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="flex items-center gap-1">
              <span className="text-4xl font-black tabular-nums text-white">{safeDraft.homeScore}</span>
              <span className="text-xl font-black text-white/20">-</span>
              <span className="text-4xl font-black tabular-nums text-white">{safeDraft.awayScore}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white/85">{predictionResult(match, safeDraft)}</p>
              <p className="mt-1 text-xs font-bold text-white/42">{matchPredictions.length} picks visibles en este juego</p>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => playerName ? onGoToMine(match.id) : onOpenPlayerPicker()}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#d5ff3f]/40 bg-[#d5ff3f] px-3 text-xs font-black uppercase text-[#06110b] transition hover:bg-[#efff9a]"
            >
              <ClipboardList className="h-4 w-4" />
              {playerName ? "Editar pick" : "Jugador"}
            </button>
            <button
              type="button"
              onClick={() => onGoToMine(match.id)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 text-xs font-black uppercase text-white/70 transition hover:border-[#f0b429]/45 hover:text-white"
            >
              <Users className="h-4 w-4 text-[#f0b429]" />
              Mis picks
            </button>
          </div>
        </div>

        <div className="p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#62ffe6]">
              <GitBranch className="h-3.5 w-3.5" />
              Bracket
            </p>
            <button
              type="button"
              onClick={() => onGoToBracket(match)}
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-white/45 transition hover:text-white"
            >
              Abrir <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs font-black uppercase tracking-wide text-white/40">
              {match.group ? `Grupo ${match.group}` : match.stageLabel}
            </p>
            <p className="mt-1 truncate text-sm font-black text-white">
              #{match.number} · {match.homeTeam} vs {match.awayTeam}
            </p>
            <p className="mt-1 text-xs font-bold leading-snug text-white/45">
              {nextKnockout
                ? `El ganador alimenta ${nextKnockout.stageLabel} #${nextKnockout.number}.`
                : "Revisa el camino completo y los cruces definidos."}
            </p>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenPenalitos}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#f0b429]/30 bg-[#1a2206] px-3 text-xs font-black uppercase text-[#f0b429] transition hover:bg-[#2a2b09]"
            >
              <Gamepad2 className="h-4 w-4" />
              Penalitos
            </button>
            <button
              type="button"
              onClick={onOpenScorer}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#9dff34]/30 bg-[#10240b] px-3 text-xs font-black uppercase text-[#d5ff3f] transition hover:bg-[#16351d]"
            >
              <Target className="h-4 w-4" />
              Anotador
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveScoreBox({ value }: { value: number }) {
  return (
    <span className="grid h-14 w-14 place-items-center rounded-xl border border-[#9dff34]/45 bg-[#0c2409] text-5xl font-black leading-none text-[#9dff34] sm:h-16 sm:w-16">
      {value}
    </span>
  );
}

function LiveTeamBlock({ team, align }: { team: string; align: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${align === "right" ? "justify-end text-right" : ""}`}>
      {align === "left" && <Flag team={team} size="sm" className="shrink-0 rounded-sm" />}
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">{teamCode(team)}</p>
        <p className="truncate text-sm font-black text-white sm:text-base">{team}</p>
      </div>
      {align === "right" && <Flag team={team} size="sm" className="shrink-0 rounded-sm" />}
    </div>
  );
}

function getNextKnockoutMatch(match: MundialMatch, matches: MundialMatch[]) {
  if (match.stage === "group") return null;
  const winnerSeed = `W${match.number}`;
  return matches
    .filter((candidate) => candidate.homeSeed === winnerSeed || candidate.awaySeed === winnerSeed)
    .sort((a, b) => a.number - b.number)[0] ?? null;
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
