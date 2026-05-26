import type { WeightEntry } from "../types";

export class WeightDataHelper {
  static normalizeEntry(entry: WeightEntry): WeightEntry | null {
    const weight = Number(entry.weight);
    const timestamp = new Date(entry.timestamp);

    if (!Number.isFinite(weight) || Number.isNaN(timestamp.getTime())) {
      return null;
    }

    return {
      ...entry,
      name: entry.name.trim().toUpperCase(),
      weight,
      timestamp: timestamp.toISOString(),
    };
  }

  static sortByTimestamp(entries: WeightEntry[]) {
    return [...entries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  static filterByTimeframe(entries: WeightEntry[], hours?: number, latestEntryTime?: number) {
    if (!hours || !latestEntryTime) {
      return [...entries];
    }

    return entries.filter((entry) => {
      const diffHours =
        (latestEntryTime - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60);
      return diffHours <= hours;
    });
  }
}

export async function fetchWeightEntries(url: string): Promise<WeightEntry[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load weight entries");

  const data: WeightEntry[] = await res.json();
  return data
    .map(WeightDataHelper.normalizeEntry)
    .filter((entry): entry is WeightEntry => entry !== null);
}

