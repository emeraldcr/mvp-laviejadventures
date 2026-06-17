import { ClipboardList, ChevronRight, Trophy, Users, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Draft, MundialMatch, Prediction } from "../types";
import { emptyDraft } from "../utils";
import { FeaturedMatch } from "./FeaturedMatch";
import { MatchSelector } from "./MatchSelector";
import { OtherPicksPanel } from "./OtherPicksPanel";
import { StatBetsPanel } from "./StatBetsPanel";

type NextViewProps = {
  activeMatch: MundialMatch | null;
  selectedInfoMatch: MundialMatch | null;
  featuredMatch: MundialMatch | null;
  matches: MundialMatch[];
  predictions: Prediction[];
  drafts: Record<string, Draft>;
  activeMatchId: string | null;
  nowMs: number;
  activeCountdown: string;
  playerName: string;
  onGoToMine: () => void;
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
  activeMatchId,
  nowMs,
  activeCountdown,
  playerName,
  onGoToMine,
  onSelectMatch,
  onOpenPlayerPicker,
}: NextViewProps) {
  const detailRef = useRef<HTMLDivElement>(null);
  const [showPicksModal, setShowPicksModal] = useState(false);
  const [showFinalBetsModal, setShowFinalBetsModal] = useState(false);

  const featuredMatchPicksCount = useMemo(
    () => (featuredMatch ? predictions.filter((p) => p.matchId === featuredMatch.id).length : 0),
    [predictions, featuredMatch]
  );

  useEffect(() => {
    setShowPicksModal(false);
    setShowFinalBetsModal(false);
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
              nowMs={nowMs}
              activeCountdown={featuredMatch.id === activeMatch?.id ? activeCountdown : undefined}
              playerName={playerName}
              onGoToMine={onGoToMine}
              onOpenPlayerPicker={onOpenPlayerPicker}
            />

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

              <button
                type="button"
                onClick={() => setShowFinalBetsModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#f0b429]/35 bg-[#0b1e10] px-4 py-3 text-sm font-black text-white transition hover:border-[#f0b429]/60 hover:bg-[#12351f]"
              >
                <ClipboardList className="h-4 w-4 text-[#f0b429]" />
                <span>Apuestas al final</span>
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
          {showFinalBetsModal && (
            <FinalBetsModal
              match={featuredMatch}
              playerName={playerName}
              onOpenPlayerPicker={onOpenPlayerPicker}
              onClose={() => setShowFinalBetsModal(false)}
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

function FinalBetsModal({
  match,
  playerName,
  onOpenPlayerPicker,
  onClose,
}: {
  match: MundialMatch;
  playerName: string;
  onOpenPlayerPicker: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-2 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#f0b429]/35 bg-[#06140f] shadow-[0_24px_90px_rgba(0,0,0,0.85)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/12 bg-[#12351f] px-4 py-3 [background-image:linear-gradient(135deg,rgba(240,180,41,0.18),transparent_58%)]">
          <div className="flex min-w-0 items-center gap-2">
            <ClipboardList className="h-4 w-4 shrink-0 text-[#f0b429]" />
            <p className="font-black text-white">Apuestas al final</p>
            <span className="truncate text-xs text-white/50">{match.homeTeam} vs {match.awayTeam}</span>
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
          <StatBetsPanel
            matchId={match.id}
            playerName={playerName}
            matchLabel={`${match.homeTeam} vs ${match.awayTeam}`}
            variant="full"
            questionScope="final"
            onOpenPlayerPicker={onOpenPlayerPicker}
          />
        </div>
      </div>
    </div>
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
