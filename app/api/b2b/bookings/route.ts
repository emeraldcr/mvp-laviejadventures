import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getOperatorFromRequest } from "@/lib/b2b-auth";
import { createBooking, findBookingsByOperator } from "@/lib/models/booking";
import { sendBookingConfirmationEmail } from "@/lib/email/b2b-emails";
import { getB2BCatalog } from "@/lib/b2b-catalog";

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
    const { tourId, packageId, clientName, clientEmail, clientPhone, pax, date, notes } =
      await req.json();

    if (!tourId || !packageId || !clientName || !clientEmail || !clientPhone || !pax || !date) {
      return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
    }

    const { tours, ivaRate } = await getB2BCatalog();
    const tour = tours.find((t) => t.id === tourId);
    if (!tour) {
      return NextResponse.json({ error: "Tour not found." }, { status: 404 });
    }

    const selectedPackage = tour.packages.find((pkg) => pkg.id === packageId);
    if (!selectedPackage) {
      return NextResponse.json({ error: "Package not found." }, { status: 404 });
    }

    if (pax < tour.minPax || pax > tour.maxPax) {
      return NextResponse.json(
        { error: `Pax must be between ${tour.minPax} and ${tour.maxPax}.` },
        { status: 400 }
      );
    }

    const subtotal = selectedPackage.priceCRC * Number(pax);
    const ivaAmount = Math.round(subtotal * (ivaRate / 100));
    const totalPrice = subtotal + ivaAmount;
    const commissionAmount = Math.round(totalPrice * (operator.commissionRate / 100));

    const result = await createBooking({
      operatorId: new ObjectId(operator.id),
      tourId,
      tourName: `${tour.name} (${selectedPackage.name})`,
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

    const bookingId = result.insertedId.toString();

    sendBookingConfirmationEmail({
      operatorEmail: operator.email,
      operatorName: operator.name,
      bookingId,
      tourName: `${tour.name} (${selectedPackage.name})`,
      clientName,
      clientEmail,
      pax: Number(pax),
      date: new Date(date).toLocaleDateString("es-CR"),
      totalPrice,
      commissionAmount,
      currency: tour.currency,
    }).catch(console.error);

    return NextResponse.json(
      { message: "Booking created successfully.", bookingId },
      { status: 201 }
    );
  } catch (err) {
    console.error("B2B booking create error:", err);
    return NextResponse.json({ error: "Failed to create booking." }, { status: 500 });
  }
}
