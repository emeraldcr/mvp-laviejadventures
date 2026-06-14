import type { Draft, MundialMatch, Prediction } from "../types";
import { emptyDraft } from "../utils";
import { FeaturedMatch } from "./FeaturedMatch";
import { OtherPicksPanel } from "./OtherPicksPanel";
import { QueuePanel } from "./QueuePanel";
import { StatBetsPanel } from "./StatBetsPanel";

type NextViewProps = {
  activeMatch: MundialMatch | null;
  drafts: Record<string, Draft>;
  savingId: string | null;
  isSavingBulk: boolean;
  activeMatchId: string | null;
  nowMs: number;
  activeCountdown: string;
  slideMatches: MundialMatch[];
  recentClosedMatches: MundialMatch[];
  closedMatchCount: number;
  openMatchCount: number;
  playerName: string;
  predictions: Prediction[];
  onUpdateDraft: (matchId: string, patch: Partial<Draft>) => void;
  onSave: (match: MundialMatch) => Promise<void>;
};

export function NextView({
  activeMatch,
  drafts,
  savingId,
  isSavingBulk,
  activeMatchId,
  nowMs,
  activeCountdown,
  slideMatches,
  recentClosedMatches,
  closedMatchCount,
  openMatchCount,
  playerName,
  predictions,
  onUpdateDraft,
  onSave,
}: NextViewProps) {
  return (
    <div className="grid min-w-0 gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] xl:items-start">
      <div className="grid min-w-0 content-start gap-3 sm:gap-4">
        {activeMatch ? (
          <>
            <FeaturedMatch
              match={activeMatch}
              draft={drafts[activeMatch.id] ?? emptyDraft()}
              savingId={savingId}
              isSavingBulk={isSavingBulk}
              nowMs={nowMs}
              activeCountdown={activeCountdown}
              onUpdateDraft={onUpdateDraft}
              onSave={onSave}
            />
            <OtherPicksPanel
              match={activeMatch}
              predictions={predictions}
              playerName={playerName}
            />
            <StatBetsPanel matchId={activeMatch.id} playerName={playerName} />
          </>
        ) : (
          <section className="grid min-h-80 place-items-center rounded-xl border border-dashed border-[#1a2e1a] bg-[#080f08] p-5 text-center sm:min-h-96 sm:p-8">
            <div>
              <p className="text-6xl">🏆</p>
              <h2 className="mt-4 text-2xl font-black text-white">¡Quiniela completa!</h2>
              <p className="mt-2 text-base font-bold text-[#4a6e4a]">
                Has predicho todos los partidos del Mundial.
              </p>
              <p className="mt-1 text-sm font-bold text-[#3a5a3a]">
                Ahora solo queda esperar los resultados.
              </p>
            </div>
          </section>
        )}
      </div>
      <QueuePanel
        slideMatches={slideMatches}
        recentClosedMatches={recentClosedMatches}
        closedMatchCount={closedMatchCount}
        openMatchCount={openMatchCount}
        nowMs={nowMs}
        activeMatchId={activeMatchId}
      />
    </div>
  );
}
