// app/(page_routes)/tours/page.tsx
// Server component: fetches tours from MongoDB and passes to client component

import { getDb } from "@/lib/mongodb";
import { ToursClient, type TourData } from "./ToursClient";

export const dynamic = "force-dynamic";

async function getTours(): Promise<TourData[]> {
  try {
    const db = await getDb();
    const collection = db.collection("tours");

    const docs = await collection
      .find({ type: { $in: ["public", "both"] }, isActive: { $ne: false }, isMain: { $ne: true } })
      .sort({ isFeatured: -1, priceCRC: 1 })
      .toArray();

    return docs.map((t) => ({
      id: t._id.toString(),
      slug: t.slug ?? "",
      iconName: t.iconName ?? "Star",
      titleEs: t.titleEs ?? "",
      titleEn: t.titleEn ?? "",
      descriptionEs: t.descriptionEs ?? "",
      descriptionEn: t.descriptionEn ?? "",
      duration: t.duration ?? "",
      difficulty: t.difficulty ?? "Fácil",
      priceCRC: t.priceCRC ?? 0,
      tagEs: t.tagEs ?? "",
      tagEn: t.tagEn ?? "",
      accent: t.accent ?? "from-zinc-900/40 to-zinc-950/60",
      border: t.border ?? "border-zinc-700/30",
      isFeatured: t.isFeatured ?? false,
      isMain: t.isMain ?? false,
    }));
  } catch (err) {
    console.error("Failed to load tours from MongoDB:", err);
    return [];
  }
}

export default async function ToursPage() {
  const tours = await getTours();
  return <ToursClient tours={tours} />;
}
