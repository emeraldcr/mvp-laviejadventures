import type { MundialMatch } from "../types";
import { finalScoreText } from "../utils";
import { SlideCard } from "./SlideCard";

type QueuePanelProps = {
  slideMatches: MundialMatch[];
  recentClosedMatches: MundialMatch[];
  closedMatchCount: number;
  openMatchCount: number;
  nowMs: number;
  activeMatchId: string | null;
};

export function QueuePanel({
  slideMatches,
  recentClosedMatches,
  closedMatchCount,
  openMatchCount,
  nowMs,
  activeMatchId,
}: QueuePanelProps) {
  const latestClosed = recentClosedMatches[0] ?? null;

  return (
    <aside
      className="rounded-xl border border-[#1a2e1a] bg-[#080f08]"
    >
      {/* Header */}
      <div className="border-b border-[#1a2e1a] px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#3a5a3a]">Cola de partidos</p>
            <h2 className="mt-0.5 text-xl font-black text-white">Próximos</h2>
          </div>
          <div className="flex gap-2">
            <div className="rounded-lg border border-[#1a2e1a] bg-[#0c160c] px-3 py-2 text-center">
              <p className="text-[10px] font-black text-[#3a5a3a] uppercase tracking-wider">Cerrados</p>
              <p className="text-lg font-black tabular-nums text-[#6aab6a]">{closedMatchCount}</p>
            </div>
            <div className="rounded-lg border border-green-800/40 bg-green-950/30 px-3 py-2 text-center">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-wider">En cola</p>
              <p className="text-lg font-black tabular-nums text-green-400">{openMatchCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {slideMatches.length ? (
          <div className="overflow-x-auto pb-2">
            <div className="flex snap-x snap-mandatory gap-3">
              {slideMatches.map((match) => (
                <SlideCard key={match.id} match={match} nowMs={nowMs} activeMatchId={activeMatchId} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-[#1a2e1a] bg-[#0c160c] p-4 text-center">
            <div>
              <p className="text-3xl">⚽</p>
              <p className="mt-2 text-sm font-black text-[#3a5a3a]">No quedan partidos abiertos.</p>
            </div>
          </div>
        )}

        {latestClosed && (
          <div className="mt-4 rounded-xl border border-[#1a2e1a] bg-[#0c160c] p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#3a5a3a]">Último cerrado</p>
            <p className="mt-2 text-sm font-black text-[#d4f0d4]">
              #{latestClosed.number} — {latestClosed.homeTeam} vs {latestClosed.awayTeam}
            </p>
            <p className="mt-1 text-sm font-bold text-[#6aab6a]">{finalScoreText(latestClosed)}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
