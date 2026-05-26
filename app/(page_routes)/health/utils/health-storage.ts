import { LANGUAGE_STORAGE_KEY, PEOPLE_STORAGE_KEY, THEME_STORAGE_KEY } from "../constants";
import type { Language, Person, Theme } from "../types";
import { PeopleHelper } from "./people";

type StorageConfig<T> = {
  key: string;
  eventName: string;
  defaultValue: T;
  read: (value: string | null) => T;
  serialize?: (value: T) => string;
};

class LocalStorageStore<T> {
  private cachedRawValue: string | null | undefined;
  private cachedSnapshot: T = this.config.defaultValue;

  constructor(private readonly config: StorageConfig<T>) {}

  getSnapshot = (): T => {
    if (typeof window === "undefined") return this.config.defaultValue;

    const rawValue = window.localStorage.getItem(this.config.key);

    if (rawValue === this.cachedRawValue) {
      return this.cachedSnapshot;
    }

    this.cachedRawValue = rawValue;
    this.cachedSnapshot = this.config.read(rawValue);
    return this.cachedSnapshot;
  };

  getServerSnapshot = (): T => this.config.defaultValue;

  subscribe = (callback: () => void) => {
    window.addEventListener("storage", callback);
    window.addEventListener(this.config.eventName, callback);

    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener(this.config.eventName, callback);
    };
  };

  set(value: T) {
    window.localStorage.setItem(
      this.config.key,
      this.config.serialize ? this.config.serialize(value) : String(value)
    );
    window.dispatchEvent(new Event(this.config.eventName));
  }
}

export const themeStore = new LocalStorageStore<Theme>({
  key: THEME_STORAGE_KEY,
  eventName: "health-theme-change",
  defaultValue: "dark",
  read: (value) => (value === "light" ? "light" : "dark"),
});

export const languageStore = new LocalStorageStore<Language>({
  key: LANGUAGE_STORAGE_KEY,
  eventName: "health-language-change",
  defaultValue: "es",
  read: (value) => (value === "en" ? "en" : "es"),
});

export const peopleStore = new LocalStorageStore<Person[]>({
  key: PEOPLE_STORAGE_KEY,
  eventName: "health-people-change",
  defaultValue: [],
  read: (value) => {
    try {
      const parsed = value ? JSON.parse(value) : [];
      return Array.isArray(parsed)
        ? parsed.map((name) => PeopleHelper.normalizeName(String(name))).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  },
  serialize: (value) => JSON.stringify(value),
});
