import { Trophy } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Draft, MundialMatch, Prediction } from "../types";
import { emptyDraft } from "../utils";
import { FeaturedMatch } from "./FeaturedMatch";
import { OtherPicksPanel } from "./OtherPicksPanel";
import { QueuePanel } from "./QueuePanel";
import { StatBetsPanel } from "./StatBetsPanel";

type NextViewProps = {
  activeMatch: MundialMatch | null;
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
  const featuredRef = useRef<HTMLDivElement>(null);

  const selectedInfoMatch = useMemo(
    () => matches.find((match) => match.id === selectedInfoMatchId) ?? activeMatch ?? matches[0] ?? null,
    [activeMatch, matches, selectedInfoMatchId]
  );

  const featuredMatch = useMemo(() => {
    if (featuredMatchId) return matches.find((m) => m.id === featuredMatchId) ?? activeMatch;
    return activeMatch;
  }, [activeMatch, matches, featuredMatchId]);

  function handleSelectMatch(match: MundialMatch) {
    setSelectedInfoMatchId(match.id);
    setFeaturedMatchId(match.id);
    setTimeout(() => {
      featuredRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

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

            <StatBetsPanel matchId={featuredMatch.id} playerName={playerName} />

            {selectedInfoMatch && (
              <OtherPicksPanel
                match={selectedInfoMatch}
                predictions={predictions}
                playerName={playerName}
                showEmpty
              />
            )}
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
              <>
                <StatBetsPanel matchId={selectedInfoMatch.id} playerName={playerName} />
                <OtherPicksPanel
                  match={selectedInfoMatch}
                  predictions={predictions}
                  playerName={playerName}
                  showEmpty
                />
              </>
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
    </div>
  );
}
