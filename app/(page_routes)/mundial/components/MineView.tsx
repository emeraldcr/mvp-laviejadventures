import { TOTAL_MATCHES } from "../constants";
import type { Draft, MundialMatch } from "../types";
import { emptyDraft } from "../utils";
import { MatchCard } from "./MatchCard";

type MineViewProps = {
  savedCount: number;
  lockedCount: number;
  mineMatches: MundialMatch[];
  drafts: Record<string, Draft>;
  savingId: string | null;
  isSavingBulk: boolean;
  activeMatchId: string | null;
  nowMs: number;
  onUpdateDraft: (matchId: string, patch: Partial<Draft>) => void;
  onSave: (match: MundialMatch) => Promise<void>;
};

export function MineView({
  savedCount,
  lockedCount,
  mineMatches,
  drafts,
  savingId,
  isSavingBulk,
  activeMatchId,
  nowMs,
  onUpdateDraft,
  onSave,
}: MineViewProps) {
  const pct = Math.round((savedCount / TOTAL_MATCHES) * 100);

  return (
    <section>
      {/* Header */}
      <div
        className="mb-4 overflow-hidden rounded-xl border border-[#1e3a1e] p-4 sm:mb-5 sm:p-5"
        style={{
          background: "linear-gradient(135deg, #080f08 0%, #0a1a0a 60%, #0c2010 100%)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#3a5a3a]">Mi quiniela</p>
            <h2 className="mt-1 text-xl font-black text-white sm:text-3xl">
              {savedCount}
              <span className="text-[#2a4020]">/{TOTAL_MATCHES}</span>
              <span className="ml-2 text-base font-bold text-[#4a6e4a] sm:ml-3 sm:text-xl">guardados</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
            <div
              className="min-w-0 rounded-xl border border-green-800/40 bg-green-950/30 px-3 py-2 text-center sm:px-4 sm:py-3"
              style={{ boxShadow: "0 0 12px rgba(34,197,94,0.06)" }}
            >
              <p className="text-[10px] font-black uppercase tracking-wider text-green-600">Cerrados</p>
              <p className="mt-0.5 text-xl font-black tabular-nums text-green-400 sm:mt-1 sm:text-2xl">{lockedCount}</p>
            </div>
            <div className="min-w-0 rounded-xl border border-[#1e3a1e] bg-[#0c160c] px-3 py-2 text-center sm:px-4 sm:py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#3a5a3a]">Progreso</p>
              <p className="mt-0.5 text-xl font-black tabular-nums text-amber-400 sm:mt-1 sm:text-2xl">{pct}%</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#0c160c] border border-[#1a2e1a]">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{
              width: `${pct}%`,
              boxShadow: pct > 0 ? "0 0 8px rgba(34,197,94,0.5)" : undefined,
            }}
          />
        </div>
      </div>

      {mineMatches.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {mineMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              draft={drafts[match.id] ?? emptyDraft()}
              savingId={savingId}
              isSavingBulk={isSavingBulk}
              activeMatchId={activeMatchId}
              nowMs={nowMs}
              onUpdateDraft={onUpdateDraft}
              onSave={onSave}
            />
          ))}
        </div>
      ) : (
        <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-[#1a2e1a] bg-[#080f08] p-5 text-center sm:p-8">
          <div>
            <p className="text-4xl">📋</p>
            <p className="mt-3 text-base font-black text-[#6aab6a]">Todavía no hay picks guardados</p>
            <p className="mt-1 text-sm font-bold text-[#3a5a3a]">Ve a "Ahora" para empezar a predecir.</p>
          </div>
        </div>
      )}
    </section>
  );
}
