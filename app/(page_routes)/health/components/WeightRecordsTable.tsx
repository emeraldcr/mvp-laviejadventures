"use client";

import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useHealth } from "../context/HealthContext";
import { t } from "../i18n";
import type { WeightEntry } from "../types";

type DraftEntry = {
  name: string;
  weight: string;
  timestamp: string;
};

function toDateTimeLocalValue(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function formatDateTime(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function WeightRecordsTable() {
  const { entries, people, isDark, language, saving, updateEntry, deleteEntry } = useHealth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftEntry>({ name: "", weight: "", timestamp: "" });
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const startEdit = (entry: WeightEntry) => {
    setEditingId(entry.id);
    setDraft({
      name: entry.name,
      weight: entry.weight.toFixed(3),
      timestamp: toDateTimeLocalValue(entry.timestamp),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ name: "", weight: "", timestamp: "" });
  };

  const saveEdit = async (entry: WeightEntry) => {
    const nextTimestamp = new Date(draft.timestamp);

    await updateEntry({
      id: entry.id,
      name: draft.name,
      weight: Number(draft.weight),
      timestamp: nextTimestamp.toISOString(),
    });
    cancelEdit();
  };

  const removeEntry = async (id: string) => {
    if (!window.confirm(t(language, "confirmDelete"))) return;
    await deleteEntry(id);
  };

  const inputClassName = `h-10 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 ${
    isDark
      ? "border-slate-700 bg-slate-950 text-white focus:ring-blue-500/20"
      : "border-slate-300 bg-white text-slate-950 focus:ring-blue-100"
  }`;

  return (
    <section
      className={`rounded-lg border p-5 shadow-sm sm:p-6 ${
        isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>
          {t(language, "records")}
        </h2>
      </div>

      {sortedEntries.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className={isDark ? "text-slate-300" : "text-slate-600"}>
                <th className="border-b px-3 py-3 font-bold">{t(language, "person")}</th>
                <th className="border-b px-3 py-3 font-bold">{t(language, "weight")}</th>
                <th className="border-b px-3 py-3 font-bold">{t(language, "date")}</th>
                <th className="border-b px-3 py-3 text-right font-bold">{t(language, "actions")}</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry) => {
                const isEditing = editingId === entry.id;

                return (
                  <tr
                    key={entry.id}
                    className={`align-middle ${
                      isDark ? "border-slate-800 text-slate-100" : "border-slate-200 text-slate-800"
                    }`}
                  >
                    <td className="border-b px-3 py-3">
                      {isEditing ? (
                        <select
                          value={draft.name}
                          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                          className={inputClassName}
                        >
                          {people.map((person) => (
                            <option key={person} value={person}>
                              {person}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-bold">{entry.name}</span>
                      )}
                    </td>
                    <td className="border-b px-3 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min="25"
                          max="250"
                          step="0.001"
                          value={draft.weight}
                          onChange={(event) => setDraft((current) => ({ ...current, weight: event.target.value }))}
                          className={inputClassName}
                        />
                      ) : (
                        `${entry.weight.toFixed(3)} kg`
                      )}
                    </td>
                    <td className="border-b px-3 py-3">
                      {isEditing ? (
                        <input
                          type="datetime-local"
                          value={draft.timestamp}
                          onChange={(event) =>
                            setDraft((current) => ({ ...current, timestamp: event.target.value }))
                          }
                          className={inputClassName}
                        />
                      ) : (
                        formatDateTime(entry.timestamp)
                      )}
                    </td>
                    <td className="border-b px-3 py-3">
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEdit(entry)}
                              disabled={saving || !draft.name || !draft.weight || !draft.timestamp}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label={t(language, "save")}
                              title={t(language, "save")}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                                isDark
                                  ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
                              }`}
                              aria-label={t(language, "cancel")}
                              title={t(language, "cancel")}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(entry)}
                              disabled={saving}
                              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                isDark
                                  ? "border-slate-700 text-blue-100 hover:bg-slate-800"
                                  : "border-slate-300 text-blue-700 hover:bg-blue-50"
                              }`}
                              aria-label={t(language, "edit")}
                              title={t(language, "edit")}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeEntry(entry.id)}
                              disabled={saving}
                              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                isDark
                                  ? "border-red-900/70 text-red-200 hover:bg-red-950"
                                  : "border-red-200 text-red-700 hover:bg-red-50"
                              }`}
                              aria-label={t(language, "delete")}
                              title={t(language, "delete")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className={`rounded-lg border px-4 py-6 text-sm font-bold ${
            isDark ? "border-slate-800 bg-slate-950 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          {t(language, "noRecords")}
        </div>
      )}
    </section>
  );
}
