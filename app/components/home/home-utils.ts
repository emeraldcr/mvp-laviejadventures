import { BUSINESS_WHATSAPP_URL } from "@/lib/site-config";
export { formatTourPrice, getTourPriceDisplay, tourMinPrice, tourTitle } from "@/lib/tour-pricing";
export type { TourPriceDisplay } from "@/lib/tour-pricing";

export const WHATSAPP_HREF = BUSINESS_WHATSAPP_URL;
export const CIUDAD_ESMERALDA_SLUG = "tour-ciudad-esmeralda";
export const BOOKING_HREF = `/reservar?tour=${CIUDAD_ESMERALDA_SLUG}`;
export const TOURS_HREF = "/tours";

export function primaryBookingLabel(isEs: boolean) { return isEs ? "Reservar" : "Book now"; }
export function compactBookingLabel(isEs: boolean) { return isEs ? "Reservar" : "Book now"; }
