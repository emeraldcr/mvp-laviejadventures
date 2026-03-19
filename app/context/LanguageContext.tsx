"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";
import { LANGUAGE_STORAGE_KEY, LANGUAGE_CHANGE_EVENT } from "@/lib/constants/storage";

export type Lang = "es" | "en";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const subscribeToLanguage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, callback);
  };
};

const getStoredLanguage = (): Lang => {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Lang | null;
    if (stored === "es" || stored === "en") {
      return stored;
    }
  } catch {
    // localStorage not available
  }

  return "es";
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribeToLanguage, getStoredLanguage, () => "es");

  const setLang = (l: Lang) => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, l);
      window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
    } catch {
      // localStorage not available
    }
  };

  const toggle = () => setLang(lang === "es" ? "en" : "es");

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
