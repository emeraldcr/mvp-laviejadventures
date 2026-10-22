export type RainData = {
  success: boolean;
  meta?: {
    fetchedAt: string;
    lastUpdateISO: string;
    note: string;
    station: string;
  };
  status?: {
    risk: "green" | "yellow" | "red";
    riskLabel: string;
    riskEmoji: string;
    intensity: string;
    lastHour_mm: number;
    trend: string;
  };
  stats?: {
    last1h_mm: number;
    last3h_mm: number;
    last6h_mm: number;
    last24h_mm: number;
    last48h_mm: number;
    wetHoursLast24: number;
    wetStreak: number;
    dryStreak: number;
    peakHour24h: { mm: number; fecha: string };
  };
  rainTrend?: {
    direction: "subiendo" | "estable" | "bajando";
    label: string;
    last3h_mm: number;
    prev3h_mm: number;
  };
  analysis?: {
    rollingRisk: Array<{
      fecha: string;
      timestampISO: string | null;
      r3h: number;
      r6h: number;
    }>;
  };
  data?: {
    hourly: Array<{
      fecha: string;
      timestampISO: string | null;
      lluvia_mm: number;
      temp_c: number | null;
      hr_pct: number | null;
    }>;
    daily: Array<{ fecha: string; timestamp?: string | null; lluvia_mm: number }>;
  };
  currentSnapshot?: { sum_lluv_mm: number; lluv_ayer_mm: number } | null;
  crecidaRisk?: {
    level: "bajo" | "moderado" | "alto" | "critico";
    label: string;
    guidance: string;
    basisMm: number;
  };
  stationHealth?: import("@/lib/weather/types/api").StationHealth;
  baseline?: import("@/lib/weather/types/api").RainBaseline;
  /** Motor de predicción v2.0: AHORA / MAÑANA / RÍO, cada bloque con confianza. */
  model?: import("@/lib/weather/types/model").TiempoModel | null;
  error?: string;
};

export type RegionalHourlyEntry = {
  time: string;
  temp_c: number;
  hr_pct: number;
  precip_mm: number;
  precip_prob: number | null;
  rain_mm: number;
  weather_code: number;
  weather_icon: string;
};

export type RegionalData = {
  success: boolean;
  fetchedAt?: string;
  locations?: Array<{
    id: string;
    name: string;
    lat: number;
    lon: number;
    current: {
      temp_c: number;
      hr_pct: number;
      precip_mm: number;
      precip_prob_next3h: number | null;
      weather_label: string;
      weather_icon: string;
      wind_kmh: number;
    } | null;
    hourly_24h?: RegionalHourlyEntry[];
    daily_5d: Array<{
      date: string;
      weather_icon: string;
      weather_label: string;
      temp_max_c: number;
      temp_min_c: number;
      precip_sum_mm: number;
      precip_prob_max: number | null;
    }>;
  }>;
};

export type LocationWeather = {
  id: string;
  name: string;
  description: string;
  lat: number;
  lon: number;
  elevation_m: number | null;
  current: {
    time: string;
    temp_c: number;
    hr_pct: number;
    precip_mm: number;
    precip_prob_next3h: number | null;
    rain_mm: number;
    wind_kmh: number;
    cloud_pct: number;
    weather_code: number;
    weather_label: string;
    weather_icon: string;
  } | null;
  hourly_24h: Array<{
    time: string;
    temp_c: number;
    hr_pct: number;
    precip_mm: number;
    precip_prob: number | null;
    rain_mm: number;
    weather_code: number;
    weather_icon: string;
  }>;
  daily_5d: Array<{
    date: string;
    weather_code: number;
    weather_label: string;
    weather_icon: string;
    temp_max_c: number;
    temp_min_c: number;
    precip_sum_mm: number;
    precip_prob_max: number | null;
  }>;
  error?: string;
};
