import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getOperatorFromRequest } from "@/lib/b2b-auth";
import { createBooking, findBookingsByOperator } from "@/lib/models/booking";
import { B2B_TOURS } from "@/lib/b2b-tours";

export async function GET(req: NextRequest) {
  const operator = getOperatorFromRequest(req);
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");

  let bookings = await findBookingsByOperator(operator.id);

  if (statusFilter && statusFilter !== "all") {
    bookings = bookings.filter((b) => b.status === statusFilter);
  }

  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  const operator = getOperatorFromRequest(req);
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tourId, clientName, clientEmail, clientPhone, pax, date, notes } =
      await req.json();

    if (!tourId || !clientName || !clientEmail || !clientPhone || !pax || !date) {
      return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
    }

    const tour = B2B_TOURS.find((t) => t.id === tourId);
    if (!tour) {
      return NextResponse.json({ error: "Tour not found." }, { status: 404 });
    }

    if (pax < tour.minPax || pax > tour.maxPax) {
      return NextResponse.json(
        { error: `Pax must be between ${tour.minPax} and ${tour.maxPax}.` },
        { status: 400 }
      );
    }

    const totalPrice = tour.retailPricePerPax * pax;
    const commissionAmount = Math.round(totalPrice * (operator.commissionRate / 100));

    const result = await createBooking({
      operatorId: new ObjectId(operator.id),
      tourId,
      tourName: tour.name,
      clientName,
      clientEmail,
      clientPhone,
      pax: Number(pax),
      date: new Date(date),
      totalPrice,
      commissionAmount,
      status: "pending",
      notes: notes || "",
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Booking created successfully.", bookingId: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("B2B booking create error:", err);
    return NextResponse.json({ error: "Failed to create booking." }, { status: 500 });
  }
}
