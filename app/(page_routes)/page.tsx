export const revalidate = 300;
import { Suspense } from "react";
import type { Metadata } from "next";
import HomeClient from "@/app/HomeClient";
import HomeServerFaq from "@/app/home/HomeServerFaq";
import { getPublicTours } from "@/lib/tours/read";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("/", "Ciudad Esmeralda Costa Rica | La Vieja Adventures", "Explore el cañón Ciudad Esmeralda en San Carlos, Costa Rica: Río La Vieja, Cascada El Zafiro y pozas turquesa con guías locales de La Vieja Adventures.", "es");

async function HomeWithTours() {
  const tours = await getPublicTours();
  return <HomeClient tours={tours}><HomeServerFaq /></HomeClient>;
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeClient tours={[]}><HomeServerFaq /></HomeClient>}>
      <HomeWithTours />
    </Suspense>
  );
}
