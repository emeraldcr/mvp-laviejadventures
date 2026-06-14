import { Trophy } from "lucide-react";
import type { Draft, MundialMatch, Prediction } from "../types";
import { emptyDraft } from "../utils";
import { FeaturedMatch } from "./FeaturedMatch";
import { MatchCard } from "./MatchCard";
import { OtherPicksPanel } from "./OtherPicksPanel";
import { QueuePanel } from "./QueuePanel";
import { StatBetsPanel } from "./StatBetsPanel";

type NextViewProps = {
  activeMatch: MundialMatch | null;
  drafts: Record<string, Draft>;
  savingId: string | null;
  isSavingBulk: boolean;
  activeMatchId: string | null;
  todayEditableMatches: MundialMatch[];
  todayEditableMatchIds: Set<string>;
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
  todayEditableMatches,
  todayEditableMatchIds,
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
  const otherTodayMatches = todayEditableMatches.filter((m) => m.id !== activeMatch?.id);

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,430px)] xl:items-start">
      <div className="grid min-w-0 content-start gap-5">
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
            {otherTodayMatches.length > 0 && (
              <section className="min-w-0">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#8ca58f]">
                  También hoy
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {otherTodayMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      draft={drafts[match.id] ?? emptyDraft()}
                      savingId={savingId}
                      isSavingBulk={isSavingBulk}
                      todayEditableMatchIds={todayEditableMatchIds}
                      nowMs={nowMs}
                      onUpdateDraft={onUpdateDraft}
                      onSave={onSave}
                    />
                  ))}
                </div>
              </section>
            )}
            <OtherPicksPanel
              match={activeMatch}
              predictions={predictions}
              playerName={playerName}
            />
            <StatBetsPanel matchId={activeMatch.id} playerName={playerName} />
          </>
        ) : (
          <section className="grid min-h-96 place-items-center rounded-lg border border-dashed border-[#2b3d2b] bg-[#0b130d] p-8 text-center">
            <div>
              <Trophy className="mx-auto h-14 w-14 text-amber-300" />
              <h2 className="mt-5 text-3xl font-black text-white">Quiniela completa</h2>
              <p className="mt-3 text-lg font-bold text-[#a9c7ad]">
                Has predicho todos los partidos del Mundial.
              </p>
              <p className="mt-2 text-base font-bold text-[#8ca58f]">
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
