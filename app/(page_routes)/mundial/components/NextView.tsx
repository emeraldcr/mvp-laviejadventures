import { Trophy } from "lucide-react";
import { useRef } from "react";
import type { Draft, MundialMatch, Prediction } from "../types";
import { emptyDraft } from "../utils";
import { FeaturedMatch } from "./FeaturedMatch";
import { MatchSelector } from "./MatchSelector";

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

  function handleSelectMatch(match: MundialMatch) {
    onSelectMatch(match);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div className="grid min-w-0 gap-4">
      {/* Match selector */}
      <MatchSelector
        matches={matches}
        nowMs={nowMs}
        activeMatchId={activeMatchId}
        selectedMatchId={selectedInfoMatch?.id ?? null}
        onSelectMatch={handleSelectMatch}
      />

      {/* Selected match detail */}
      {featuredMatch ? (
        <div ref={detailRef} className="grid min-w-0 scroll-mt-20 gap-4">
          <FeaturedMatch
            match={featuredMatch}
            draft={drafts[featuredMatch.id] ?? emptyDraft()}
            predictions={predictions}
            nowMs={nowMs}
            activeCountdown={featuredMatch.id === activeMatch?.id ? activeCountdown : undefined}
            playerName={playerName}
            onGoToMine={onGoToMine}
            onOpenPlayerPicker={onOpenPlayerPicker}
          />
        </div>
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
