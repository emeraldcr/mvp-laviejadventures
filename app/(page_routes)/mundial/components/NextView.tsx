import { Trophy } from "lucide-react";
import { useRef } from "react";
import type { Draft, MundialMatch } from "../types";
import { emptyDraft } from "../utils";
import { FeaturedMatch } from "./FeaturedMatch";
import { QueuePanel } from "./QueuePanel";
import { StatBetsPanel } from "./StatBetsPanel";

type NextViewProps = {
  activeMatch: MundialMatch | null;
  selectedInfoMatch: MundialMatch | null;
  featuredMatch: MundialMatch | null;
  matches: MundialMatch[];
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
  const featuredRef = useRef<HTMLDivElement>(null);

  function handleSelectMatch(match: MundialMatch) {
    onSelectMatch(match);
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

            <StatBetsPanel
              matchId={featuredMatch.id}
              playerName={playerName}
              matchLabel={`${featuredMatch.homeTeam} vs ${featuredMatch.awayTeam}`}
              variant="mini"
              onOpenPlayerPicker={onOpenPlayerPicker}
            />
          </>
        ) : (
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
