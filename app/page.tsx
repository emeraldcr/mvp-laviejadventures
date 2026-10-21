import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import HomeServerFaq from "./home/HomeServerFaq";
import { SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Ciudad Esmeralda: Tour de Cañón en San Carlos, CR" },
  description: "Cañón del Río La Vieja hasta la Cascada El Zafiro: 3–4 h con guía local bilingüe. Desde US$40. Cancelación gratis hasta 48 h antes.",
  alternates: { canonical: `${SITE_URL}/` },
};

export default function HomePage() {
  return <HomeClient><HomeServerFaq /></HomeClient>;
}
