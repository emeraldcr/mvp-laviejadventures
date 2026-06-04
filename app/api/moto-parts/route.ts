import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/constants/db";
import { getDb } from "@/lib/mongodb";
import { serializeMotoPart } from "@/lib/moto-parts";

export async function GET() {
  try {
    const db = await getDb();
    const parts = await db
      .collection(COLLECTIONS.MOTO_PARTS)
      .find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ parts: parts.map(serializeMotoPart) });
  } catch {
    return NextResponse.json({ parts: [] }, { status: 200 });
  }
}
