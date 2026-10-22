export type AvailabilityMap = Record<number, number>;

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
  tourSlug?: string | null;
  tourName?: string | null;
  packagePrice: number | null;
  userId?: string | null;
  userEmail?: string | null;
  createdAt?: Date;
  paypalRaw?: unknown;
};

export type SuccessClientProps = {
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  date?: string | null;
  tourName?: string | null;
  tourPackage?: string | null;
  tourTime?: string | null;
  tickets?: string | number | null;
  amount?: string | number | null;
  currency?: string | null;
  orderId?: string | null;
  captureId?: string | null;
  reservationId?: string | null;
  status?: string | null;
  emailStatus?: "sent" | "failed" | "not_configured" | "not_requested";
  error?: string | null;
};

export type OrderDetails = {
  bookingAttemptId?: string;
  resumeToken?: string;
  name: string;
  email: string;
  phone: string;
  tickets: number;
  total: number;
  date: string;
  dateIso?: string;
  tourTime: string;
  packageId?: string;
  tourPackage: string;
  tourSlug: string;
  tourName: string;
  packagePrice: number;
  specialRequests?: string;
  addons?: string[];
  addonIds?: string[];
  addonsPrice?: number;
  addonsPricePerPerson?: number;
  addonsBreakdown?: Array<{ id: string; pricePerPerson: number }>;
  addonDetails?: import("@/lib/booking/core/types").ReservationAddonDetails;
  transportQuote?: import("@/lib/booking/transport/quote").TransportQuoteResult | null;
};
