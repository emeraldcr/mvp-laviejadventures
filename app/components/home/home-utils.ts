import { BUSINESS_WHATSAPP_URL } from "@/lib/site-config";
export { formatTourPrice, getTourPriceDisplay, tourMinPrice, tourTitle } from "@/lib/tour-pricing";
export type { TourPriceDisplay } from "@/lib/tour-pricing";

export const WHATSAPP_HREF = BUSINESS_WHATSAPP_URL;
export const CIUDAD_ESMERALDA_SLUG = "tour-ciudad-esmeralda";
export const BOOKING_HREF = `/reservar?tour=${CIUDAD_ESMERALDA_SLUG}`;
export const TOURS_HREF = "/tours";

export function primaryBookingLabel(isEs: boolean) { return isEs ? "Consultar disponibilidad" : "Check availability"; }
export function compactBookingLabel(isEs: boolean) { return isEs ? "Consultar disponibilidad" : "Check availability"; }

export function whatsappHref(message: string) {
  return `${BUSINESS_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

export function localizedHomeWhatsAppHref(isEs: boolean) {
  return whatsappHref(isEs
    ? "Hola, quiero reservar un tour en La Vieja Adventures. ¿Me ayudan con la disponibilidad y los detalles?"
    : "Hello, I would like to book a tour with La Vieja Adventures. Could you help me with availability and details?");
}
