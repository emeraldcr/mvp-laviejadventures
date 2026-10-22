export const revalidate = 300;
import { ToursClient } from "@/app/(page_routes)/tours/ToursClient";
import { getPublicTours } from "@/lib/tours/read";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/tours", "Adventure Tours in San Carlos, Costa Rica", "Adventure tours in Costa Rica: Ciudad Esmeralda Canyon, waterfalls, natural pools, hiking, birdwatching and ATV rides with local guides in San Carlos.", "en");
export default async function EnglishTours() { return <ToursClient tours={await getPublicTours()} />; }
