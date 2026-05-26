"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import useSWR from "swr";
import { TIMEFRAMES } from "../constants";
import { t } from "../i18n";
import type { Person, Timeframe } from "../types";
import type { HealthContextValue } from "./types";
import { languageStore, peopleStore, themeStore } from "../utils/health-storage";
import { PeopleHelper } from "../utils/people";
import { WeightDataHelper, fetchWeightEntries } from "../utils/weight-data";
import { WeightEntryService } from "../utils/weight-entry-service";
import { WeightInputHelper } from "../utils/weight-input";

const HealthContext = createContext<HealthContextValue | null>(null);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [selectedPerson, setSelectedPersonState] = useState<Person>("");
  const [addingPerson, setAddingPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [personError, setPersonError] = useState("");
  const [weightDigits, setWeightDigits] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [inputError, setInputError] = useState("");
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot
  );
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.getSnapshot,
    languageStore.getServerSnapshot
  );
  const storedPeople = useSyncExternalStore(
    peopleStore.subscribe,
    peopleStore.getSnapshot,
    peopleStore.getServerSnapshot
  );
  const { data: entries = [], error: loadError, isLoading, mutate } = useSWR(
    "/api/weight",
    fetchWeightEntries
  );

  const people = useMemo(() => PeopleHelper.mergePeople(storedPeople, entries), [entries, storedPeople]);
  const activePerson = selectedPerson || people[0] || "";
  const personEntries = useMemo(
    () =>
      WeightDataHelper.sortByTimestamp(
        entries.filter((entry) => entry.name === activePerson)
      ),
    [activePerson, entries]
  );
  const latestEntryTime = personEntries.length
    ? new Date(personEntries[personEntries.length - 1].timestamp).getTime()
    : undefined;
  const formattedWeight = WeightInputHelper.format(weightDigits);
  const isDark = theme === "dark";
  const error = personError || inputError || saveError || (loadError ? t(language, "loadError") : "");

  const toggleTheme = () => {
    themeStore.set(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = () => {
    languageStore.set(language === "en" ? "es" : "en");
  };

  const setSelectedPerson = (person: Person) => {
    setSelectedPersonState(person);
    setPersonError("");
  };

  const startAddingPerson = () => {
    setAddingPerson(true);
    setPersonError("");
  };

  const cancelAddingPerson = () => {
    setAddingPerson(false);
    setNewPersonName("");
    setPersonError("");
  };

  const addPerson = () => {
    const { error, normalizedName } = PeopleHelper.validateNewPerson(
      newPersonName,
      people,
      language
    );

    if (error) {
      setPersonError(error);
      if (normalizedName) {
        setSelectedPersonState(normalizedName);
        setAddingPerson(false);
        setNewPersonName("");
      }
      return;
    }

    if (!normalizedName) {
      setPersonError(t(language, "personNameRequired"));
      return;
    }

    if (people.includes(normalizedName)) {
      setSelectedPersonState(normalizedName);
      setAddingPerson(false);
      setNewPersonName("");
      return;
    }

    peopleStore.set([...storedPeople, normalizedName].sort());
    setSelectedPersonState(normalizedName);
    setAddingPerson(false);
    setNewPersonName("");
    setPersonError("");
  };

  const handleWeightChange = (value: string) => {
    const nextDigits = WeightInputHelper.sanitizeDigits(value);
    setWeightDigits(nextDigits);
    setInputError(
      WeightInputHelper.hasInvalidCharacters(value, nextDigits) ? t(language, "useNumbersOnly") : ""
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
    setInputError(t(language, "useNumbersOnly"));
  };

  const handleWeightPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text");
    const nextDigits = WeightInputHelper.sanitizeDigits(pasted);

    setWeightDigits(nextDigits);
    setInputError(nextDigits ? "" : t(language, "useNumbersOnly"));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = WeightEntryService.validateSubmit({
      activePerson,
      weightDigits,
      language,
    });

    if (validationError?.field === "person") {
      setPersonError(validationError.error);
      return;
    }

    if (validationError?.field === "weight") {
      setInputError(validationError.error);
      return;
    }

    setSaving(true);
    try {
      setSaveError("");
      setInputError("");
      await WeightEntryService.save({ activePerson, weightDigits });
      setWeightDigits("");
      await mutate();
    } catch (error) {
      console.error(error);
      setSaveError(t(language, "saveError"));
    } finally {
      setSaving(false);
    }
  };

  const updateEntry = async (entry: (typeof entries)[number]) => {
    setSaving(true);
    try {
      setSaveError("");
      const res = await fetch(`/api/weight?id=${encodeURIComponent(entry.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: entry.name,
          weight: entry.weight,
          timestamp: entry.timestamp,
        }),
      });

      if (!res.ok) throw new Error("Failed to update weight entry");
      await mutate();
    } catch (error) {
      console.error(error);
      setSaveError(t(language, "updateError"));
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    setSaving(true);
    try {
      setSaveError("");
      const res = await fetch(`/api/weight?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete weight entry");
      await mutate();
    } catch (error) {
      console.error(error);
      setSaveError(t(language, "deleteError"));
    } finally {
      setSaving(false);
    }
  };

  const getFilteredEntries = (timeframe: Timeframe) => {
    const frame = TIMEFRAMES.find((item) => item.key === timeframe);
    return WeightDataHelper.filterByTimeframe(personEntries, frame?.hours, latestEntryTime);
  };

  const value: HealthContextValue = {
    selectedPerson: activePerson,
    setSelectedPerson,
    people,
    addingPerson,
    newPersonName,
    personError,
    weightDigits,
    formattedWeight,
    saving,
    error,
    isLoading,
    theme,
    language,
    isDark,
    entries,
    personEntries,
    latestEntryTime,
    toggleTheme,
    toggleLanguage,
    startAddingPerson,
    cancelAddingPerson,
    setNewPersonName,
    addPerson,
    handleWeightChange,
    handleWeightKeyDown,
    handleWeightPaste,
    handleSubmit,
    updateEntry,
    deleteEntry,
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
