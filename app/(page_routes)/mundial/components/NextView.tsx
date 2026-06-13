import type { Draft, MundialMatch } from "../types";
import { emptyDraft } from "../utils";
import { FeaturedMatch } from "./FeaturedMatch";
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
  onUpdateDraft,
  onSave,
}: NextViewProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid content-start gap-4">
        {activeMatch ? (
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
        ) : (
          <section className="grid min-h-96 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
            <div>
              <p className="text-6xl">🏆</p>
              <h2 className="mt-4 text-2xl font-black text-slate-950">¡Quiniela completa!</h2>
              <p className="mt-2 text-base font-bold text-slate-500">
                Has predicho todos los partidos del Mundial.
              </p>
              <p className="mt-1 text-sm font-bold text-slate-400">
                Ahora solo queda esperar los resultados.
              </p>
            </div>
          </section>
        )}
        {activeMatch && (
          <StatBetsPanel matchId={activeMatch.id} playerName={playerName} />
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
