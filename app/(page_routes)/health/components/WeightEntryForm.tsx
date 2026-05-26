"use client";

import { Plus } from "lucide-react";
import { MAX_WEIGHT_DIGITS } from "../constants";
import { useHealth } from "../context/HealthContext";
import { t } from "../i18n";

export function WeightEntryForm() {
  const {
    selectedPerson,
    setSelectedPerson,
    people,
    addingPerson,
    newPersonName,
    weightDigits,
    formattedWeight,
    saving,
    isDark,
    language,
    startAddingPerson,
    cancelAddingPerson,
    setNewPersonName,
    addPerson,
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
          <div className="flex items-center justify-between gap-2">
            <label className={`block text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              {t(language, "person")}
            </label>
            <button
              type="button"
              onClick={startAddingPerson}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                isDark
                  ? "border-slate-600 bg-slate-950 text-blue-200 hover:bg-slate-900"
                  : "border-slate-300 bg-white text-blue-700 hover:bg-blue-50"
              }`}
              aria-label={t(language, "addPerson")}
              title={t(language, "addPerson")}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {addingPerson ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newPersonName}
                onChange={(event) => setNewPersonName(event.target.value)}
                placeholder={t(language, "personName")}
                className={`h-12 w-full rounded-lg border px-4 text-base font-bold shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 ${
                  isDark
                    ? "border-slate-600 bg-slate-950 text-white placeholder:text-slate-500 focus:ring-blue-950"
                    : "border-slate-300 bg-white text-slate-950 placeholder:text-slate-400 focus:ring-blue-100"
                }`}
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={cancelAddingPerson}
                  className={`h-10 rounded-lg border text-sm font-bold transition ${
                    isDark
                      ? "border-slate-600 text-slate-200 hover:bg-slate-700"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {t(language, "cancel")}
                </button>
                <button
                  type="button"
                  onClick={addPerson}
                  className="h-10 rounded-lg bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  {t(language, "add")}
                </button>
              </div>
            </div>
          ) : (
            <select
              value={selectedPerson}
              onChange={(event) => setSelectedPerson(event.target.value)}
              disabled={!people.length}
              className={`h-12 w-full rounded-lg border px-4 text-base font-bold shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                isDark
                  ? "border-slate-600 bg-slate-950 text-white focus:ring-blue-950"
                  : "border-slate-300 bg-white text-slate-950 focus:ring-blue-100"
              }`}
            >
              {people.length ? (
                people.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))
              ) : (
                <option value="">{t(language, "selectOrAddPerson")}</option>
              )}
            </select>
          )}
        </section>

        <section
          className={`rounded-lg border p-4 shadow-sm ${
            isDark ? "border-slate-900 bg-slate-950" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className={`block text-sm font-bold ${isDark ? "text-blue-100" : "text-slate-700"}`}>
              {t(language, "weightKg")}
            </label>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                isDark ? "bg-blue-500/15 text-blue-100" : "bg-blue-100 text-blue-700"
              }`}
            >
              {weightDigits.length}/{MAX_WEIGHT_DIGITS}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_150px] md:items-stretch">
            <div
              className={`flex min-h-20 items-center rounded-lg border px-4 transition focus-within:border-blue-500 focus-within:ring-4 ${
                isDark
                  ? "border-blue-400/70 bg-slate-900 focus-within:ring-blue-500/20"
                  : "border-slate-300 bg-white focus-within:ring-blue-100"
              }`}
            >
              <input
                type="text"
                inputMode="numeric"
                value={formattedWeight}
                onChange={(event) => handleWeightChange(event.target.value)}
                onKeyDown={handleWeightKeyDown}
                onPaste={handleWeightPaste}
                className={`min-w-0 flex-1 bg-transparent text-right text-5xl font-black leading-none tracking-normal outline-none sm:text-6xl ${
                  isDark ? "text-white" : "text-slate-950"
                }`}
              />
              <span className={`ml-3 text-xl font-black ${isDark ? "text-blue-200" : "text-blue-700"}`}>
                kg
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="min-h-20 rounded-lg bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? t(language, "saving") : t(language, "saveEntry")}
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}
