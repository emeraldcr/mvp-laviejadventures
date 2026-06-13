"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "../utils";

type StatQuestion = {
  id: string;
  text: string;
  options: Array<{ id: string; label: string }>;
  correctOptionId: string | null;
  resolved: boolean;
  pointValue: number;
  closed: boolean;
};

type StatBet = { questionId: string; optionId: string };

type StatBetsPanelProps = {
  matchId: string;
  playerName: string;
};

export function StatBetsPanel({ matchId, playerName }: StatBetsPanelProps) {
  const [questions, setQuestions] = useState<StatQuestion[]>([]);
  const [myBets, setMyBets] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!matchId) return;
    void load();
  }, [matchId, playerName]);

  async function load() {
    const params = new URLSearchParams({ matchId });
    if (playerName) params.set("playerName", playerName);
    const res = await fetch(`/api/mundial/stat-bets?${params.toString()}`);
    if (!res.ok) return;
    const data = await res.json();
    setQuestions(data.questions ?? []);
    const betsMap: Record<string, string> = {};
    for (const bet of (data.myBets ?? []) as StatBet[]) {
      betsMap[bet.questionId] = bet.optionId;
    }
    setMyBets(betsMap);
  }

  async function placeBet(questionId: string, optionId: string) {
    if (!playerName) return;
    setSaving(questionId);
    setErrors((prev) => ({ ...prev, [questionId]: "" }));
    try {
      const res = await fetch("/api/mundial/stat-bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, matchId, playerName, optionId }),
      });
      if (res.ok) {
        setMyBets((prev) => ({ ...prev, [questionId]: optionId }));
      } else {
        const body = await res.json().catch(() => ({}));
        setErrors((prev) => ({ ...prev, [questionId]: body.error ?? "Error guardando." }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, [questionId]: "Error de red." }));
    } finally {
      setSaving(null);
    }
  }

  if (!questions.length) return null;

  return (
    <section className="rounded-lg border border-purple-200 bg-white p-4 shadow-sm">
      <p className="mb-4 text-sm font-black uppercase text-purple-700">Apuestas del partido</p>
      <div className="grid gap-5">
        {questions.map((question) => {
          const myBet = myBets[question.id];
          const isSaving = saving === question.id;
          const isClosed = question.closed || question.resolved;
          const myPoints =
            question.resolved && myBet && myBet === question.correctOptionId ? question.pointValue : null;

          return (
            <div key={question.id}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="font-black text-slate-900">{question.text}</p>
                {myPoints !== null && (
                  <span className="shrink-0 rounded-lg border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-800">
                    +{myPoints} pt{myPoints !== 1 ? "s" : ""}
                  </span>
                )}
                {question.resolved && myBet && myBet !== question.correctOptionId && (
                  <span className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-black text-red-700">
                    Sin puntos
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {question.options.map((option) => {
                  const selected = myBet === option.id;
                  const isCorrectAnswer = question.resolved && question.correctOptionId === option.id;
                  const isWrongAnswer = question.resolved && selected && !isCorrectAnswer;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={isClosed || isSaving || !playerName}
                      onClick={() => void placeBet(question.id, option.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-black transition",
                        isCorrectAnswer
                          ? "border-emerald-500 bg-emerald-600 text-white"
                          : isWrongAnswer
                            ? "border-red-200 bg-red-50 text-red-600 line-through"
                            : selected
                              ? "border-purple-500 bg-purple-600 text-white"
                              : isClosed
                                ? "border-slate-200 bg-slate-50 text-slate-400"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-purple-300 hover:bg-purple-50"
                      )}
                    >
                      {isSaving && selected ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (isCorrectAnswer || (selected && !question.resolved)) ? (
                        <Check className="h-3 w-3" />
                      ) : null}
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {errors[question.id] && (
                <p className="mt-1.5 text-xs font-bold text-red-600">{errors[question.id]}</p>
              )}

              {!playerName && (
                <p className="mt-1.5 text-xs font-bold text-slate-400">Pone tu nombre para apostar.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
