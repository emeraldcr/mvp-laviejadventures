import { NextRequest, NextResponse } from "next/server";
import { getOperatorFromRequest } from "@/lib/b2b-auth";
import { getDb } from "@/lib/mongodb";
import { B2B_TOURS } from "@/lib/b2b-tours";

export async function GET(req: NextRequest) {
  const operator = getOperatorFromRequest(req);
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawTours: Array<{
    id: string;
    name: string;
    description: string;
    duration: string;
    retailPricePerPax: number;
    currency: string;
    minPax: number;
    maxPax: number;
    includes: string[];
    location: string;
    imageUrl?: string;
  }>;

  try {
    const db = await getDb();
    const docs = await db
      .collection("tours")
      .find({ type: { $in: ["b2b", "both"] }, isActive: { $ne: false } })
      .sort({ isFeatured: -1 })
      .toArray();

    if (docs.length > 0) {
      rawTours = docs.map((t) => ({
        id: t.slug ?? t._id.toString(),
        name: t.titleEs ?? t.name ?? "",
        description: t.descriptionEs ?? t.description ?? "",
        duration: t.duration ?? "",
        retailPricePerPax: t.retailPricePerPax ?? t.priceCRC ?? 0,
        currency: t.currency ?? "CRC",
        minPax: t.minPax ?? 1,
        maxPax: t.maxPax ?? 20,
        includes: t.includes ?? [],
        location: t.location ?? "",
        imageUrl: t.imageUrl,
      }));
    } else {
      // Fallback to static B2B_TOURS if MongoDB has no b2b tours
      rawTours = B2B_TOURS;
    }
  } catch (err) {
    console.error("Failed to load B2B tours from MongoDB:", err);
    rawTours = B2B_TOURS;
  }

  const toursWithCommission = rawTours.map((tour) => ({
    ...tour,
    commissionRate: operator.commissionRate,
    commissionPerPax: Math.round(tour.retailPricePerPax * (operator.commissionRate / 100)),
    netPricePerPax: Math.round(
      tour.retailPricePerPax * (1 - operator.commissionRate / 100)
    ),
  }));

  return NextResponse.json({ tours: toursWithCommission });
}
