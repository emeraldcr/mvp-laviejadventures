import { Trophy, Users, X, Zap } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Draft, MundialMatch, Prediction } from "../types";
import { emptyDraft } from "../utils";
import { FeaturedMatch } from "./FeaturedMatch";
import { OtherPicksPanel } from "./OtherPicksPanel";
import { QueuePanel } from "./QueuePanel";
import { StatBetsPanel } from "./StatBetsPanel";

type NextViewProps = {
  activeMatch: MundialMatch | null;
  liveMatch: MundialMatch | null;
  matches: MundialMatch[];
  drafts: Record<string, Draft>;
  savingId: string | null;
  isSavingBulk: boolean;
  activeMatchId: string | null;
  nowMs: number;
  activeCountdown: string;
  playerName: string;
  predictions: Prediction[];
  onUpdateDraft: (matchId: string, patch: Partial<Draft>) => void;
  onSave: (match: MundialMatch) => Promise<void>;
};

export function NextView({
  activeMatch,
  liveMatch,
  matches,
  drafts,
  savingId,
  isSavingBulk,
  activeMatchId,
  nowMs,
  activeCountdown,
  playerName,
  predictions,
  onUpdateDraft,
  onSave,
}: NextViewProps) {
  const [selectedInfoMatchId, setSelectedInfoMatchId] = useState<string | null>(null);
  const [featuredMatchId, setFeaturedMatchId] = useState<string | null>(null);
  const [showPicksModal, setShowPicksModal] = useState(false);
  const [showBetsModal, setShowBetsModal] = useState(false);
  const featuredRef = useRef<HTMLDivElement>(null);

  const selectedInfoMatch = useMemo(
    () => matches.find((match) => match.id === selectedInfoMatchId) ?? liveMatch ?? activeMatch ?? matches[0] ?? null,
    [activeMatch, liveMatch, matches, selectedInfoMatchId]
  );

  const featuredMatch = useMemo(() => {
    if (featuredMatchId) return matches.find((m) => m.id === featuredMatchId) ?? activeMatch;
    return liveMatch ?? activeMatch;
  }, [activeMatch, liveMatch, matches, featuredMatchId]);

  function handleSelectMatch(match: MundialMatch) {
    setSelectedInfoMatchId(match.id);
    setFeaturedMatchId(match.id);
    setShowPicksModal(false);
    setShowBetsModal(false);
    setTimeout(() => {
      featuredRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  const modalMatch = featuredMatch ?? selectedInfoMatch;
  const modalPickCount = modalMatch ? predictions.filter((p) => p.matchId === modalMatch.id).length : 0;

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] xl:items-start">
      <div className="grid min-w-0 content-start gap-5">
        {featuredMatch ? (
          <>
            <div ref={featuredRef} className="scroll-mt-20">
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
            </div>

            <MatchActionBar
              pickCount={modalPickCount}
              onOpenPicks={() => setShowPicksModal(true)}
              onOpenBets={() => setShowBetsModal(true)}
            />
          </>
        ) : (
          <>
            <section className="grid min-h-96 place-items-center rounded-lg border border-dashed border-white/20 bg-black/35 p-8 text-center">
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

            {selectedInfoMatch && (
              <MatchActionBar
                pickCount={modalPickCount}
                onOpenPicks={() => setShowPicksModal(true)}
                onOpenBets={() => setShowBetsModal(true)}
              />
            )}
          </>
        )}
      </div>
      <QueuePanel
        matches={matches}
        nowMs={nowMs}
        activeMatchId={activeMatchId}
        selectedMatchId={selectedInfoMatch?.id ?? null}
        onSelectMatch={handleSelectMatch}
      />

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
    </div>
  );
}

function MatchActionBar({
  pickCount,
  onOpenPicks,
  onOpenBets,
}: {
  pickCount: number;
  onOpenPicks: () => void;
  onOpenBets: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-white/15 bg-black/35 p-2 sm:flex-row sm:items-center sm:justify-end">
      <button
        type="button"
        onClick={onOpenPicks}
        className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-md border border-[#62ffe6]/55 bg-[#071d2a] px-3 text-sm font-black text-[#62ffe6] transition hover:border-white hover:text-white"
      >
        <Users className="h-4 w-4 shrink-0" />
        <span className="truncate">Picks amigos</span>
        <span className="rounded bg-black/40 px-1.5 py-0.5 text-xs tabular-nums text-white">{pickCount}</span>
      </button>
      <button
        type="button"
        onClick={onOpenBets}
        className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-md border border-[#d5ff3f]/55 bg-[#1a2206] px-3 text-sm font-black text-[#d5ff3f] transition hover:border-white hover:text-white"
      >
        <Zap className="h-4 w-4 shrink-0" />
        <span className="truncate">Apuestas</span>
      </button>
    </div>
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
