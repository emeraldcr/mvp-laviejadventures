import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTour } from "@/lib/tours/detail";
import { getTourImage, getTourShareImage } from "@/lib/tour-display";
import { getTourPriceDisplay } from "@/lib/tour-pricing";
import { tourDifficulty, tourDuration } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL, BUSINESS_WHATSAPP_URL } from "@/lib/site-config";
import HomeNav from "@/app/components/home/HomeNav";
import GoogleRating from "@/app/components/GoogleRating";
import JsonLd from "@/app/components/seo/JsonLd";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const tour = await getTour(slug);
  if (!tour) notFound();
  return pageMetadata(`/tour/${slug}`, tour.titleEn, tour.descriptionEn, "en", getTourShareImage(slug));
}

export default async function EnglishTour({ params }: Props) {
  const { slug } = await params;
  const tour = await getTour(slug);
  if (!tour) notFound();
  const booking = `/en/reservar?tour=${encodeURIComponent(tour.slug)}`;
  const offers = tour.packages.filter(pkg => Number.isFinite(pkg.price) && pkg.price > 0).map(pkg => ({
    "@type": "Offer", name: pkg.name, price: String(pkg.price), priceCurrency: "USD",
    url: `${SITE_URL}${booking}${pkg.id ? `&package=${encodeURIComponent(pkg.id)}` : ""}`,
  }));
  const schema = { "@context": "https://schema.org", "@type": "TouristTrip", name: tour.titleEn, description: tour.descriptionEn,
    url: `${SITE_URL}/en/tour/${slug}`, ...(tour.difficulty ? { touristType: tourDifficulty(tour.difficulty, "en") } : {}),
    ...(tour.location ? { itinerary: { "@type": "Place", name: tour.location } } : {}),
    provider: { "@type": "Organization", name: "La Vieja Adventures", url: `${SITE_URL}/en` }, offers };
  return <main className="min-h-screen bg-[#FAF9F6] text-stone-900 dark:bg-stone-950 dark:text-white">
    <HomeNav /><JsonLd data={schema} />
    <section className="relative flex min-h-[75svh] items-end bg-stone-950 px-5 pb-12 pt-28 text-white">
      <Image src={getTourImage(slug)} alt={tour.titleEn} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
      <div className="relative mx-auto w-full max-w-6xl space-y-6">
        <Link href="/en/tours" className="inline-flex min-h-11 items-center underline">All tours</Link>
        <h1 className="max-w-4xl text-[36px] font-black leading-[1.08] md:text-[48px]">{tour.titleEn}</h1>
        <p className="max-w-3xl text-lg leading-relaxed">{tour.descriptionEn}</p>
        <GoogleRating locale="en" dark />
        <div className="flex flex-wrap gap-3"><Link href={booking} className="inline-flex min-h-12 items-center rounded-full bg-[#00C4B0] px-7 font-bold text-stone-950">Book now</Link><a href={`${BUSINESS_WHATSAPP_URL}?text=${encodeURIComponent(`Hello, I would like to ask about ${tour.titleEn}.`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-full border border-white/60 px-7 font-bold">Ask on WhatsApp</a></div>
      </div>
    </section>
    <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10 sm:grid-cols-3">
      {[['Duration', tourDuration(tour.duration, 'en')],['Difficulty', tourDifficulty(tour.difficulty, 'en')],['From / person', getTourPriceDisplay(tour, false).compact]].map(([label,value])=><div key={label} className="rounded-2xl border border-stone-300 p-5 dark:border-stone-700"><h2 className="text-sm font-bold text-[#00796B] dark:text-teal-300">{label}</h2><p className="mt-2 text-xl font-bold">{value}</p></div>)}
    </section>
    <section className="mx-auto max-w-6xl px-5 pb-12"><h2 className="text-3xl font-bold">Choose your package</h2><p className="mt-3 text-stone-600 dark:text-stone-300">Prices are per person. Review the final total and terms before payment. Confirm special requirements and your meeting time with our team.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-3">{tour.packages.map(pkg=><article key={pkg.id || pkg.name} className="rounded-3xl border border-stone-300 bg-white p-6 dark:border-stone-700 dark:bg-stone-900"><h3 className="text-xl font-bold">{pkg.name}</h3><p className="mt-3 leading-relaxed">{pkg.descriptionEn}</p><ul className="mt-4 list-inside list-disc space-y-2">{pkg.includes?.map(item=><li key={item}>{item}</li>)}</ul><p className="mt-5 text-lg font-bold">{getTourPriceDisplay({packages:[pkg]}, false).compact} / person</p><Link href={`${booking}${pkg.id ? `&package=${encodeURIComponent(pkg.id)}` : ''}`} className="mt-5 inline-flex min-h-12 items-center rounded-full bg-[#00796B] px-5 font-bold text-white">Select package</Link></article>)}</div>
    </section>
    <section className="mx-auto max-w-6xl space-y-4 px-5 pb-24"><h2 className="text-2xl font-bold">Plan your visit</h2><p>Bring comfortable clothing, secure footwear with good grip, water and any personal medication. Ask our team for the requirements that apply to your activity, including age, fitness, group size and transport.</p><p>For river activities, bring a dry change of clothes and protect your phone from water. Heavy rain or a rising river can change the route or require rescheduling. Your guide makes the safety decision.</p><p>Meeting point: {tour.location || 'Sucre de Ciudad Quesada, San Carlos, Costa Rica'}. Confirm the exact meeting time when booking.</p></section>
  </main>;
}
