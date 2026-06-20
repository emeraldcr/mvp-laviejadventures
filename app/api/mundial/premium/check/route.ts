import { NextResponse } from "next/server";
import { getDb } from "@/lib/helpers/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playerKey = searchParams.get("name")?.trim().toUpperCase();

  if (!playerKey) {
    return NextResponse.json({ hasPremium: false });
  }

  try {
    const db = await getDb();
    const record = await db.collection(COLLECTIONS.MUNDIAL_PREMIUM).findOne({ playerKey });
    return NextResponse.json({ hasPremium: Boolean(record) });
  } catch {
    return NextResponse.json({ hasPremium: false });
  }
}
