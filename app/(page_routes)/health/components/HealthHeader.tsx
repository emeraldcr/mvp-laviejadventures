"use client";

import { Moon, Sun } from "lucide-react";
import { useHealth } from "../context/HealthContext";

export function HealthHeader() {
  const { isDark, toggleTheme } = useHealth();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="hidden w-28 sm:block" />
      <h1 className={`text-center text-4xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
        Weight Tracker
      </h1>
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold shadow-sm transition ${
          isDark
            ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
        }`}
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {isDark ? "Light" : "Dark"}
      </button>
    </div>
  );
}

