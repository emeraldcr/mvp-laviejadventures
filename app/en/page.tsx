export const revalidate = 300;
import HomeClient from "@/app/HomeClient";
import HomeServerFaq from "@/app/home/HomeServerFaq";
import { getPublicTours } from "@/lib/tours/read";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/", "Ciudad Esmeralda Canyon Tour in San Carlos, CR", "Explore La Vieja River Canyon and El Zafiro Waterfall with local bilingual guides. Compare packages and book your Costa Rica adventure.", "en");
export default async function EnglishHome() {
  return <HomeClient tours={await getPublicTours()}><HomeServerFaq locale="en" /></HomeClient>;
}
