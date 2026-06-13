"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2, Plus, X } from "lucide-react";
import type { AdminMatch, AdminStatQuestion } from "../adminTypes";
import { cn } from "../../utils";

type StatQuestionsManagerProps = {
  matches: AdminMatch[];
  statQuestions: AdminStatQuestion[];
  onCreateQuestion: (matchId: string, text: string, options: string[]) => Promise<void>;
  onResolveQuestion: (id: string, correctOptionId: string | null) => Promise<void>;
};

export function StatQuestionsManager({
  matches,
  statQuestions,
  onCreateQuestion,
  onResolveQuestion,
}: StatQuestionsManagerProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    matches.find((m) => m.closed)?.id ?? matches[0]?.id ?? ""
  );
  const [newText, setNewText] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);
  const matchQuestions = statQuestions.filter((q) => q.matchId === selectedMatchId);

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
    try {
      await onResolveQuestion(questionId, optionId);
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      {/* Match selector */}
      <aside className="grid gap-3">
        <p className="text-sm font-black uppercase text-slate-500">Partido</p>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {matches.map((match) => {
            const count = statQuestions.filter((q) => q.matchId === match.id).length;
            return (
              <button
                key={match.id}
                type="button"
                onClick={() => setSelectedMatchId(match.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-0",
                  selectedMatchId === match.id
                    ? "bg-slate-950 text-white"
                    : "hover:bg-slate-50 text-slate-700"
                )}
              >
                <div className="min-w-0">
                  <p className={cn("text-xs font-black", selectedMatchId === match.id ? "text-slate-400" : "text-slate-400")}>
                    #{match.number} · {match.group ? `Grupo ${match.group}` : match.stageLabel}
                  </p>
                  <p className="truncate text-sm font-black">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {count > 0 && (
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-black",
                      selectedMatchId === match.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    )}>
                      {count}
                    </span>
                  )}
                  {selectedMatchId === match.id && <ChevronDown className="h-3 w-3 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Questions panel */}
      <div className="grid gap-4 content-start">
        {selectedMatch && (
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase text-purple-700">Preguntas</p>
              <h2 className="text-xl font-black text-slate-950">
                #{selectedMatch.number} {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
              </h2>
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

        {/* Create form */}
        {showForm && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="mb-3 text-sm font-black text-purple-800">Nueva pregunta para este partido</p>

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

            {formError && (
              <p className="mb-3 text-xs font-bold text-red-700">{formError}</p>
            )}

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

        {/* Questions list */}
        {!matchQuestions.length ? (
          <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-black text-slate-600">No hay preguntas para este partido.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {matchQuestions.map((question) => (
              <div
                key={question.id}
                className={cn(
                  "rounded-lg border p-4 shadow-sm",
                  question.resolved ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <p className="font-black text-slate-950">{question.text}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{question.totalBets} apuesta{question.totalBets !== 1 ? "s" : ""}</span>
                    {question.resolved && (
                      <span className="rounded-lg border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-800">
                        Resuelta
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {question.options.map((option) => {
                    const isCorrect = question.correctOptionId === option.id;
                    const isResolving = resolvingId === question.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={isResolving}
                        onClick={() => void handleResolve(
                          question.id,
                          isCorrect ? null : option.id
                        )}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-black transition disabled:opacity-50",
                          isCorrect
                            ? "border-emerald-500 bg-emerald-600 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"
                        )}
                      >
                        {isResolving ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isCorrect ? (
                          <Check className="h-3 w-3" />
                        ) : null}
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                {question.resolved && (
                  <p className="mt-2 text-xs font-bold text-slate-500">
                    Respuesta correcta: {question.options.find((o) => o.id === question.correctOptionId)?.label}
                    {" "}· {question.pointValue} pt{question.pointValue !== 1 ? "s" : ""} por respuesta correcta
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
