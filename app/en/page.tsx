export const revalidate = 300;
import HomeClient from "@/app/HomeClient";
import HomeServerFaq from "@/app/home/HomeServerFaq";
import { getPublicTours } from "@/lib/tours/read";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/", "Ciudad Esmeralda Canyon, Costa Rica | La Vieja Adventures", "Discover Ciudad Esmeralda Canyon, La Vieja River and El Zafiro Waterfall in San Carlos. Adventure tours in Costa Rica with La Vieja Adventures.", "en");
export default async function EnglishHome() {
  return <HomeClient tours={await getPublicTours()}><HomeServerFaq locale="en" /></HomeClient>;
}
