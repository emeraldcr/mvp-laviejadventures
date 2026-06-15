"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2, Plus, Users, X } from "lucide-react";
import type { AdminMatch, AdminStatQuestion, BetOptionAnalytics } from "../adminTypes";
import { cn } from "../../utils";

type Props = {
  matches: AdminMatch[];
  statQuestions: AdminStatQuestion[];
  onCreateQuestion: (matchId: string, text: string, options: string[]) => Promise<void>;
  onResolveQuestion: (id: string, correctOptionId: string | null) => Promise<void>;
};

// ── Option analytics bar ────────────────────────────────────────────────────

function OptionBar({
  opt,
  isCorrect,
  totalBets,
}: {
  opt: BetOptionAnalytics;
  isCorrect: boolean;
  totalBets: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasPlayers = opt.players.length > 0;

  return (
    <div className={cn(
      "overflow-hidden rounded-lg border transition-all",
      isCorrect
        ? "border-emerald-300 bg-emerald-50"
        : totalBets > 0 && opt.count === 0
          ? "border-slate-100 bg-slate-50 opacity-60"
          : "border-slate-200 bg-white"
    )}>
      <div className="px-3 py-2.5">
        {/* label + count */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {isCorrect && (
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500">
                <Check className="h-2.5 w-2.5 text-white" />
              </span>
            )}
            <span className={cn(
              "text-sm font-black",
              isCorrect ? "text-emerald-800" : "text-slate-800"
            )}>
              {opt.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-xs font-black tabular-nums",
              isCorrect ? "text-emerald-600" : "text-slate-500"
            )}>
              {opt.pct}%
            </span>
            <span className={cn(
              "rounded-md px-1.5 py-0.5 text-xs font-black tabular-nums",
              isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
            )}>
              {opt.count}
            </span>
          </div>
        </div>

        {/* bar */}
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isCorrect ? "bg-emerald-500" : "bg-slate-400"
            )}
            style={{ width: `${opt.pct}%` }}
          />
        </div>

        {/* player chips */}
        {hasPlayers && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-black text-slate-400 transition hover:text-slate-600"
            >
              <Users className="h-3 w-3" />
              {opt.players.length} jugador{opt.players.length !== 1 ? "es" : ""}
              <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
            </button>
            {expanded && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {opt.players.map((name) => (
                  <span
                    key={name}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[11px] font-black",
                      isCorrect
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Question card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  resolvingId,
  onResolve,
}: {
  question: AdminStatQuestion;
  resolvingId: string | null;
  onResolve: (id: string, optionId: string | null) => void;
}) {
  const isResolving = resolvingId === question.id;
  const correctLabel = question.options.find((o) => o.id === question.correctOptionId)?.label;

  return (
    <div className={cn(
      "overflow-hidden rounded-xl border shadow-sm",
      question.resolved ? "border-emerald-200" : "border-slate-200 bg-white"
    )}>
      {/* header */}
      <div className={cn(
        "flex items-start justify-between gap-3 px-4 py-3",
        question.resolved ? "bg-emerald-50" : "bg-white"
      )}>
        <div className="min-w-0">
          <p className={cn(
            "font-black leading-snug",
            question.resolved ? "text-emerald-900" : "text-slate-950"
          )}>
            {question.text}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">
              {question.pointValue} pt{question.pointValue !== 1 ? "s" : ""}
            </span>
            {question.totalBets > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                <Users className="h-3 w-3" />
                {question.totalBets} apuesta{question.totalBets !== 1 ? "s" : ""}
              </span>
            )}
            {question.resolved && (
              <>
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-black text-emerald-700">
                  ✓ {correctLabel}
                </span>
                <button
                  type="button"
                  disabled={isResolving}
                  onClick={() => onResolve(question.id, null)}
                  className="text-[11px] font-black text-slate-400 underline transition hover:text-red-600 disabled:opacity-40"
                >
                  Quitar respuesta
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* analytics + resolve */}
      <div className="border-t border-slate-100 px-4 py-3">
        {question.totalBets === 0 ? (
          <p className="text-xs font-bold text-slate-400">Sin apuestas todavía.</p>
        ) : (
          <div className="mb-3 grid gap-2">
            {question.betsByOption.map((opt) => (
              <OptionBar
                key={opt.optionId}
                opt={opt}
                isCorrect={question.correctOptionId === opt.optionId}
                totalBets={question.totalBets}
              />
            ))}
          </div>
        )}

        {/* resolve buttons */}
        {!question.resolved && (
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
              Marcar respuesta correcta
            </p>
            <div className="flex flex-wrap gap-2">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isResolving}
                  onClick={() => onResolve(question.id, opt.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-40"
                >
                  {isResolving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function StatQuestionsManager({ matches, statQuestions, onCreateQuestion, onResolveQuestion }: Props) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    () => {
      // Default to first match that has questions, else first closed match, else first match
      const withQuestions = matches.find((m) => statQuestions.some((q) => q.matchId === m.id));
      return withQuestions?.id ?? matches.find((m) => m.closed)?.id ?? matches[0]?.id ?? "";
    }
  );
  const [newText, setNewText] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);
  const matchQuestions = statQuestions.filter((q) => q.matchId === selectedMatchId);

  const totalBetsForMatch = matchQuestions.reduce((sum, q) => sum + q.totalBets, 0);
  const resolvedCount = matchQuestions.filter((q) => q.resolved).length;

  async function handleCreate() {
    const text = newText.trim();
    const opts = newOptions.map((o) => o.trim()).filter(Boolean);
    if (text.length < 3) { setFormError("La pregunta debe tener al menos 3 caracteres."); return; }
    if (opts.length < 2) { setFormError("Necesitas al menos 2 opciones."); return; }
    setFormError("");
    setIsCreating(true);
    try {
      await onCreateQuestion(selectedMatchId, text, opts);
      setNewText("");
      setNewOptions(["", ""]);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error creando pregunta.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleResolve(questionId: string, optionId: string | null) {
    setResolvingId(questionId);
    try { await onResolveQuestion(questionId, optionId); }
    finally { setResolvingId(null); }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* ── Match selector ── */}
      <aside className="grid content-start gap-2">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Partido</p>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {matches.map((match) => {
            const count = statQuestions.filter((q) => q.matchId === match.id).length;
            const bets = statQuestions
              .filter((q) => q.matchId === match.id)
              .reduce((s, q) => s + q.totalBets, 0);
            const isSelected = selectedMatchId === match.id;
            return (
              <button
                key={match.id}
                type="button"
                onClick={() => setSelectedMatchId(match.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-0",
                  isSelected ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    #{match.number} · {match.group ? `Grupo ${match.group}` : match.stageLabel}
                  </p>
                  <p className="truncate text-sm font-black">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  {count > 0 && (
                    <span className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-black tabular-nums",
                      isSelected ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
                    )}>
                      {count}q
                    </span>
                  )}
                  {bets > 0 && (
                    <span className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-black tabular-nums",
                      isSelected ? "bg-white/10 text-white/60" : "bg-slate-50 text-slate-400"
                    )}>
                      {bets}b
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Questions panel ── */}
      <div className="grid content-start gap-4">
        {selectedMatch && (
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-purple-600">Stats & Apuestas</p>
              <h2 className="text-xl font-black text-slate-950">
                #{selectedMatch.number} {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
              </h2>
              {matchQuestions.length > 0 && (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                  <span>{matchQuestions.length} pregunta{matchQuestions.length !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{totalBetsForMatch} apuesta{totalBetsForMatch !== 1 ? "s" : ""} totales</span>
                  {resolvedCount > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-600">{resolvedCount} resuelta{resolvedCount !== 1 ? "s" : ""}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-700 bg-purple-700 px-3 py-2 text-sm font-black text-white transition hover:bg-purple-800"
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Cancelar" : "Nueva pregunta"}
            </button>
          </div>
        )}

        {/* create form */}
        {showForm && (
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <p className="mb-3 text-sm font-black text-purple-800">Nueva pregunta</p>
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="¿Ambos equipos anotan?"
              className="mb-3 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-950 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
            />
            <div className="mb-3 grid gap-2">
              {newOptions.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...newOptions];
                      next[i] = e.target.value;
                      setNewOptions(next);
                    }}
                    placeholder={`Opción ${i + 1}`}
                    className="h-9 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-950 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
                  />
                  {newOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setNewOptions(newOptions.filter((_, j) => j !== i))}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {newOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setNewOptions([...newOptions, ""])}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 text-sm font-bold text-slate-500 hover:border-slate-400 hover:text-slate-700"
                >
                  <Plus className="h-3 w-3" />
                  Agregar opción
                </button>
              )}
            </div>
            {formError && <p className="mb-3 text-xs font-bold text-red-700">{formError}</p>}
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={isCreating}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-700 bg-purple-700 px-4 py-2 text-sm font-black text-white transition hover:bg-purple-800 disabled:opacity-50"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Crear pregunta
            </button>
          </div>
        )}

        {/* questions list */}
        {!matchQuestions.length ? (
          <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
            <div>
              <p className="text-2xl">🎰</p>
              <p className="mt-2 text-sm font-black text-slate-600">No hay preguntas para este partido.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {matchQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                resolvingId={resolvingId}
                onResolve={(id, optId) => void handleResolve(id, optId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
