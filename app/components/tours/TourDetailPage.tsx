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
  const copy = isEnglish ? { home: "Home", tours: "Tours", breadcrumb: "Breadcrumb", book: "Book this tour", back: "Back to booking", whatsapp: "Ask on WhatsApp", duration: "Duration", difficulty: "Difficulty", location: "Location", from: "From", availability: "Availability", availabilityValue: "To be confirmed", overview: "About this experience", highlights: "Tour highlights", itinerary: "How the route works", included: "Included", notIncluded: "Not included", bring: "What to bring", know: "Good to know before you go", faqs: "Frequently asked questions", packages: "Available packages", select: "Select", ask: "Ask us", costaRica: "Costa Rica", image: "image", readyTitle: "Ready to plan your adventure?", readyBody: "Choose a date and our team will confirm availability before your reservation is finalized." } : { home: "Inicio", tours: "Tours", breadcrumb: "Migas de pan", book: "Reservar este tour", back: "Volver a reserva", whatsapp: "Consultar por WhatsApp", duration: "Duración", difficulty: "Nivel", location: "Ubicación", from: "Desde", availability: "Disponibilidad", availabilityValue: "Por confirmar", overview: "Sobre esta experiencia", highlights: "Lo mejor del tour", itinerary: "Cómo es el recorrido", included: "Incluye", notIncluded: "No incluye", bring: "Qué llevar", know: "Bueno saber antes de ir", faqs: "Preguntas frecuentes", packages: "Paquetes disponibles", select: "Seleccionar", ask: "Consultar", costaRica: "Costa Rica", image: "imagen", readyTitle: "¿Listo para planear su aventura?", readyBody: "Elija una fecha y nuestro equipo le confirma la disponibilidad antes de finalizar la reserva." };
  const prefix = isEnglish ? "/en" : "";
  const content = getLocalizedTourContent(tour, locale);
  const title = (isEnglish ? tour.titleEn : tour.titleEs) || tour.titleEs || tour.titleEn || "Tour";
  const description = isEnglish ? tour.descriptionEn || tour.descriptionEs : tour.details || tour.descriptionEs || tour.descriptionEn;
  const difficulty = tour.difficulty.trim();
  const physicalLevel = getPhysicalLevel(tour, locale);
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
  if (isBirdwatching && content) {
    return <><JsonLd data={tourSchema} /><JsonLd data={breadcrumbSchema} /><BirdwatchingTourPage tour={tour} content={content} locale={locale} /></>;
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

      <section className="lva-dark-section relative min-h-[78vh] overflow-hidden pt-24">
        <Image src={heroImage} alt={title} fill priority sizes="100vw" className="object-cover" />
        <div className="lva-hero-overlay absolute inset-0" />

        <div className="container relative z-10 mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end px-4 pb-10 md:px-8">
          <nav aria-label={copy.breadcrumb} className="lva-muted mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]">
            <Link href={prefix || "/"} className="lva-link transition">{copy.home}</Link>
            <ChevronRight className="h-4 w-4" aria-hidden />
            <Link href={`${prefix}/tours`} className="lva-link transition">{copy.tours}</Link>
            <ChevronRight className="h-4 w-4" aria-hidden />
            <span className="lva-heading truncate">{title}</span>
          </nav>

          <div className="max-w-4xl">
            <GoogleRating dark />
            <p className="lva-accent mb-3 text-[11px] font-black uppercase tracking-[0.32em]">
              {tour.tagEs || "Experiencia La Vieja"}
            </p>
            <h1 className="lva-heading max-w-3xl text-[36px] font-black leading-[1.08] md:text-[48px]">
              {title}
            </h1>
            <p className="lva-body mt-5 max-w-2xl text-base leading-relaxed md:text-lg">
              {description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={bookingHref} className="lva-button-primary uppercase tracking-[0.14em]">
                {copy.book}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href={`${prefix}/reservar`} className="lva-button-secondary uppercase tracking-[0.16em]">
                {copy.back}
              </Link>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="lva-button-whatsapp-outline uppercase tracking-[0.16em]">
                {copy.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={isEnglish ? "Tour summary" : "Resumen del tour"} className="lva-surface-muted mx-auto grid max-w-7xl gap-4 px-4 py-8 md:grid-cols-5 md:px-8 md:py-10">
        <InfoCard emphasized icon={<Users className="h-4 w-4" />} label={copy.from} value={getTourPriceDisplay(tour, !isEnglish).compact} />
        <InfoCard icon={<Clock className="h-4 w-4" />} label={copy.duration} value={tour.duration || copy.ask} />
        <InfoCard icon={<ShieldCheck className="h-4 w-4" />} label={copy.difficulty} value={physicalLevel} />
        <InfoCard icon={<MapPin className="h-4 w-4" />} label={copy.location} value={tour.location || copy.costaRica} />
        <InfoCard icon={<CalendarDays className="h-4 w-4" />} label={copy.availability} value={copy.availabilityValue} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <div>
          <h2 className="lva-heading text-[28px] font-black leading-[1.08] md:text-[36px]">{copy.overview}</h2>
          {heroTagline && (
            <p className="lva-accent mt-3 text-base font-bold italic leading-relaxed">{heroTagline}</p>
          )}
          <div className="mt-4 space-y-4">
            {overview.map((paragraph, index) => (
              <p key={index} className="lva-body text-base leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {content && content.highlights.length > 0 && (
            <div className="lva-card-accent mt-8 rounded-3xl p-6">
              <h3 className="lva-heading mb-4 flex items-center gap-2 text-lg font-black">
                <Sparkles className="lva-accent h-5 w-5" aria-hidden />
                {copy.highlights}
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {content.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ChevronRight className="lva-accent mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span className="lva-body text-sm leading-relaxed">{item}</span>
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
              className="lva-card relative h-56 w-full overflow-hidden rounded-3xl shadow-2xl sm:h-64"
            >
              <Image src={image} alt={`${title} — ${copy.image} ${index + 1}`} fill sizes="(min-width: 768px) 40vw, 100vw" loading={index === 0 ? "eager" : "lazy"} className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {content && content.itinerary.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
          <div className="mb-6 flex items-center gap-4">
          <h2 className="lva-heading flex items-center gap-2 text-[28px] font-black leading-[1.08] md:text-[36px]">
              <Route className="lva-accent h-6 w-6" aria-hidden />
              {copy.itinerary}
            </h2>
            <div className="lva-divider h-px flex-1" />
          </div>
          <ol className="relative ml-3 space-y-6 border-l lva-section-border pl-6">
            {content.itinerary.map((stop, index) => (
              <li key={index} className="relative">
                <span className="lva-timeline-dot absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full border-2" aria-hidden>
                  <span className="lva-accent h-1.5 w-1.5 rounded-full bg-current" />
                </span>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {stop.time && (
                    <span className="lva-chip rounded-full px-2.5 py-0.5 text-xs font-black tabular-nums">
                      {stop.time}
                    </span>
                  )}
                  <h3 className="lva-heading text-base font-black">{stop.title}</h3>
                </div>
                <p className="lva-muted mt-1.5 text-sm leading-relaxed">{stop.description}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 md:grid-cols-2 md:px-8">
        <div className="lva-card rounded-3xl p-6">
          <h3 className="lva-heading mb-4 flex items-center gap-2 text-lg font-black">
            <Check className="lva-accent h-5 w-5" aria-hidden />
            {copy.included}
          </h3>
          <ul className="space-y-3">
            {inclusions.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="lva-accent mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span className="lva-body text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {content && content.notIncluded.length > 0 && (
          <div className="lva-card lva-card-danger rounded-3xl p-6">
            <h3 className="lva-heading mb-4 flex items-center gap-2 text-lg font-black">
              <X className="h-5 w-5 text-[#be185d]" aria-hidden />
              {copy.notIncluded}
            </h3>
            <ul className="space-y-3">
              {content.notIncluded.map((item) => (
                <li key={item} className="flex items-start gap-3">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-[#be185d]" aria-hidden />
                <span className="lva-body text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {content && (content.whatToBring.length > 0 || content.goodToKnow.length > 0) && (
        <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 md:grid-cols-2 md:px-8">
          {content.whatToBring.length > 0 && (
            <div className="lva-card rounded-3xl p-6">
              <h3 className="lva-heading mb-4 flex items-center gap-2 text-lg font-black">
                <Backpack className="lva-accent h-5 w-5" aria-hidden />
                {copy.bring}
              </h3>
              <ul className="space-y-3">
                {content.whatToBring.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ChevronRight className="lva-accent mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span className="lva-body text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {content.goodToKnow.length > 0 && (
            <div className="lva-card rounded-3xl p-6">
              <h3 className="lva-heading mb-4 flex items-center gap-2 text-lg font-black">
                <Info className="lva-accent h-5 w-5" aria-hidden />
                {copy.know}
              </h3>
              <ul className="space-y-3">
                {content.goodToKnow.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ChevronRight className="lva-accent mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span className="lva-body text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="lva-card-accent flex flex-col items-start justify-between gap-5 rounded-3xl p-6 md:flex-row md:items-center md:p-8">
          <div>
            <h2 className="lva-heading text-2xl font-black">{copy.readyTitle}</h2>
            <p className="lva-body mt-2 max-w-2xl text-sm leading-relaxed">{copy.readyBody}</p>
          </div>
          <Link href={bookingHref} className="lva-button-primary shrink-0 uppercase tracking-[0.14em]">
            {copy.book}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      {content && content.faqs.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
          <div className="mb-6 flex items-center gap-4">
            <h2 className="lva-heading flex items-center gap-2 text-[28px] font-black leading-[1.08] md:text-[36px]">
              <HelpCircle className="lva-accent h-6 w-6" aria-hidden />
              {copy.faqs}
            </h2>
            <div className="lva-divider h-px flex-1" />
          </div>
          <div className="space-y-3">
            {content.faqs.map((faq) => (
              <details key={faq.q} className="lva-card group rounded-2xl p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="lva-heading flex cursor-pointer items-center justify-between gap-3 text-base font-bold">
                  {faq.q}
                  <ChevronRight className="lva-accent h-4 w-4 shrink-0 transition-transform group-open:rotate-90" aria-hidden />
                </summary>
                <p className="lva-muted mt-3 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {tour.packages.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
          <div className="mb-6 flex items-center gap-4">
            <h2 className="lva-heading text-[28px] font-black leading-[1.08] md:text-[36px]">{copy.packages}</h2>
            <div className="lva-divider h-px flex-1" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {tour.packages.map((pkg) => (
              <div key={pkg.id ?? pkg.name} className="lva-card rounded-3xl p-5">
                <h3 className="lva-heading text-lg font-black">{(isEnglish ? pkg.name : pkg.nameEs) || pkg.name}</h3>
                <p className="lva-muted mt-2 min-h-12 text-sm leading-relaxed">{(isEnglish ? pkg.descriptionEn : pkg.descriptionEs) || pkg.descriptionEn}</p>
                <p className="lva-accent mt-4 text-2xl font-black">{getTourPriceDisplay({ packages: [pkg] }, !isEnglish).compact}</p>
                <Link href={bookingHrefForPackage(pkg.id)} className="lva-button-primary mt-5 w-full uppercase tracking-[0.12em]">
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

function getPhysicalLevel(tour: TourDetail, locale: Locale) {
  const isEnglish = locale === "en";
  const slug = tour.slug.toLowerCase();
  const isRappel = slug.includes("rapel") || slug.includes("rappel");
  const isCanyon = slug.includes("ciudad-esmeralda") || slug.includes("canon") || slug.includes("canyon");

  if (isRappel) {
    return {
      label: isEnglish ? "Physical level" : "Nivel físico",
      level: isEnglish ? "High" : "Alto",
      detail: isEnglish
        ? "Requires walking, getting wet, and taking part in rappelling. Not recommended if you have mobility limitations."
        : "Requiere caminar, mojarse y participar en rappel. No recomendado si tiene limitaciones de movilidad.",
    };
  }

  if (isCanyon) {
    return {
      label: isEnglish ? "Physical level" : "Nivel físico",
      level: isEnglish ? "Intermediate-technical" : "Intermedio-técnico",
      detail: isEnglish
        ? "Requires walking on uneven terrain and getting wet. The guide evaluates river and weather conditions before departure."
        : "Requiere caminar por terreno irregular y mojarse. El guía evalúa las condiciones del río y el clima antes de salir.",
    };
  }

  const rawDifficulty = tour.difficulty.trim().toLowerCase();
  const level = rawDifficulty.includes("fácil") || rawDifficulty.includes("facil") || rawDifficulty.includes("easy")
    ? (isEnglish ? "Low" : "Bajo")
    : rawDifficulty.includes("extremo") || rawDifficulty.includes("avanz") || rawDifficulty.includes("extreme") || rawDifficulty.includes("advanced")
      ? (isEnglish ? "High" : "Alto")
      : (isEnglish ? "Moderate" : "Moderado");

  return {
    label: isEnglish ? "Physical level" : "Nivel físico",
    level,
    detail: isEnglish ? "Check the route details and ask our team about the conditions for your group." : "Revise el recorrido y consulte las condiciones para su grupo.",
  };
}

function InfoCard({ icon, label, value, emphasized = false }: { icon: ReactNode; label: string; value: string | { label: string; level: string; detail: string }; emphasized?: boolean }) {
  const detailValue = typeof value === "string" ? null : value;
  const displayValue = typeof value === "string" ? value : `${value.label}: ${value.level}`;
  return (
    <div className={`lva-card rounded-3xl p-5 ${emphasized ? "ring-2 ring-[var(--lva-accent)]/40" : ""}`}>
      <p className="lva-accent mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em]">
        {icon}
        {label}
      </p>
      <p className={`lva-heading font-bold leading-snug ${emphasized ? "text-xl" : "text-base"}`}>{displayValue}</p>
      {detailValue && <p className="lva-muted mt-2 text-sm leading-relaxed">{detailValue.detail}</p>}
    </div>
  );
}

