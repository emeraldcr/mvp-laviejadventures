import { ListChecks, Lock, Target } from "lucide-react";
import type { ReactNode } from "react";
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
  todayEditableMatchIds: Set<string>;
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
  todayEditableMatchIds,
  nowMs,
  onUpdateDraft,
  onSave,
}: MineViewProps) {
  const pct = Math.round((savedCount / TOTAL_MATCHES) * 100);

  return (
    <section className="grid gap-4">
      <div className="relative overflow-hidden rounded-xl border border-[#f0b429]/30 bg-[#06140f] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(90deg,rgba(240,180,41,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="relative border-b border-white/12 bg-black/35 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#f0b429]/40 bg-[#f0b429] text-[#07110b] shadow-[0_0_18px_rgba(240,180,41,0.22)]">
                <ListChecks className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d5ff3f]">Mi quiniela</p>
                <h2 className="mt-1 text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
                  {savedCount}
                  <span className="text-white/35">/{TOTAL_MATCHES}</span>
                  <span className="ml-3 text-xl font-black text-white/75 sm:text-2xl">guardados</span>
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-bold text-white/62">
                  Prioriza los partidos abiertos y guarda cualquier cambio antes del cierre.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:min-w-[440px] lg:gap-3">
              <StatPlate label="Guardados" value={savedCount} tone="lime" icon={<Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} />
              <StatPlate label="Cerrados" value={lockedCount} tone="orange" icon={<Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} />
              <StatPlate label="Progreso" value={`${pct}%`} tone="cyan" />
            </div>
          </div>
        </div>

        <div className="relative px-4 py-4 sm:px-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Avance total</p>
            <span className="rounded-md border border-white/15 bg-black/35 px-2 py-1 text-xs font-black tabular-nums text-[#d5ff3f]">
              {pct}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border border-white/15 bg-black/45">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#f0b429] via-[#d5ff3f] to-[#9dff34] transition-all shadow-[0_0_16px_rgba(213,255,63,0.55)]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {mineMatches.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mineMatches.map((match) => (
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
      ) : (
        <div className="grid min-h-56 place-items-center rounded-xl border border-dashed border-[#f0b429]/30 bg-black/35 p-6 text-center sm:p-8">
          <div>
            <ListChecks className="mx-auto h-12 w-12 text-[#f0b429]" />
            <p className="mt-4 text-xl font-black text-white">Todavia no hay picks guardados</p>
            <p className="mt-2 text-base font-bold text-white/60">Ve a Ahora para empezar a predecir.</p>
          </div>
        </div>
      )}
    </section>
  );
}

function StatPlate({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number | string;
  tone: "lime" | "orange" | "cyan";
  icon?: ReactNode;
}) {
  const color =
    tone === "lime"
      ? "border-[#d5ff3f]/35 bg-black/35 text-[#d5ff3f]"
      : tone === "orange"
        ? "border-[#ffb15f]/35 bg-[#2a120b]/65 text-[#ffb15f]"
        : "border-[#62ffe6]/35 bg-[#071d2a]/65 text-[#62ffe6]";

  return (
    <div className={`rounded-lg border px-3 py-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.14)] sm:px-4 sm:py-3 ${color}`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-wider text-white/70 sm:text-[11px]">{label}</p>
      </div>
      <p className="mt-1.5 text-2xl font-black tabular-nums text-current sm:mt-2 sm:text-3xl">{value}</p>
    </div>
  );
}
