import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Backpack, CalendarDays, Check, ChevronRight, Clock, HelpCircle, Info, MapPin, Route, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import BirdwatchingTourPage from "@/app/components/tours/BirdwatchingTourPage";
import { getTourPriceDisplay } from "@/lib/tour-pricing";
import GoogleRating from "@/app/components/GoogleRating";
import { getTourGallery, getTourImage } from "@/lib/tour-display";
import { getLocalizedTourContent } from "@/lib/tour-content-localized";
import type { TourDetail } from "@/lib/tours/detail";
import { BUSINESS_WHATSAPP_URL, SITE_URL } from "@/lib/site-config";
import JsonLd from "@/app/components/seo/JsonLd";
import SharedPageShell from "@/app/components/layouts/SharedPageShell";

type Locale = "es" | "en";
type TourDetailPageProps = { tour: TourDetail; locale: Locale };

export default function TourDetailPage({ tour, locale }: TourDetailPageProps) {
  const isEnglish = locale === "en";
  const copy = isEnglish ? { home: "Home", tours: "Tours", breadcrumb: "Breadcrumb", book: "Book this tour", back: "Back to booking", whatsapp: "Ask on WhatsApp", duration: "Duration", difficulty: "Difficulty", location: "Location", from: "From", overview: "About this experience", highlights: "Tour highlights", itinerary: "How the route works", included: "Included", notIncluded: "Not included", bring: "What to bring", know: "Good to know before you go", faqs: "Frequently asked questions", packages: "Available packages", select: "Select", ask: "Ask us", costaRica: "Costa Rica", image: "image" } : { home: "Inicio", tours: "Tours", breadcrumb: "Migas de pan", book: "Reservar este tour", back: "Volver a reserva", whatsapp: "Consultar por WhatsApp", duration: "Duración", difficulty: "Nivel", location: "Ubicación", from: "Desde", overview: "Sobre esta experiencia", highlights: "Lo mejor del tour", itinerary: "Cómo es el recorrido", included: "Incluye", notIncluded: "No incluye", bring: "Qué llevar", know: "Bueno saber antes de ir", faqs: "Preguntas frecuentes", packages: "Paquetes disponibles", select: "Seleccionar", ask: "Consultar", costaRica: "Costa Rica", image: "imagen" };
  const prefix = isEnglish ? "/en" : "";
  const content = getLocalizedTourContent(tour, locale);
  const title = (isEnglish ? tour.titleEn : tour.titleEs) || tour.titleEs || tour.titleEn || "Tour";
  const description = isEnglish ? tour.descriptionEn || tour.descriptionEs : tour.details || tour.descriptionEs || tour.descriptionEn;
  const difficulty = tour.difficulty.trim();
  const tourSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: title,
    url: `${SITE_URL}${prefix}/tour/${encodeURIComponent(tour.slug)}`,
    description,
    ...(difficulty ? { touristType: difficulty } : {}),
    ...(tour.location ? { itinerary: { "@type": "Place", name: tour.location } } : {}),
    provider: { "@type": "Organization", name: "La Vieja Adventures", url: SITE_URL },
    offers: tour.packages
      .filter((pkg) => Number.isFinite(pkg.price) && pkg.price > 0)
      .map((pkg) => ({
        "@type": "Offer",
        name: (isEnglish ? pkg.name : pkg.nameEs) || pkg.name,
        price: String(pkg.price),
        priceCurrency: "USD",
        url: `${SITE_URL}${prefix}/reservar?tour=${encodeURIComponent(tour.slug)}${pkg.id ? `&package=${encodeURIComponent(pkg.id)}` : ""}`,
      })),
  };

  const tourUrl = `${SITE_URL}${prefix}/tour/${encodeURIComponent(tour.slug)}`;
  const tourImage = getTourImage(tour.slug);
  if (tourImage) Object.assign(tourSchema, { image: tourImage.startsWith("http") ? tourImage : `${SITE_URL}${tourImage}` });
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: copy.home, item: `${SITE_URL}${prefix}` },
      { "@type": "ListItem", position: 2, name: copy.tours, item: `${SITE_URL}${prefix}/tours` },
      { "@type": "ListItem", position: 3, name: title, item: tourUrl },
    ],
  };
  const whatsappHref = `${BUSINESS_WHATSAPP_URL}?text=${encodeURIComponent(isEnglish ? `Hello, I would like to ask about ${title}.` : `Hola, me interesa el tour ${title}. ¿Tienen disponibilidad?`)}`;

  const isBirdwatching = tour.slug === "avistamiento-aves" || tour.slug === "avistamiento-aves-norteno";
  if (!isEnglish && isBirdwatching && content) {
    return <><JsonLd data={tourSchema} /><JsonLd data={breadcrumbSchema} /><BirdwatchingTourPage tour={tour} content={content} /></>;
  }

  const gallery = content && content.gallery.length > 0 ? content.gallery : getTourGallery(tour.slug);
  const heroImage = content?.gallery[0] ?? getTourImage(tour.slug);
  const bookingHref = `${prefix}/reservar?tour=${encodeURIComponent(tour.slug)}`;
  const bookingHrefForPackage = (packageId?: string | null) => {
    const packageParam = packageId ? `&package=${encodeURIComponent(packageId)}` : "";
    return `${prefix}/reservar?tour=${encodeURIComponent(tour.slug)}${packageParam}`;
  };
  const heroTagline = content?.tagline || tour.tagEs || "";
  const overview = content?.overview.length ? content.overview : [description];
  const inclusions = content?.included.length
    ? content.included
    : tour.inclusions.length > 0
      ? tour.inclusions
      : [];

  return (
    <SharedPageShell className="tour-detail-page" footer>
      <JsonLd data={tourSchema} />
      <JsonLd data={breadcrumbSchema} />

      <section className="relative min-h-[78vh] overflow-hidden pt-24">
        <Image src={heroImage} alt={title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/35" />

        <div className="container relative z-10 mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end px-4 pb-10 md:px-8">
          <nav aria-label={copy.breadcrumb} className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/75">
            <Link href={prefix || "/"} className="transition hover:text-white">{copy.home}</Link>
            <ChevronRight className="h-4 w-4" aria-hidden />
            <Link href={`${prefix}/tours`} className="transition hover:text-white">{copy.tours}</Link>
            <ChevronRight className="h-4 w-4" aria-hidden />
            <span className="truncate text-white">{title}</span>
          </nav>

          <div className="max-w-4xl">
            <GoogleRating dark />
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.32em] text-cyan-300">
              {tour.tagEs || "Experiencia La Vieja"}
            </p>
            <h1 className="max-w-3xl text-[36px] font-black leading-[1.08] text-white md:text-[48px]">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-200 md:text-lg">
              {description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={bookingHref} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#00C4B0] px-6 py-2 text-sm font-black uppercase tracking-[0.14em] text-[#17211f] shadow-lg shadow-[#00C4B0]/25 transition hover:bg-white">
                {copy.book}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href={`${prefix}/reservar`} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white/50 hover:bg-white/15">
                {copy.back}
              </Link>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/15 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-400/25">
                {copy.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-4 md:px-8">
        <InfoCard icon={<Clock className="h-4 w-4" />} label={copy.duration} value={tour.duration || copy.ask} />
        <InfoCard icon={<ShieldCheck className="h-4 w-4" />} label={copy.difficulty} value={tour.difficulty || copy.ask} />
        <InfoCard icon={<MapPin className="h-4 w-4" />} label={copy.location} value={tour.location || copy.costaRica} />
        <InfoCard icon={<Users className="h-4 w-4" />} label={copy.from} value={getTourPriceDisplay(tour, !isEnglish).compact} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <div>
          <h2 className="text-[28px] font-black leading-[1.08] text-white md:text-[36px]">{copy.overview}</h2>
          {heroTagline && (
            <p className="mt-3 text-base font-bold italic leading-relaxed text-cyan-200/90">{heroTagline}</p>
          )}
          <div className="mt-4 space-y-4">
            {overview.map((paragraph, index) => (
              <p key={index} className="text-base leading-relaxed text-zinc-300">
                {paragraph}
              </p>
            ))}
          </div>

          {content && content.highlights.length > 0 && (
            <div className="mt-8 rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.04] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
                <Sparkles className="h-5 w-5 text-cyan-300" aria-hidden />
                {copy.highlights}
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {content.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
                    <span className="text-sm leading-relaxed text-zinc-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
          {gallery.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="relative h-56 w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl sm:h-64"
            >
              <Image src={image} alt={`${title} — ${copy.image} ${index + 1}`} fill sizes="(min-width: 768px) 40vw, 100vw" loading={index === 0 ? "eager" : "lazy"} className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {content && content.itinerary.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
          <div className="mb-6 flex items-center gap-4">
          <h2 className="flex items-center gap-2 text-[28px] font-black leading-[1.08] text-white md:text-[36px]">
              <Route className="h-6 w-6 text-cyan-300" aria-hidden />
              {copy.itinerary}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>
          <ol className="relative ml-3 space-y-6 border-l border-white/10 pl-6">
            {content.itinerary.map((stop, index) => (
              <li key={index} className="relative">
                <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-cyan-300 bg-black" aria-hidden>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                </span>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {stop.time && (
                    <span className="rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-xs font-black tabular-nums text-cyan-200">
                      {stop.time}
                    </span>
                  )}
                  <h3 className="text-base font-black text-white">{stop.title}</h3>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{stop.description}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 md:grid-cols-2 md:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
            <Check className="h-5 w-5 text-cyan-300" aria-hidden />
            {copy.included}
          </h3>
          <ul className="space-y-3">
            {inclusions.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
                <span className="text-sm leading-relaxed text-zinc-200">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {content && content.notIncluded.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
              <X className="h-5 w-5 text-rose-300/80" aria-hidden />
              {copy.notIncluded}
            </h3>
            <ul className="space-y-3">
              {content.notIncluded.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-300/70" aria-hidden />
                  <span className="text-sm leading-relaxed text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {content && (content.whatToBring.length > 0 || content.goodToKnow.length > 0) && (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 md:grid-cols-2 md:px-8">
          {content.whatToBring.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
                <Backpack className="h-5 w-5 text-cyan-300" aria-hidden />
                {copy.bring}
              </h3>
              <ul className="space-y-3">
                {content.whatToBring.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
                    <span className="text-sm leading-relaxed text-zinc-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {content.goodToKnow.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
                <Info className="h-5 w-5 text-cyan-300" aria-hidden />
                {copy.know}
              </h3>
              <ul className="space-y-3">
                {content.goodToKnow.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
                    <span className="text-sm leading-relaxed text-zinc-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {content && content.faqs.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
          <div className="mb-6 flex items-center gap-4">
            <h2 className="flex items-center gap-2 text-[28px] font-black leading-[1.08] text-white md:text-[36px]">
              <HelpCircle className="h-6 w-6 text-cyan-300" aria-hidden />
              {copy.faqs}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>
          <div className="space-y-3">
            {content.faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-base font-bold text-white">
                  {faq.q}
                  <ChevronRight className="h-4 w-4 shrink-0 text-cyan-300 transition-transform group-open:rotate-90" aria-hidden />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {tour.packages.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
          <div className="mb-6 flex items-center gap-4">
            <h2 className="text-[28px] font-black leading-[1.08] text-white md:text-[36px]">{copy.packages}</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {tour.packages.map((pkg) => (
              <div key={pkg.id ?? pkg.name} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-lg font-black text-white">{(isEnglish ? pkg.name : pkg.nameEs) || pkg.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-relaxed text-zinc-400">{(isEnglish ? pkg.descriptionEn : pkg.descriptionEs) || pkg.descriptionEn}</p>
                <p className="mt-4 text-2xl font-black text-cyan-200">{getTourPriceDisplay({ packages: [pkg] }, !isEnglish).compact}</p>
                <Link href={bookingHrefForPackage(pkg.id)} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#00C4B0] px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-[#17211f] transition hover:bg-white">
                  {copy.select}
                  <CalendarDays className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

    </SharedPageShell>
  );
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
        {icon}
        {label}
      </p>
      <p className="text-base font-bold leading-snug text-white">{value}</p>
    </div>
  );
}

