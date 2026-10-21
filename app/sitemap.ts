import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { readPublicTours } from "@/lib/tours/public-catalog";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ["/", "/info", "/tours", "/galeria", "/reservar", "/tiempo", "/organics", "/preguntas-frecuentes", "/terminos-y-condiciones", "/politica-de-privacidad"];
  const tours = await readPublicTours();
  const tourRoutes = tours.map((tour) => `/tour/${encodeURIComponent(tour.slug)}`);
  return [...routes, ...tourRoutes].map((route) => ({ url: `${SITE_URL}${route}`, lastModified: new Date(), changeFrequency: route === "/tiempo" ? "hourly" : route === "/" || route === "/tours" ? "weekly" : "monthly", priority: route === "/" ? 1 : route === "/tours" ? 0.9 : route.startsWith("/tour/") ? 0.8 : 0.6 }));
}
