import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { readPublicTours } from "@/lib/tours/public-catalog";
import { localizeHref } from "@/lib/i18n";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["/", "/info", "/tours", "/galeria", "/reservar", "/tiempo", "/organics", "/preguntas-frecuentes", "/terminos-y-condiciones", "/politica-de-privacidad"];
  let tours: Awaited<ReturnType<typeof readPublicTours>> = [];
  try {
    tours = await readPublicTours();
  } catch {
    tours = [];
  }
  const tourRoutes = tours.map((tour) => `/tour/${encodeURIComponent(tour.slug)}`);
  return [...routes, ...tourRoutes].flatMap((route) => ["es", "en"].map((locale) => ({
    url: `${SITE_URL}${localizeHref(route, locale === "en" ? "en" : "es")}`,
    changeFrequency: "weekly" as const,
    priority: route === "/" ? 1 : route.startsWith("/tour/") ? 0.8 : 0.6,
    alternates: { languages: { es: `${SITE_URL}${route}`, en: `${SITE_URL}${localizeHref(route, "en")}`, "x-default": `${SITE_URL}${route}` } },
  })));
}
