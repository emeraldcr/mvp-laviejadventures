import type { Person, Timeframe, TimeframeConfig } from "./types";

export const PERSONS: Person[] = ["ALLAN", "VERO"];

export const MAX_WEIGHT_DIGITS = 5;
export const MIN_REASONABLE_WEIGHT_KG = 25;
export const MAX_REASONABLE_WEIGHT_KG = 250;
export const THEME_STORAGE_KEY = "health-theme";

export const TIMEFRAMES: TimeframeConfig[] = [
  { key: "minute", label: "Last 15 Minutes", hours: 0.25, unit: "minute" },
  { key: "hour", label: "Last Hour", hours: 1, unit: "hour" },
  { key: "day", label: "Last Day", hours: 24, unit: "hour" },
  { key: "week", label: "Last Week", hours: 24 * 7, unit: "day" },
  { key: "month", label: "Last Month", hours: 24 * 30, unit: "day" },
  { key: "all", label: "All Entries", unit: "day" },
];

export const BAR_GROUP_INTERVAL_MS: Record<Timeframe, number> = {
  minute: 30 * 1000,
  hour: 2 * 60 * 1000,
  day: 60 * 60 * 1000,
  week: 6 * 60 * 60 * 1000,
  month: 24 * 60 * 60 * 1000,
  all: 24 * 60 * 60 * 1000,
};

