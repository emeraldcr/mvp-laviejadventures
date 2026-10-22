export type Locale = "es" | "en";

export const LOCALIZED_PATHS = new Set([
  "/", "/tours", "/info", "/galeria", "/reservar", "/reservar/voucher", "/mis-reservas", "/tiempo", "/preguntas-frecuentes",
  "/terminos-y-condiciones", "/politica-de-privacidad", "/organics",
]);

export function localeFromPath(path: string): Locale {
  return path === "/en" || path.startsWith("/en/") ? "en" : "es";
}

export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const match = href.match(/^([^?#]*)(.*)$/);
  const path = match?.[1] || "/";
  const suffix = match?.[2] || "";
  const spanishPath = path.replace(/^\/en(?=\/|$)/, "") || "/";
  if (locale === "es") return spanishPath + suffix;
  if (!LOCALIZED_PATHS.has(spanishPath) && !spanishPath.startsWith("/tour/")) return spanishPath + suffix;
  return (spanishPath === "/" ? "/en" : `/en${spanishPath}`) + suffix;
}

export function tourDifficulty(value: string | undefined, locale: Locale) {
  if (locale === "es" || !value) return value || "Consultar";
  const levels: Record<string, string> = {
    "Fácil": "Easy", Facil: "Easy", Moderado: "Moderate", Intermedio: "Intermediate",
    Extremo: "Extreme", "Intermedio a avanzado": "Intermediate to advanced",
  };
  return levels[value] || value;
}

export function tourDuration(value: string | undefined, locale: Locale) {
  return locale === "en" ? (value || "Ask us").replace(/horas?/gi, "hours").replace(/días?/gi, "days") : value || "Consultar";
}
