"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import useSWR from "swr";
import { THEME_STORAGE_KEY, TIMEFRAMES } from "../constants";
import type { Person, Theme, Timeframe, WeightEntry } from "../types";
import { WeightDataHelper, fetchWeightEntries } from "../utils/weight-data";
import { WeightInputHelper } from "../utils/weight-input";

type HealthContextValue = {
  selectedPerson: Person;
  setSelectedPerson: (person: Person) => void;
  weightDigits: string;
  formattedWeight: string;
  saving: boolean;
  error: string;
  isLoading: boolean;
  theme: Theme;
  isDark: boolean;
  personEntries: WeightEntry[];
  latestEntryTime?: number;
  toggleTheme: () => void;
  handleWeightChange: (value: string) => void;
  handleWeightKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleWeightPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  handleSubmit: (event: FormEvent) => Promise<void>;
  getFilteredEntries: (timeframe: Timeframe) => WeightEntry[];
};

const HealthContext = createContext<HealthContextValue | null>(null);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function HealthProvider({ children }: { children: ReactNode }) {
  const [selectedPerson, setSelectedPerson] = useState<Person>("ALLAN");
  const [weightDigits, setWeightDigits] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [inputError, setInputError] = useState("");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const { data: entries = [], error: loadError, isLoading, mutate } = useSWR(
    "/api/weight",
    fetchWeightEntries
  );

  const personEntries = useMemo(
    () =>
      WeightDataHelper.sortByTimestamp(
        entries.filter((entry) => entry.name === selectedPerson)
      ),
    [entries, selectedPerson]
  );
  const latestEntryTime = personEntries.length
    ? new Date(personEntries[personEntries.length - 1].timestamp).getTime()
    : undefined;
  const formattedWeight = WeightInputHelper.format(weightDigits);
  const isDark = theme === "dark";
  const error = inputError || saveError || (loadError ? "Could not load the saved weights." : "");

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  };

  const handleWeightChange = (value: string) => {
    const nextDigits = WeightInputHelper.sanitizeDigits(value);
    setWeightDigits(nextDigits);
    setInputError(
      WeightInputHelper.hasInvalidCharacters(value, nextDigits) ? "Use numbers only." : ""
    );
  };

  const handleWeightKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      setInputError("");
      setWeightDigits((current) => WeightInputHelper.sanitizeDigits(`${current}${event.key}`));
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      setInputError("");
      setWeightDigits((current) => current.slice(0, -1));
      return;
    }

    if (event.key === "Delete" || event.key === "Escape") {
      event.preventDefault();
      setInputError("");
      setWeightDigits("");
      return;
    }

    if (["Tab", "Enter", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      return;
    }

    event.preventDefault();
    setInputError("Use numbers only.");
  };

  const handleWeightPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text");
    const nextDigits = WeightInputHelper.sanitizeDigits(pasted);

    setWeightDigits(nextDigits);
    setInputError(nextDigits ? "" : "Use numbers only.");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = WeightInputHelper.validate(weightDigits);

    if (validationError) {
      setInputError(validationError);
      return;
    }

    setSaving(true);
    try {
      setSaveError("");
      setInputError("");
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedPerson,
          weight: WeightInputHelper.parse(weightDigits),
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to save weight entry");

      setWeightDigits("");
      await mutate();
    } catch (error) {
      console.error(error);
      setSaveError("Could not save the weight entry.");
    } finally {
      setSaving(false);
    }
  };

  const getFilteredEntries = (timeframe: Timeframe) => {
    const frame = TIMEFRAMES.find((item) => item.key === timeframe);
    return WeightDataHelper.filterByTimeframe(personEntries, frame?.hours, latestEntryTime);
  };

  const value: HealthContextValue = {
    selectedPerson,
    setSelectedPerson,
    weightDigits,
    formattedWeight,
    saving,
    error,
    isLoading,
    theme,
    isDark,
    personEntries,
    latestEntryTime,
    toggleTheme,
    handleWeightChange,
    handleWeightKeyDown,
    handleWeightPaste,
    handleSubmit,
    getFilteredEntries,
  };

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export function useHealth() {
  const context = useContext(HealthContext);

  if (!context) {
    throw new Error("useHealth must be used inside HealthProvider");
  }

  return context;
}

