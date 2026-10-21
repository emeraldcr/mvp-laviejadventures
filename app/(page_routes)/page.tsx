export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import HomeClient from "@/app/HomeClient";
import HomeServerFaq from "@/app/home/HomeServerFaq";
import { getPublicTours } from "@/lib/tours/read";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/", "Ciudad Esmeralda: Tour de Cañón en San Carlos, CR", "Cañón del Río La Vieja hasta la Cascada El Zafiro: guía local bilingüe, pozas turquesa y paquetes de aventura en San Carlos.", "es");

export default async function HomePage() {
  const tours = await getPublicTours();
  return <HomeClient tours={tours}><HomeServerFaq /></HomeClient>;
}
