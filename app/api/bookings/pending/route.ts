import { NextResponse } from "next/server";
import { getDb } from "@/lib/helpers/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";
import {
  getMinBookableIsoDateInCostaRica,
  isDateOnOrAfterMinBookableInCostaRica,
} from "@/lib/helpers/costa-rica-time";
import { buildReservationReferenceCode } from "@/lib/reservation/checkout-messages";
import type { ReservationAddonDetails } from "@/lib/reservation/types";

type PendingPaymentMethod = "whatsapp" | "sinpe";

interface PendingBookingRequest {
  name?: string;
  email?: string;
  phone?: string;
  tickets?: number | string;
  total?: number | string;
  date?: string;
  dateIso?: string;
  tourTime?: string;
  packageId?: string;
  tourPackage?: string;
  tourSlug?: string;
  tourName?: string;
  packagePrice?: number | string;
  addons?: string[];
  addonIds?: string[];
  addonDetails?: ReservationAddonDetails;
  specialRequests?: string;
  language?: string;
  paymentMethod?: PendingPaymentMethod;
}

function normalizeOrderDate(date: unknown, dateIso: unknown): string | null {
  const tryParse = (value: unknown): string | null => {
    if (typeof value !== "string" || !value.trim()) return null;

    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return value;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;

    return parsed.toISOString().split("T")[0];
  };

  return tryParse(dateIso) ?? tryParse(date);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PendingBookingRequest;

    const {
      name,
      email,
      phone,
      tickets,
      total,
      date,
      dateIso,
      tourTime,
      packageId,
      tourPackage,
      tourSlug,
      tourName,
      packagePrice,
      addons,
      addonIds,
      addonDetails,
      specialRequests,
      language = "es",
      paymentMethod = "whatsapp",
    } = body;

    if (!name || !email || !phone || !tickets || !date || !tourPackage || !tourName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const safeTickets = Number(tickets);
    const safeTotal = Number(total);
    const safePackagePrice = Number(packagePrice);

    if (!Number.isFinite(safeTickets) || safeTickets < 1) {
      return NextResponse.json(
        { success: false, message: "Invalid ticket quantity" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(safeTotal) || safeTotal <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid total amount" },
        { status: 400 },
      );
    }

    const normalizedDate = normalizeOrderDate(date, dateIso);
    if (!normalizedDate) {
      return NextResponse.json(
        { success: false, message: "Invalid reservation date format" },
        { status: 400 },
      );
    }

    if (!isDateOnOrAfterMinBookableInCostaRica(normalizedDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected date is no longer available. Please choose the next available day.",
          minBookableDate: getMinBookableIsoDateInCostaRica(),
          selectedDate: normalizedDate,
        },
        { status: 400 },
      );
    }

    const safePaymentMethod: PendingPaymentMethod =
      paymentMethod === "sinpe" ? "sinpe" : "whatsapp";

    const referenceCode = buildReservationReferenceCode(
      `${email}-${normalizedDate}-${tourSlug ?? tourName}-${Date.now()}`,
    );

    const db = await getDb();
    const result = await db.collection(COLLECTIONS.RESERVATIONS).insertOne({
      orderId: null,
      captureId: null,
      referenceCode,
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      date: normalizedDate,
      tickets: safeTickets,
      amount: safeTotal,
      currency: "USD",
      status: "pending_payment",
      paymentStatus: "not_paid",
      paymentMethod: safePaymentMethod,
      source: "web_checkout",
      tourTime: tourTime?.trim() || null,
      tourPackage: String(tourPackage).trim(),
      tourSlug: tourSlug?.trim() || null,
      tourName: String(tourName).trim(),
      packageId: packageId?.trim() || null,
      packagePrice: Number.isFinite(safePackagePrice) ? safePackagePrice : null,
      addons: Array.isArray(addons) ? addons : [],
      addonIds: Array.isArray(addonIds) ? addonIds : [],
      addonDetails: addonDetails ?? {},
      specialRequests: typeof specialRequests === "string" ? specialRequests.trim() : "",
      language: language === "en" ? "en" : "es",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      reservationId: result.insertedId.toString(),
      referenceCode,
    });
  } catch (error: unknown) {
    console.error("Pending booking route error:", error);
    const message = error instanceof Error ? error.message : "Unknown internal error";
    return NextResponse.json(
      { success: false, message: "Internal server error", error: message },
      { status: 500 },
    );
  }
}