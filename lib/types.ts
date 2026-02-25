export type ContactInfo = {
whatsapp: string;
email: string;
youtube: string;
facebook: string;
twitter: string;
instagram: string;
};


export type TourInfo = {
name: string;
duration: string;
price: string;
inclusions: string[];
exclusions: string[];
cancellationPolicy?: string;
location: string;   
operator: string;
details: string;
restrictions: string;
contact: ContactInfo;
};

export interface PayPalCapture {
  id: string;
  status: string;
  amount: {
    currency_code: string;
    value: string;
  };
}

export interface PayPalPurchaseUnit {
  reference_id?: string;
  payments?: {
    captures?: PayPalCapture[];
  };
}

export interface PayPalOrder {
  id: string;
  status: string;
  purchase_units: PayPalPurchaseUnit[];
}


export type AvailabilityMap = Record<number, number>;

export type ConfidenceLevel = "alta" | "media" | "baja";

export type WeatherMetrics = {
  hasData: boolean;
  avgTemp24h: number | null;
  maxTemp24h: number | null;
  minTemp24h: number | null;
  avgHR24h: number | null;
  maxHR24h: number | null;
  minHR24h: number | null;
};

export type PeakHourData = { mm: number; fecha: string };

export interface AccumulationStatsProps {
  last1h: number;
  last3h: number;
  last6h: number;
  last24h: number;
  last48h: number;
  todayAccum: number | string;
  yesterday: number | string;
  forecastNextHour: number;
  confidence: ConfidenceLevel;
  wetHoursLast24: number;
  wetStreak: number;
  dryStreak: number;
  peakHour24h: PeakHourData;
}

export type ForecastMethod = { value: number; label: string };

export type ForecastMethods = {
  ema: ForecastMethod;
  doubleEMA: ForecastMethod;
  linearRegression: ForecastMethod;
  movingAverage3h: ForecastMethod;
  movingAverage6h: ForecastMethod;
  weightedAverage6h: ForecastMethod;
};

export interface ForecastPanelProps {
  methods: ForecastMethods;
  consensusMm: number;
  confidence: ConfidenceLevel;
}

export type HourlyRainEntry = {
  fecha: string;
  timestampISO?: string | null;
  lluvia_mm: number;
  temp_c?: number | null;
  hr_pct?: number | null;
};

export type DailyRainEntry = { fecha: string; lluvia_mm: number };

export type RollingRiskEntry = {
  fecha: string;
  timestampISO: string | null;
  r3h: number;
  r6h: number;
};

export interface RainStatusCardProps {
  risk: string;
  riskLabel: string;
  riskEmoji: string;
  intensity: string;
  lastHour_mm: number;
  trend: string;
}

export interface LastUpdateProps {
  lastUpdateISO: string;
}

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
  }>;
  error?: string;
};

export interface RegionalWeatherPanelProps {
  locations: LocationWeather[];
  fetchedAt?: string;
}

export interface DashboardApiResponse {
  success: boolean;
  status: {
    risk: string;
    riskLabel: string;
    riskEmoji: string;
    intensity: string;
    lastHour_mm: number;
    trend: string;
  };
  stats: {
    last1h_mm: number;
    last3h_mm: number;
    last6h_mm: number;
    last24h_mm: number;
    last48h_mm: number;
    wetHoursLast24?: number;
    wetStreak?: number;
    dryStreak?: number;
    peakHour24h?: PeakHourData;
  };
  forecast: {
    nextHour_mm: number;
    confidence: ConfidenceLevel;
    methods?: ForecastMethods;
    consensusMm?: number;
  };
  weather?: WeatherMetrics;
  analysis?: {
    rollingRisk?: RollingRiskEntry[];
  };
  meta: {
    lastUpdateISO: string;
    source: string;
    station: string;
    fetchedAt: string;
    note: string;
  };
  data: {
    hourly: HourlyRainEntry[];
    daily?: DailyRainEntry[];
  };
  currentSnapshot?: {
    sum_lluv_mm?: number;
    lluv_ayer_mm?: number;
  };
  counts?: {
    hourlyAvailable?: number;
  };
}

export type SuccessPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export type BookingRecord = {
  orderId: string;
  captureId: string | null;
  status: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  date: string | null;
  tickets: number | null;
  amount: number | null;
  currency: string | null;
  tourTime: string | null;
  tourPackage: string | null;
  packagePrice: number | null;
  userId?: string | null;
  userEmail?: string | null;
  createdAt?: Date;
  paypalRaw?: unknown;
};

// Tour document stored in MongoDB
export type TourDocument = {
  _id?: string;
  slug: string;
  iconName: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  duration: string;
  difficulty: string;
  priceCRC: number;
  tagEs: string;
  tagEn: string;
  accent: string;
  border: string;
  type: "public" | "b2b" | "both";
  retailPricePerPax?: number;
  currency?: string;
  minPax?: number;
  maxPax?: number;
  includes?: string[];
  exclusions?: string[];
  restrictions?: string;
  location?: string;
  cancellationPolicy?: string;
  isMain?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
};

// Main tour info as served from the API
export type MainTourInfo = {
  name: string;
  operator: string;
  duration: string;
  price: string;
  location: string;
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string;
  details: string;
  restrictions: string;
  contact: ContactInfo;
};

export type SendEmailParams = {
  to: string | null;
  name: string | null;
  phone: string | null;
  date: string | null;
  tickets: string | number | null;
  amount: string | number | null;
  currency: string | null;
  orderId: string;
  captureId: string | null;
  status: string | null;
  reservationId: string | null;
};

export type SuccessClientProps = {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  date?: string | null;
  tickets?: string | number | null;
  amount?: string | number | null;
  currency?: string | null;
  orderId?: string | null;
  captureId?: string | null;
  status?: string | null;
  error?: string | null;
};

export type OrderDetails = {
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total: number;
  date: string;
  tourTime: string;
  tourPackage: string;
  packagePrice: number;
};

export type PaymentModalProps = {
  orderDetails: OrderDetails;
  onClose: () => void;
  onSuccess: (orderData: unknown) => void;
};
