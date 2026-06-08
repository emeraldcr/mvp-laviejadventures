import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, ChevronRight, Clock, MapPin, ShieldCheck, Users } from "lucide-react";
import DynamicHeroHeader from "@/app/components/sections/DynamicHeroHeader";
import { getDb } from "@/lib/helpers/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";
import { fallbackPackagesForTour, normalizeTourPackages } from "@/lib/tour-packages";
import { getTourGallery, getTourImage } from "@/lib/tour-display";
import type { TourPackageOption } from "@/lib/types/index";

export const dynamic = "force-dynamic";

type TourDetailPageProps = {
  params: Promise<{ slug: string }>;
};

type TourDetail = {
  slug: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  details: string;
  duration: string;
  difficulty: string;
  location: string;
  priceCRC: number;
  tagEs: string;
  inclusions: string[];
  restrictions: string;
  cancellationPolicy: string;
  packages: TourPackageOption[];
};

const DEFAULT_TOUR: TourDetail = {
  slug: "tour-ciudad-esmeralda",
  titleEs: "Tour Ciudad Esmeralda",
  titleEn: "Ciudad Esmeralda Tour",
  descriptionEs: "Adentrate en el Canon del Rio La Vieja y descubre Ciudad Esmeralda entre senderos, pozas naturales y paisajes de aventura.",
  descriptionEn: "Explore La Vieja River Canyon and discover Ciudad Esmeralda through trails, natural pools, and adventure landscapes.",
  details: "Recorrido guiado por senderos, rio y canon hacia Cascada El Zafiro. Ideal para viajeros que quieren una experiencia natural con buena dosis de aventura.",
  duration: "3-4 horas",
  difficulty: "Moderado",
  location: "Juan Castro Blanco, Alajuela Norte, Costa Rica",
  priceCRC: 21000,
  tagEs: "Aventura",
  inclusions: ["Guia certificado", "Equipo de seguridad", "Ingreso a zonas naturales", "Briefing de seguridad"],
  restrictions: "Recomendado para personas en buenas condiciones fisicas.",
  cancellationPolicy: "Cancelacion gratuita hasta 48 horas antes del tour.",
  packages: fallbackPackagesForTour("tour-ciudad-esmeralda"),
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function formatPriceCRC(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "Consultar";
  return `CRC ${value.toLocaleString("es-CR").replace(/,/g, ".")}`;
}

async function getTour(slug: string): Promise<TourDetail | null> {
  try {
    const db = await getDb();
    const tour = await db.collection(COLLECTIONS.TOURS).findOne({
      slug,
      isActive: { $ne: false },
      type: { $in: ["public", "both"] },
    });

    if (!tour) return slug === DEFAULT_TOUR.slug ? DEFAULT_TOUR : null;

    const packages = normalizeTourPackages(tour.packages);

    return {
      slug: String(tour.slug ?? slug),
      titleEs: String(tour.titleEs ?? tour.name ?? DEFAULT_TOUR.titleEs),
      titleEn: String(tour.titleEn ?? tour.name ?? tour.titleEs ?? DEFAULT_TOUR.titleEn),
      descriptionEs: String(tour.descriptionEs ?? tour.details ?? ""),
      descriptionEn: String(tour.descriptionEn ?? tour.descriptionEs ?? tour.details ?? ""),
      details: String(tour.details ?? tour.descriptionEs ?? tour.descriptionEn ?? ""),
      duration: String(tour.duration ?? ""),
      difficulty: String(tour.difficulty ?? ""),
      location: String(tour.location ?? ""),
      priceCRC: Number(tour.priceCRC ?? tour.retailPricePerPax ?? 0),
      tagEs: String(tour.tagEs ?? ""),
      inclusions: asStringArray(tour.inclusions ?? tour.includes),
      restrictions: String(tour.restrictions ?? ""),
      cancellationPolicy: String(tour.cancellationPolicy ?? ""),
      packages: packages.length > 0 ? packages : fallbackPackagesForTour(String(tour.slug ?? slug)),
    };
  } catch (error) {
    console.error("Failed to load tour detail:", error);
    return slug === DEFAULT_TOUR.slug ? DEFAULT_TOUR : null;
  }
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = await params;
  const tour = await getTour(slug);

  if (!tour) notFound();

  const gallery = getTourGallery(tour.slug);
  const heroImage = getTourImage(tour.slug);
  const bookingHref = `/?tour=${encodeURIComponent(tour.slug)}#booking`;
  const bookingHrefForPackage = (packageId?: string | null) => {
    const packageParam = packageId ? `&package=${encodeURIComponent(packageId)}` : "";
    return `/?tour=${encodeURIComponent(tour.slug)}${packageParam}#booking`;
  };
  const title = tour.titleEs || tour.titleEn || "Tour";
  const description = tour.details || tour.descriptionEs || tour.descriptionEn;
  const inclusions = tour.inclusions.length > 0 ? tour.inclusions : DEFAULT_TOUR.inclusions;

  return (
    <main className="min-h-screen bg-black text-white">
      <DynamicHeroHeader showHeroSlider={false} />

      <section className="relative min-h-[78vh] overflow-hidden pt-24">
        <img src={heroImage} alt={title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/35" />

        <div className="container relative z-10 mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end px-4 pb-10 md:px-8">
          <Link href="/#tours" className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/45 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur transition hover:border-cyan-300 hover:text-cyan-200">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Tours
          </Link>

          <div className="max-w-4xl">
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.32em] text-cyan-300">
              {tour.tagEs || "Experiencia La Vieja"}
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-200 md:text-lg">
              {description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={bookingHref} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black shadow-lg shadow-cyan-950/60 transition hover:bg-white">
                Reservar este tour
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/#booking" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white/50 hover:bg-white/15">
                Volver a reserva
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-4 md:px-8">
        <InfoCard icon={<Clock className="h-4 w-4" />} label="Duracion" value={tour.duration || "Consultar"} />
        <InfoCard icon={<ShieldCheck className="h-4 w-4" />} label="Nivel" value={tour.difficulty || "Consultar"} />
        <InfoCard icon={<MapPin className="h-4 w-4" />} label="Ubicacion" value={tour.location || "Costa Rica"} />
        <InfoCard icon={<Users className="h-4 w-4" />} label="Desde" value={formatPriceCRC(tour.priceCRC)} />
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 md:grid-cols-[1.1fr_0.9fr] md:px-8">
        <div>
          <h2 className="text-2xl font-black text-white">Mas informacion</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-300">
            {description}
          </p>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h3 className="mb-4 text-lg font-black text-white">Incluye</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {inclusions.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/35 p-4">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
                  <span className="text-sm leading-relaxed text-zinc-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
          {gallery.map((image, index) => (
            <img
              key={`${image}-${index}`}
              src={image}
              alt={`${title} ${index + 1}`}
              className="h-56 w-full rounded-3xl border border-white/10 object-cover shadow-2xl sm:h-64"
            />
          ))}
        </div>
      </section>

      {tour.packages.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
          <div className="mb-6 flex items-center gap-4">
            <h2 className="text-2xl font-black text-white">Paquetes disponibles</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {tour.packages.map((pkg) => (
              <div key={pkg.id ?? pkg.name} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-lg font-black text-white">{pkg.nameEs || pkg.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-relaxed text-zinc-400">{pkg.descriptionEs || pkg.descriptionEn}</p>
                <p className="mt-4 text-2xl font-black text-cyan-200">${pkg.price} USD</p>
                <Link href={bookingHrefForPackage(pkg.id)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white">
                  Seleccionar
                  <CalendarDays className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
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
