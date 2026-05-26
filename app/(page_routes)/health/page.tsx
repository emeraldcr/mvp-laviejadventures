"use client";

import { HealthHeader } from "./components/HealthHeader";
import { WeightRecordsTable } from "./components/WeightRecordsTable";
import { WeightChartsGrid } from "./components/WeightChartsGrid";
import { WeightEntryForm } from "./components/WeightEntryForm";
import { HealthProvider, useHealth } from "./context/HealthContext";

function HealthPageContent() {
  const { error, isDark } = useHealth();

  return (
    <main
      className={`min-h-screen px-4 py-8 sm:px-6 ${
        isDark ? "bg-slate-950 text-slate-50" : "bg-slate-100 text-slate-950"
      }`}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <HealthHeader />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <WeightEntryForm />
        <WeightChartsGrid />
        <WeightRecordsTable />
      </div>
    </main>
  );
}

export default function WeightTracker() {
  return (
    <HealthProvider>
      <HealthPageContent />
    </HealthProvider>
  );
}
