import { GOOGLE_REVIEWS } from "@/lib/site-config";
import type { Locale } from "@/lib/i18n";

export default function GoogleRating({ locale = "es", dark = false }: { locale?: Locale; dark?: boolean }) {
  return <a href={GOOGLE_REVIEWS.url} target="_blank" rel="noopener noreferrer" data-google-rating className={`inline-flex flex-wrap items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${dark ? "border-white/30 bg-black/50 text-white" : "border-stone-300 bg-white text-stone-900"}`} title={locale === "es" ? "Opiniones de La Vieja Adventures en Google. Referencia: 21 octubre 2026." : "La Vieja Adventures reviews on Google. Reference: October 21, 2026."}>
    <span aria-hidden="true" className="text-amber-500">★</span><strong>{GOOGLE_REVIEWS.rating}/5</strong>
    <span>Google · {GOOGLE_REVIEWS.count} {locale === "es" ? "reseñas del operador" : "operator reviews"}</span>
  </a>;
}
