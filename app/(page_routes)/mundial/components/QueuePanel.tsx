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
    <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Cola de partidos</p>
            <h2 className="mt-0.5 text-xl font-black text-slate-950">Próximos</h2>
          </div>
          <div className="flex gap-2">
            <div className="rounded-lg bg-slate-100 px-3 py-2 text-center">
              <p className="text-xs font-black text-slate-500">Cerrados</p>
              <p className="text-lg font-black tabular-nums text-slate-700">{closedMatchCount}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center">
              <p className="text-xs font-black text-emerald-600">En cola</p>
              <p className="text-lg font-black tabular-nums text-emerald-700">{openMatchCount}</p>
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
          <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
            <div>
              <p className="text-3xl">⚽</p>
              <p className="mt-2 text-sm font-black text-slate-600">No quedan partidos abiertos.</p>
            </div>
          </div>
        )}

        {latestClosed && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Último cerrado</p>
            <p className="mt-2 text-sm font-black text-slate-900">
              #{latestClosed.number} — {latestClosed.homeTeam} vs {latestClosed.awayTeam}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-600">{finalScoreText(latestClosed)}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
