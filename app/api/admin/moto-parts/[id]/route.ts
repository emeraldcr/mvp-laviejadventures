import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { COLLECTIONS } from "@/lib/constants/db";
import { getDb } from "@/lib/mongodb";
import { normalizeMotoPart } from "@/lib/moto-parts";

function isAuthorized(req: NextRequest): boolean {
  return Boolean(getAdminFromRequest(req));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid part id." }, { status: 400 });

  const body = await req.json();
  const normalized = normalizeMotoPart(body);
  if ("error" in normalized) return NextResponse.json({ error: normalized.error }, { status: 400 });

  const db = await getDb();
  const result = await db.collection(COLLECTIONS.MOTO_PARTS).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...normalized,
        updatedAt: new Date().toISOString(),
      },
    },
  );

  if (result.matchedCount === 0) return NextResponse.json({ error: "Moto part not found." }, { status: 404 });

  return NextResponse.json({ message: "Moto part updated." });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid part id." }, { status: 400 });

  const db = await getDb();
  const result = await db.collection(COLLECTIONS.MOTO_PARTS).deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) return NextResponse.json({ error: "Moto part not found." }, { status: 404 });

  return NextResponse.json({ message: "Moto part deleted." });
}
