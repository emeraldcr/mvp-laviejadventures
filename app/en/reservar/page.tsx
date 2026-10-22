import { pageMetadata } from "@/lib/seo";
export { default } from "@/app/(page_routes)/reservar/page";
export const metadata = { ...pageMetadata("/reservar", "Book Your San Carlos Tour", "Choose your tour, date, group size and package. Review the final booking price and terms before paying.", "en"), robots: { index: false, follow: true } };
