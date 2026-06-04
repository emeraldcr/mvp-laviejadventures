import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { COLLECTIONS } from "@/lib/constants/db";
import { getDb } from "@/lib/mongodb";
import { normalizeMotoPart, serializeMotoPart } from "@/lib/moto-parts";

function isAuthorized(req: NextRequest): boolean {
  return Boolean(getAdminFromRequest(req));
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const parts = await db.collection(COLLECTIONS.MOTO_PARTS).find({}).sort({ createdAt: -1 }).toArray();

  return NextResponse.json({ parts: parts.map(serializeMotoPart) });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const normalized = normalizeMotoPart(body);
  if ("error" in normalized) return NextResponse.json({ error: normalized.error }, { status: 400 });

  const now = new Date().toISOString();
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.MOTO_PARTS).insertOne({
    ...normalized,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ message: "Moto part created.", id: result.insertedId.toString() });
}
