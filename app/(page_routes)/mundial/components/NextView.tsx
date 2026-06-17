import { Activity, ChevronRight, Trophy, Users, X, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Draft, MundialMatch, Prediction } from "../types";
import { emptyDraft, isMatchLive } from "../utils";
import { FeaturedMatch } from "./FeaturedMatch";
import { MatchSelector } from "./MatchSelector";
import { OtherPicksPanel } from "./OtherPicksPanel";
import { ProximoEnAnotarPanel } from "./ProximoEnAnotarPanel";
import { StatBetsPanel } from "./StatBetsPanel";

type NextViewProps = {
  activeMatch: MundialMatch | null;
  selectedInfoMatch: MundialMatch | null;
  featuredMatch: MundialMatch | null;
  matches: MundialMatch[];
  predictions: Prediction[];
  drafts: Record<string, Draft>;
  savingId: string | null;
  isSavingBulk: boolean;
  activeMatchId: string | null;
  nowMs: number;
  activeCountdown: string;
  playerName: string;
  onUpdateDraft: (matchId: string, patch: Partial<Draft>) => void;
  onSave: (match: MundialMatch) => Promise<void>;
  onSelectMatch: (match: MundialMatch) => void;
  onOpenPlayerPicker: () => void;
};

export function NextView({
  activeMatch,
  selectedInfoMatch,
  featuredMatch,
  matches,
  predictions,
  drafts,
  savingId,
  isSavingBulk,
  activeMatchId,
  nowMs,
  activeCountdown,
  playerName,
  onUpdateDraft,
  onSave,
  onSelectMatch,
  onOpenPlayerPicker,
}: NextViewProps) {
  const detailRef = useRef<HTMLDivElement>(null);
  const [showPicksModal, setShowPicksModal] = useState(false);

  const featuredMatchPicksCount = useMemo(
    () => (featuredMatch ? predictions.filter((p) => p.matchId === featuredMatch.id).length : 0),
    [predictions, featuredMatch]
  );
  const featuredMatchIsLive = Boolean(featuredMatch && isMatchLive(featuredMatch));

  useEffect(() => {
    setShowPicksModal(false);
  }, [featuredMatch?.id]);

  function handleSelectMatch(match: MundialMatch) {
    onSelectMatch(match);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div className="grid min-w-0 gap-4">
      {/* 1. Match selector — primary interaction, full width */}
      <MatchSelector
        matches={matches}
        nowMs={nowMs}
        activeMatchId={activeMatchId}
        selectedMatchId={selectedInfoMatch?.id ?? null}
        onSelectMatch={handleSelectMatch}
      />

      {/* 2. Selected match detail */}
      {featuredMatch ? (
        <>
          <div ref={detailRef} className="grid min-w-0 scroll-mt-20 gap-4">
            <FeaturedMatch
              match={featuredMatch}
              draft={drafts[featuredMatch.id] ?? emptyDraft()}
              savingId={savingId}
              isSavingBulk={isSavingBulk}
              nowMs={nowMs}
              activeCountdown={featuredMatch.id === activeMatch?.id ? activeCountdown : undefined}
              onUpdateDraft={onUpdateDraft}
              onSave={onSave}
            />

            {featuredMatchIsLive && (
              <LiveQuickBetsSection
                match={featuredMatch}
                playerName={playerName}
                onOpenPlayerPicker={onOpenPlayerPicker}
              />
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowPicksModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#f0b429]/35 bg-[#0b1e10] px-4 py-3 text-sm font-black text-white transition hover:border-[#f0b429]/60 hover:bg-[#12351f]"
              >
                <Users className="h-4 w-4 text-[#f0b429]" />
                <span>Picks de amigos</span>
                {featuredMatchPicksCount > 0 && (
                  <span className="rounded-md border border-white/20 bg-black/35 px-2 py-0.5 text-xs font-black tabular-nums text-white/70">
                    {featuredMatchPicksCount}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-white/40" />
              </button>
            </div>
          </div>

          {showPicksModal && (
            <PicksModal
              match={featuredMatch}
              predictions={predictions}
              playerName={playerName}
              onClose={() => setShowPicksModal(false)}
            />
          )}
        </>
      ) : (
        <section className="grid min-h-72 place-items-center rounded-lg border border-dashed border-white/20 bg-black/35 p-8 text-center">
          <div>
            <Trophy className="mx-auto h-14 w-14 text-[#d5ff3f]" />
            <h2 className="mt-5 text-3xl font-black text-white">Quiniela completa</h2>
            <p className="mt-3 text-lg font-bold text-white/70">
              Has predicho todos los partidos del Mundial.
            </p>
            <p className="mt-2 text-base font-bold text-white/60">
              Ahora solo queda esperar los resultados.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function LiveQuickBetsSection({
  match,
  playerName,
  onOpenPlayerPicker,
}: {
  match: MundialMatch;
  playerName: string;
  onOpenPlayerPicker: () => void;
}) {
  const matchLabel = `${match.homeTeam} vs ${match.awayTeam}`;

  return (
    <section className="overflow-hidden rounded-xl border border-[#d5ff3f]/25 bg-[#06140f] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
      <div className="border-b border-white/10 bg-[#10240b] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#9dff34] text-[#06110b] shadow-[0_0_18px_rgba(157,255,52,0.24)]">
              <Activity className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d5ff3f]">Live picks</p>
              <h3 className="truncate text-2xl font-black uppercase text-white">Preguntas rapidas</h3>
              <p className="mt-1 text-sm font-bold text-white/55">
                Gol, VAR, tarjetas y rondas cortas con puntos entre amigos.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#d5ff3f]/25 bg-black/30 px-3 py-2 text-xs font-black text-[#d5ff3f]">
            <Zap className="h-3.5 w-3.5" />
            Todo suma
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <StatBetsPanel
          matchId={match.id}
          playerName={playerName}
          matchLabel={matchLabel}
          variant="mini"
          onOpenPlayerPicker={onOpenPlayerPicker}
        />
        <ProximoEnAnotarPanel liveMatch={match} playerName={playerName} embedded />
      </div>
    </section>
  );
}

function PicksModal({
  match,
  predictions,
  playerName,
  onClose,
}: {
  match: MundialMatch;
  predictions: Prediction[];
  playerName: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-2 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#f0b429]/35 bg-[#06140f] shadow-[0_24px_90px_rgba(0,0,0,0.85)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/12 bg-[#12351f] px-4 py-3 [background-image:linear-gradient(135deg,rgba(240,180,41,0.18),transparent_58%)]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#f0b429]" />
            <p className="font-black text-white">Picks de amigos</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/20 bg-black/20 text-white/75 transition hover:border-[#d5ff3f] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <OtherPicksPanel match={match} predictions={predictions} playerName={playerName} showEmpty />
        </div>
      </div>
    </div>
  );
}
