import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/info", "/tours", "/galeria", "/reservar", "/tiempo", "/organics", "/preguntas-frecuentes", "/terminos-y-condiciones", "/politica-de-privacidad"];
  return routes.map((route) => ({ url: `${SITE_URL}${route}`, lastModified: new Date(), changeFrequency: route === "/tiempo" ? "hourly" : route === "/" || route === "/tours" ? "weekly" : "monthly", priority: route === "/" ? 1 : route === "/tours" ? 0.9 : 0.6 }));
}
