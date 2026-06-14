import { Clock3, ListChecks, Lock } from "lucide-react";
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
    <aside className="min-w-0 overflow-hidden rounded-lg border border-[#263b27] bg-[#0b130d]">
      <div className="border-b border-[#263b27] bg-[#101911] px-4 py-4">
        <div className="flex flex-col items-stretch gap-4 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-cyan-200" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Cola de partidos</p>
            </div>
            <h2 className="text-2xl font-black text-white">Lo que viene</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 min-[520px]:flex">
            <div className="min-w-0 rounded-lg border border-amber-700/50 bg-amber-950/20 px-3 py-2 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-300" />
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-300">Cerrados</p>
              </div>
              <p className="mt-1 text-2xl font-black tabular-nums text-white">{closedMatchCount}</p>
            </div>
            <div className="min-w-0 rounded-lg border border-cyan-800/50 bg-cyan-950/20 px-3 py-2 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5 text-cyan-200" />
                <p className="text-[11px] font-black uppercase tracking-wider text-cyan-200">Abiertos</p>
              </div>
              <p className="mt-1 text-2xl font-black tabular-nums text-white">{openMatchCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {slideMatches.length ? (
          <div className="-mx-4 overflow-x-auto px-4 pb-2">
            <div className="flex snap-x snap-mandatory gap-3">
              {slideMatches.map((match) => (
                <SlideCard key={match.id} match={match} nowMs={nowMs} activeMatchId={activeMatchId} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-[#2b3d2b] bg-[#101711] p-5 text-center">
            <div>
              <ListChecks className="mx-auto h-10 w-10 text-[#8ca58f]" />
              <p className="mt-3 text-base font-black text-white">No quedan partidos abiertos.</p>
            </div>
          </div>
        )}

        {latestClosed && (
          <div className="mt-4 rounded-lg border border-[#263b27] bg-[#101711] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8ca58f]">Ultimo cerrado</p>
            <p className="mt-3 break-words text-base font-black text-white">
              #{latestClosed.number} - {latestClosed.homeTeam} vs {latestClosed.awayTeam}
            </p>
            <p className="mt-2 text-base font-black text-emerald-200">{finalScoreText(latestClosed)}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
