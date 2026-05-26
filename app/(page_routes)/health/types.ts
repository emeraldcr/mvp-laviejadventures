export type WeightEntry = {
  id: string;
  name: string;
  weight: number;
  timestamp: string;
};

export type Person = "ALLAN" | "VERO";
export type Theme = "light" | "dark";
export type Timeframe = "minute" | "hour" | "day" | "week" | "month" | "all";

export type TimeframeConfig = {
  key: Timeframe;
  label: string;
  hours?: number;
  unit: "minute" | "hour" | "day";
};

