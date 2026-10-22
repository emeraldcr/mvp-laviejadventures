import { NextResponse } from "next/server";
import { getDb } from "@/lib/helpers/mongodb";
import { quoteReservation, requiredReservationFieldsPresent, isReservationQuoteError } from "@/lib/reservation/quote";
import { saveReservationDraft, findReservationDraft } from "@/lib/reservation/drafts";
import type { ReservationAddonDetails } from "@/lib/reservation/types";

type DraftRequest = {
  resumeToken?: string;
  bookingAttemptId?: string;
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
};

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!token) return NextResponse.json({ success: false, message: "Missing resume token" }, { status: 400 });

  try {
    const draft = await findReservationDraft(await getDb(), token);
    if (!draft) return NextResponse.json({ success: false, message: "This resume link has expired or is invalid." }, { status: 404 });
    return NextResponse.json({ success: true, orderDetails: draft }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("GET reservation draft error:", error);
    return NextResponse.json({ success: false, message: "Unable to load this booking draft." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DraftRequest;
    if (!requiredReservationFieldsPresent({
      name: body.name,
      email: body.email,
      phone: body.phone,
      tickets: body.tickets,
      date: body.date,
      tourPackage: body.tourPackage,
      tourName: body.tourName,
    }, { requireTourName: true })) {
      return NextResponse.json({ success: false, message: "Missing required booking fields" }, { status: 400 });
    }

    const db = await getDb();
    const quote = await quoteReservation(db, body);
    const orderDetails = {
      bookingAttemptId: body.bookingAttemptId,
      name: String(body.name).trim(),
      email: String(body.email).trim(),
      phone: String(body.phone).trim(),
      tickets: quote.safeTickets,
      total: quote.totalWithTax,
      date: quote.normalizedDate,
      dateIso: body.dateIso,
      tourTime: String(body.tourTime ?? "").trim(),
      packageId: quote.selectedPackage.id ?? body.packageId,
      tourPackage: quote.packageLabel,
      tourSlug: String(body.tourSlug ?? "").trim(),
      tourName: String(body.tourName).trim(),
      packagePrice: quote.packagePrice,
      specialRequests: String(body.specialRequests ?? "").trim(),
      addons: Array.isArray(body.addons) ? body.addons : [],
      addonIds: Array.isArray(body.addonIds) ? body.addonIds : [],
      addonsPrice: quote.addonsPrice,
      addonsPricePerPerson: quote.addonsPricePerPerson,
      addonsBreakdown: quote.addonsBreakdown,
      addonDetails: body.addonDetails ?? {},
      transportQuote: quote.transportQuote,
    };
    const saved = await saveReservationDraft(db, orderDetails, body.resumeToken);
    return NextResponse.json({
      success: true,
      resumeToken: saved.resumeToken,
      expiresAt: saved.expiresAt.toISOString(),
      resumePath: `/reservation?resume=${encodeURIComponent(saved.resumeToken)}`,
      orderDetails: { ...orderDetails, resumeToken: saved.resumeToken },
    });
  } catch (error) {
    if (isReservationQuoteError(error)) {
      return NextResponse.json({ success: false, message: error.message, code: error.code, ...error.details }, { status: error.status });
    }
    console.error("POST reservation draft error:", error);
    return NextResponse.json({ success: false, message: "Unable to save this booking draft." }, { status: 503 });
  }
}
