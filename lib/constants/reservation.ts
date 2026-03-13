// ─── Validation ─────────────────────────────────────────────────────────────
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_NUMBER_REGEX = /^\d{4}[\s-]?\d{4}$/;

// ─── Country codes ───────────────────────────────────────────────────────────
export const COUNTRY_CODES = [
  { code: "+506", name: "Costa Rica" },
  { code: "+1", name: "EE. UU. / Canadá" },
  { code: "+52", name: "México" },
  { code: "+57", name: "Colombia" },
  { code: "+34", name: "España" },
] as const;

// ─── Time slots ──────────────────────────────────────────────────────────────
export type TourTime = "08:00" | "09:00" | "10:00";

export const TIME_SLOTS: { id: TourTime; label: string }[] = [
  { id: "08:00", label: "8:00 AM" },
  { id: "09:00", label: "9:00 AM" },
  { id: "10:00", label: "10:00 AM" },
];

// ─── Packages ────────────────────────────────────────────────────────────────
export type TourPackage = "basic" | "full-day" | "private";

export interface PackageOption {
  id: TourPackage;
  priceUSD: number;
  priceCRC: number | null;
  availableOn: "weekdays" | "weekends";
}

export const PACKAGES: PackageOption[] = [
  { id: "basic",    priceUSD: 30, priceCRC: 15000, availableOn: "weekends" },
  { id: "full-day", priceUSD: 40, priceCRC: 20000, availableOn: "weekends" },
  { id: "private",  priceUSD: 60, priceCRC: null,  availableOn: "weekdays" },
];

import { TreePalm, UtensilsCrossed, Sparkles } from "lucide-react";

export const PACKAGE_META = {
  basic: {
    icon: TreePalm,
    accent: "from-sky-500/20 to-emerald-500/10",
    highlightEs: ["Guía certificado local", "Ingreso a zonas naturales", "Briefing de seguridad"],
    highlightEn: ["Certified local guide", "Nature area access", "Safety briefing"],
  },
  "full-day": {
    icon: UtensilsCrossed,
    accent: "from-violet-500/20 to-indigo-500/10",
    highlightEs: ["Incluye almuerzo típico", "Paradas fotográficas", "Ruta extendida todo el día"],
    highlightEn: ["Traditional lunch included", "Photo stops", "Extended full-day route"],
  },
  private: {
    icon: Sparkles,
    accent: "from-amber-500/20 to-orange-500/10",
    highlightEs: ["Atención exclusiva", "Ritmo personalizado", "Ideal para parejas o grupos"],
    highlightEn: ["Exclusive attention", "Custom pace", "Great for couples or groups"],
  },
} satisfies Record<TourPackage, {
  icon: typeof TreePalm;
  accent: string;
  highlightEs: string[];
  highlightEn: string[];
}>;

// ─── Form types ──────────────────────────────────────────────────────────────
export interface ReservationFormState {
  name: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  specialRequests: string;
  agreeTerms: boolean;
}

export interface ReservationOrderPayload {
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total: number;
  date: string;
  tourTime: TourTime;
  tourPackage: TourPackage;
  tourSlug: string;
  tourName: string;
  packagePrice: number;
  specialRequests: string;
}
