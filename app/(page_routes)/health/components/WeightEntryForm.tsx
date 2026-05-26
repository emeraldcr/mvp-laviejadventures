"use client";

import { MAX_WEIGHT_DIGITS, PERSONS } from "../constants";
import { useHealth } from "../context/HealthContext";
import type { Person } from "../types";

export function WeightEntryForm() {
  const {
    selectedPerson,
    setSelectedPerson,
    weightDigits,
    formattedWeight,
    saving,
    isDark,
    handleWeightChange,
    handleWeightKeyDown,
    handleWeightPaste,
    handleSubmit,
  } = useHealth();

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-lg border p-5 shadow-sm sm:p-6 ${
        isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
      }`}
    >
      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <section
          className={`flex min-h-32 flex-col justify-between rounded-lg border p-4 ${
            isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"
          }`}
        >
          <label className={`block text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            Person
          </label>
          <select
            value={selectedPerson}
            onChange={(event) => setSelectedPerson(event.target.value as Person)}
            className={`h-12 w-full rounded-lg border px-4 text-base font-bold shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
              isDark
                ? "border-slate-600 bg-slate-950 text-white focus:ring-blue-950"
                : "border-slate-300 bg-white text-slate-950"
            }`}
          >
            {PERSONS.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </section>

        <section className="rounded-lg border border-slate-900 bg-slate-950 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="block text-sm font-bold text-blue-100">Weight (kg)</label>
            <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-100">
              {weightDigits.length}/{MAX_WEIGHT_DIGITS}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_150px] md:items-stretch">
            <div className="flex min-h-20 items-center rounded-lg border border-blue-400/70 bg-slate-900 px-4 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-500/20">
              <input
                type="text"
                inputMode="numeric"
                value={formattedWeight}
                onChange={(event) => handleWeightChange(event.target.value)}
                onKeyDown={handleWeightKeyDown}
                onPaste={handleWeightPaste}
                className="min-w-0 flex-1 bg-transparent text-right text-5xl font-black leading-none tracking-normal text-white outline-none sm:text-6xl"
              />
              <span className="ml-3 text-xl font-black text-blue-200">kg</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="min-h-20 rounded-lg bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}

