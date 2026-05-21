import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";

function isAuthorized(req: NextRequest): boolean { return Boolean(getAdminFromRequest(req)); }

function normalizeTour(body: Record<string, unknown>) {
  const slug = String(body.slug ?? "").trim();
  if (!slug) return { error: "slug is required" };
  return { slug, titleEs: String(body.titleEs ?? "").trim(), titleEn: String(body.titleEn ?? "").trim(), descriptionEs: String(body.descriptionEs ?? "").trim(), descriptionEn: String(body.descriptionEn ?? "").trim(), duration: String(body.duration ?? "").trim(), difficulty: String(body.difficulty ?? "").trim(), location: String(body.location ?? "").trim(), priceCRC: Number(body.priceCRC ?? 0), retailPricePerPax: Number(body.retailPricePerPax ?? body.priceCRC ?? 0), minPax: Number(body.minPax ?? 1), maxPax: Number(body.maxPax ?? 20), includes: Array.isArray(body.includes) ? body.includes.map((item) => String(item)) : [], type: String(body.type ?? "both"), isActive: body.isActive !== false, isFeatured: Boolean(body.isFeatured), currency: String(body.currency ?? "CRC") };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb(); const tours = await db.collection(COLLECTIONS.TOURS).find({}).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ tours: tours.map((tour) => ({ ...tour, _id: tour._id.toString() })) });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json(); const normalized = normalizeTour(body); if ("error" in normalized) return NextResponse.json({ error: normalized.error }, { status: 400 });
  const db = await getDb(); const existing = await db.collection(COLLECTIONS.TOURS).findOne({ slug: normalized.slug }); if (existing) return NextResponse.json({ error: "Tour slug already exists." }, { status: 409 });
  await db.collection(COLLECTIONS.TOURS).insertOne({ ...normalized, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  return NextResponse.json({ message: "Tour created." });
}
