import { calculateTransportCost, resolvePoint } from "@/lib/transport/calc";
import type { ReservationAddonDetails } from "./types";

export type TransportPointRef = { type: "ref"; id: string };

export type TransportQuoteResult = {
  distanceKm: number;
  basePrice: number;
  legs: number;
  total: number;
  perPerson: number;
  type: "private" | "shared";
};

export const TRANSPORT_PICKUP_OPTIONS = [
  { id: "san-carlos", labelEs: "San Carlos", labelEn: "San Carlos" },
  { id: "la-fortuna", labelEs: "La Fortuna", labelEn: "La Fortuna" },
  { id: "ciudad-quesada", labelEs: "Ciudad Quesada", labelEn: "Ciudad Quesada" },
  { id: "san-jose", labelEs: "San José", labelEn: "San José" },
  { id: "hotel-airbnb", labelEs: "Hotel / Airbnb", labelEn: "Hotel / Airbnb" },
  { id: "hotel-la-fortuna-central", labelEs: "Hotel - La Fortuna central", labelEn: "Hotel - La Fortuna central" },
  { id: "hotel-arenal-area", labelEs: "Hotel - Arenal area", labelEn: "Hotel - Arenal area" },
  { id: "hotel-san-vicente", labelEs: "Hotel - San Vicente", labelEn: "Hotel - San Vicente" },
  { id: "hotel-ciudad-quesada", labelEs: "Hotel - Ciudad Quesada", labelEn: "Hotel - Ciudad Quesada" },
  { id: "hotel-san-jose-airport", labelEs: "Hotel - SJO airport area", labelEn: "Hotel - SJO airport area" },
] as const;

export const TRANSPORT_DROPOFF_OPTIONS = [
  { id: "la-vieja-adventures", labelEs: "La Vieja Adventures", labelEn: "La Vieja Adventures" },
  { id: "san-vicente", labelEs: "San Vicente", labelEn: "San Vicente" },
  { id: "la-fortuna", labelEs: "La Fortuna", labelEn: "La Fortuna" },
  { id: "san-jose", labelEs: "San José", labelEn: "San José" },
  { id: "same-pickup", labelEs: "Mismo pickup", labelEn: "Same pickup" },
] as const;

const TRANSPORT_LOCATION_MAP = new Map<string, (typeof TRANSPORT_PICKUP_OPTIONS | typeof TRANSPORT_DROPOFF_OPTIONS)[number]>(
  [...TRANSPORT_PICKUP_OPTIONS, ...TRANSPORT_DROPOFF_OPTIONS].map((location) => [location.id, location]),
);

export function getTransportLocationLabel(id: string, lang: "es" | "en") {
  const option = TRANSPORT_LOCATION_MAP.get(id);
  if (!option) return id;
  return lang === "es" ? option.labelEs : option.labelEn;
}

export function getDefaultTransportDetails(): ReservationAddonDetails {
  return {
    transportType: "private",
    pickupLocation: TRANSPORT_PICKUP_OPTIONS[0].id,
    dropoffLocation: TRANSPORT_DROPOFF_OPTIONS[0].id,
  };
}

export function resolveTransportEndpoints(
  details: ReservationAddonDetails,
): { pickup: TransportPointRef | null; dropoff: TransportPointRef | null } {
  const pickup = details.pickupLocation
    ? { type: "ref" as const, id: details.pickupLocation }
    : null;

  let dropoff = details.dropoffLocation
    ? { type: "ref" as const, id: details.dropoffLocation }
    : null;

  if (dropoff?.id === "same-pickup") {
    dropoff = pickup;
  }

  return { pickup, dropoff };
}

export function isTransportConfigComplete(details: ReservationAddonDetails): boolean {
  const { pickup, dropoff } = resolveTransportEndpoints(details);
  return Boolean(pickup?.id && dropoff?.id);
}

export async function quoteTransportAddon(
  details: ReservationAddonDetails,
  pax: number,
): Promise<TransportQuoteResult | null> {
  const { pickup, dropoff } = resolveTransportEndpoints(details);
  if (!pickup?.id || !dropoff?.id) return null;

  async function toCoords(ref: TransportPointRef | null) {
    if (!ref?.id) return null;
    const resolved = await resolvePoint({ type: "ref", id: ref.id });
    if (!resolved) return null;
    return { lat: resolved.lat, lng: resolved.lng };
  }

  const pickupCoords = await toCoords(pickup);
  const dropoffCoords = await toCoords(dropoff);
  if (!pickupCoords || !dropoffCoords) return null;

  const transportType = details.transportType === "shared" ? "shared" : "private";
  return calculateTransportCost({
    pickupCoords,
    dropoffCoords,
    transportType,
    pax: Math.max(1, pax),
  }) as TransportQuoteResult;
}

export function getTransportPerPersonPrice(
  quote: TransportQuoteResult | null | undefined,
  fallbackPrice: number,
): number {
  if (quote?.perPerson && Number.isFinite(quote.perPerson)) {
    return quote.perPerson;
  }
  return fallbackPrice;
}
