"use client";

// React binding over the localStorage-backed application tracker in
// applications.ts. SSR-safe (starts empty, hydrates in an effect) and syncs
// across tabs via the `storage` event.

import { useCallback, useEffect, useState } from "react";
import {
  APPS_STORAGE_KEY,
  type ApplicationState,
  type AppsMap,
  loadApps,
  resolveState,
  saveApps,
} from "./applications";

export type UseApplications = {
  /** false until the first client-side read has run. */
  ready: boolean;
  raw: AppsMap;
  get: (slug: string) => ApplicationState;
  update: (slug: string, patch: Partial<ApplicationState>) => void;
  reset: (slug: string) => void;
};

export function useApplications(): UseApplications {
  const [map, setMap] = useState<AppsMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMap(loadApps());
    setReady(true);
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === APPS_STORAGE_KEY) setMap(loadApps());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const get = useCallback((slug: string) => resolveState(map[slug]), [map]);

  const update = useCallback((slug: string, patch: Partial<ApplicationState>) => {
    setMap((prev) => {
      const next: AppsMap = {
        ...prev,
        [slug]: { ...resolveState(prev[slug]), ...patch, updatedOn: new Date().toISOString() },
      };
      saveApps(next);
      return next;
    });
  }, []);

  const reset = useCallback((slug: string) => {
    setMap((prev) => {
      if (!(slug in prev)) return prev;
      const next = { ...prev };
      delete next[slug];
      saveApps(next);
      return next;
    });
  }, []);

  return { ready, raw: map, get, update, reset };
}
