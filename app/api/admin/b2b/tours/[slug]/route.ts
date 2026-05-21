import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";

function isAuthorized(req: NextRequest): boolean { return Boolean(getAdminFromRequest(req)); }

function normalizeTour(body: Record<string, unknown>) {
  return { titleEs: String(body.titleEs ?? "").trim(), titleEn: String(body.titleEn ?? "").trim(), descriptionEs: String(body.descriptionEs ?? "").trim(), descriptionEn: String(body.descriptionEn ?? "").trim(), duration: String(body.duration ?? "").trim(), difficulty: String(body.difficulty ?? "").trim(), location: String(body.location ?? "").trim(), priceCRC: Number(body.priceCRC ?? 0), retailPricePerPax: Number(body.retailPricePerPax ?? body.priceCRC ?? 0), minPax: Number(body.minPax ?? 1), maxPax: Number(body.maxPax ?? 20), includes: Array.isArray(body.includes) ? body.includes.map((item) => String(item)) : [], type: String(body.type ?? "both"), isActive: body.isActive !== false, isFeatured: Boolean(body.isFeatured), currency: String(body.currency ?? "CRC"), updatedAt: new Date().toISOString() };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params; const body = await req.json(); const normalized = normalizeTour(body);
  const db = await getDb(); const result = await db.collection(COLLECTIONS.TOURS).updateOne({ slug }, { $set: normalized });
  if (result.matchedCount === 0) return NextResponse.json({ error: "Tour not found." }, { status: 404 });
  return NextResponse.json({ message: "Tour updated." });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params; const db = await getDb(); const result = await db.collection(COLLECTIONS.TOURS).deleteOne({ slug });
  if (result.deletedCount === 0) return NextResponse.json({ error: "Tour not found." }, { status: 404 });
  return NextResponse.json({ message: "Tour deleted." });
}
