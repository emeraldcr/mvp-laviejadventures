"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { localizeHref, localeFromPath, type Locale } from "@/lib/i18n";

export type Lang = Locale;
interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children, initialLang = "es" }: { children: ReactNode; initialLang?: Lang }) {
  const pathname = usePathname();
  const router = useRouter();
  const lang = pathname ? localeFromPath(pathname) : initialLang;
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = (next: Lang) => {
    const href = localizeHref(pathname || "/", next);
    router.push(href + window.location.search + window.location.hash);
  };
  return <LanguageContext.Provider value={{ lang, setLang, toggle: () => setLang(lang === "es" ? "en" : "es") }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
