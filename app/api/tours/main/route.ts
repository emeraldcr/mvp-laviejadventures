// app/api/tours/main/route.ts
// Returns the main booking tour info from MongoDB, seeding defaults if not found

import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const DEFAULT_MAIN_TOUR = {
  slug: "tour-ciudad-esmeralda",
  isMain: true,
  isActive: true,
  name: "Tour a Ciudad Esmeralda, Cañón del Río La Vieja",
  operator: "Operado por La Vieja Adventures",
  duration: "3-4 horas",
  price: "₡25,000 por persona",
  location: "San Isidro de El General, Pérez Zeledón, Costa Rica",
  inclusions: [
    "Entrada a instalaciones.",
    "Guía profesional bilingüe (español e inglés).",
    "Recorrido de 3.5 km entre senderos, río y cañón hacia Cascada El Zafiro.",
    "Equipo de seguridad necesario para el tour.",
  ],
  exclusions: [
    "Transporte hacia y desde el lugar del tour, alimentación y bebidas.",
  ],
  cancellationPolicy:
    "Cancelaciones con al menos 48 horas de anticipación para reembolso completo.",
  details:
    "Entrada a instalaciones, guía profesional (3-4h), recorrido 3.5 km entre senderos, río y cañón hacia Cascada El Zafiro.",
  restrictions: "Solo adultos en buenas condiciones físicas.",
  contact: {
    whatsapp: "6233-2535",
    email: "ciudadesmeraldacr@gmail.com",
    youtube: "https://www.youtube.com/@laviejaadventures",
    facebook: "https://www.facebook.com/laviejaadventures",
    twitter: "https://x.com/adventuresvieja",
    instagram: "https://www.instagram.com/laviejadventures",
  },
  // B2B fields
  type: "both",
  iconName: "Star",
  titleEs: "Tour Ciudad Esmeralda – Cañón del Río La Vieja",
  titleEn: "Ciudad Esmeralda Tour – La Vieja River Canyon",
  descriptionEs:
    "Una experiencia única en el cañón del Río La Vieja. Caminata por senderos selváticos, baño en pozas naturales y vistas impresionantes del cañón.",
  descriptionEn:
    "A unique experience in the La Vieja River Canyon. Hiking through jungle trails, swimming in natural pools and impressive canyon views.",
  difficulty: "Moderado",
  priceCRC: 25000,
  retailPricePerPax: 25000,
  currency: "CRC",
  minPax: 1,
  maxPax: 20,
  tagEs: "Aventura",
  tagEn: "Adventure",
  accent: "from-teal-900/40 to-teal-950/60",
  border: "border-teal-700/30 hover:border-teal-500/60",
  includes: [
    "Guía certificado",
    "Equipo de seguridad",
    "Seguro de accidentes",
    "Acceso al área protegida",
  ],
  isFeatured: true,
};

export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection("tours");

    let tour = await collection.findOne({ isMain: true, isActive: { $ne: false } });

    // Seed default if not found
    if (!tour) {
      await collection.updateOne(
        { slug: DEFAULT_MAIN_TOUR.slug },
        { $set: DEFAULT_MAIN_TOUR },
        { upsert: true }
      );
      tour = await collection.findOne({ isMain: true });
    }

    if (!tour) {
      return NextResponse.json({ error: "Main tour not found" }, { status: 404 });
    }

    return NextResponse.json({
      tour: {
        name: tour.name,
        operator: tour.operator,
        duration: tour.duration,
        price: tour.price,
        location: tour.location,
        inclusions: tour.inclusions ?? [],
        exclusions: tour.exclusions ?? [],
        cancellationPolicy: tour.cancellationPolicy ?? "",
        details: tour.details ?? "",
        restrictions: tour.restrictions ?? "",
        contact: tour.contact ?? {},
      },
    });
  } catch (err) {
    console.error("GET /api/tours/main error:", err);
    return NextResponse.json({ error: "Failed to fetch main tour" }, { status: 500 });
  }
}
