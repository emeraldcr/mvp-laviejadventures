import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { COLLECTIONS } from "@/lib/constants/db";
import { getDb } from "@/lib/mongodb";
import { getManualReservationPackage } from "@/lib/manual-reservation";
import { isDateOnOrAfterMinBookableInCostaRica } from "@/lib/costa-rica-time";

type ManualReservationPayload = {
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  tickets?: number;
  tourName?: string;
  tourSlug?: string;
  tourTime?: string;
  tourPackage?: string;
  notes?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as ManualReservationPayload;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const phone = body.phone?.trim() ?? "";
    const date = body.date?.trim() ?? "";
    const tourName = body.tourName?.trim() ?? "";
    const tourSlug = body.tourSlug?.trim() ?? "";
    const tourTime = body.tourTime?.trim() ?? "";
    const tourPackage = body.tourPackage?.trim() ?? "";
    const notes = body.notes?.trim() ?? "";
    const tickets = Number(body.tickets ?? 0);

    if (!name || !email || !phone || !date || !tourName || !tourSlug || !tourTime || !tourPackage || !Number.isInteger(tickets) || tickets < 1) {
      return NextResponse.json({ error: "All required fields must be completed." }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "The email address is not valid." }, { status: 400 });
    }

    if (!isDateOnOrAfterMinBookableInCostaRica(date)) {
      return NextResponse.json({ error: "Reservation date must be at least the next available day in Costa Rica time." }, { status: 400 });
    }

    const selectedPackage = getManualReservationPackage(tourPackage);
    if (!selectedPackage) {
      return NextResponse.json({ error: "Package not found." }, { status: 404 });
    }

    const amount = selectedPackage.priceUSD * tickets;
    const now = new Date();
    const orderId = `MANUAL-${now.getTime()}`;

    const db = await getDb();
    const result = await db.collection(COLLECTIONS.RESERVATIONS).insertOne({
      orderId,
      captureId: null,
      status: "MANUAL_NO_PAYMENT",
      paymentMethod: "manual_admin",
      name,
      email,
      phone,
      date,
      tickets,
      amount,
      currency: "USD",
      tourTime,
      tourPackage,
      tourSlug,
      tourName,
      packagePrice: selectedPackage.priceUSD,
      notes,
      createdAt: now,
    });

    return NextResponse.json({
      message: "Manual reservation created successfully.",
      reservationId: result.insertedId.toString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Manual admin reservation error", error);
    return NextResponse.json({ error: "Failed to create manual reservation." }, { status: 500 });
  }
}
