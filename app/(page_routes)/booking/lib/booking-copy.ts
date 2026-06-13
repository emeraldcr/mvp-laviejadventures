import { BOOKING_COPY, DEFAULT_TOUR_PACKAGE } from "../constants";

type CopyKey = keyof typeof BOOKING_COPY;

function languageKey(lang: string) {
  return lang === "es" ? "es" : "en";
}

export function bookingCopy(key: CopyKey, lang: string) {
  return BOOKING_COPY[key][languageKey(lang)];
}

export function defaultTourPackage(lang: string) {
  return DEFAULT_TOUR_PACKAGE[languageKey(lang)];
}

