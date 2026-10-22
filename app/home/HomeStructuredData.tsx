import { localizeHref, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site-config";
import { getTourImage } from "@/lib/tour-display";
import type { TourSummary } from "@/lib/types/index";
import JsonLd from "@/app/components/seo/JsonLd";

export default function HomeStructuredData({ tours, locale }: { tours: TourSummary[]; locale: Locale }) {
  const items = tours.map((tour, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: locale === "en" ? tour.titleEn : tour.titleEs,
    url: `${SITE_URL}${localizeHref(`/tour/${encodeURIComponent(tour.slug)}`, locale)}`,
    image: `${SITE_URL}${getTourImage(tour.slug)}`,
  }));

  return <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", name: locale === "en" ? "Nature and adventure tours in San Carlos" : "Tours de naturaleza y aventura en San Carlos", numberOfItems: items.length, itemListElement: items }} />;
}
