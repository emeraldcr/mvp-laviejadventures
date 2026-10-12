import { NextResponse } from "next/server";
import { getReservationSettings } from "@/lib/models/reservation-settings";

export async function GET() {
  try {
    const settings = await getReservationSettings();
    return NextResponse.json({ ivaRate: settings?.ivaRate ?? 13 });
  } catch (error) {
    console.error("Public IVA settings GET error", error);
    return NextResponse.json({ ivaRate: 13 });
  }
}
