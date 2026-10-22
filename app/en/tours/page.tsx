export const revalidate = 300;
import { ToursClient } from "@/app/(page_routes)/tours/ToursClient";
import { getPublicTours } from "@/lib/tours/read";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/tours", "Tours in San Carlos, Costa Rica", "Canyon hikes, waterfalls, birdwatching, ATV rides, rappelling and local food experiences. Compare current packages with local guides.", "en");
export default async function EnglishTours() { return <ToursClient tours={await getPublicTours()} />; }
