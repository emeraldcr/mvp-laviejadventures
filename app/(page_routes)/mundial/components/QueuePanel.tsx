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
      className="min-w-0 overflow-hidden rounded-xl border border-[#1a2e1a] bg-[#080f08]"
    >
      {/* Header */}
      <div className="border-b border-[#1a2e1a] px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex flex-col items-stretch gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#3a5a3a]">Cola de partidos</p>
            <h2 className="mt-0.5 text-xl font-black text-white">Próximos</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 min-[420px]:flex">
            <div className="min-w-0 rounded-lg border border-[#1a2e1a] bg-[#0c160c] px-2 py-2 text-center sm:px-3">
              <p className="text-[10px] font-black text-[#3a5a3a] uppercase tracking-wider">Cerrados</p>
              <p className="text-lg font-black tabular-nums text-[#6aab6a]">{closedMatchCount}</p>
            </div>
            <div className="min-w-0 rounded-lg border border-green-800/40 bg-green-950/30 px-2 py-2 text-center sm:px-3">
              <p className="text-[10px] font-black text-green-600 uppercase tracking-wider">En cola</p>
              <p className="text-lg font-black tabular-nums text-green-400">{openMatchCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {slideMatches.length ? (
          <div className="-mx-3 overflow-x-auto px-3 pb-2 sm:-mx-4 sm:px-4">
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
            <p className="mt-2 break-words text-sm font-black text-[#d4f0d4]">
              #{latestClosed.number} — {latestClosed.homeTeam} vs {latestClosed.awayTeam}
            </p>
            <p className="mt-1 text-sm font-bold text-[#6aab6a]">{finalScoreText(latestClosed)}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
