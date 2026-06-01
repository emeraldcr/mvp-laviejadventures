// app/api/paypal/create-order/route.ts

import { NextResponse } from "next/server";
import {
  getPayPalApiBaseUrl,
  getPayPalAccessToken,
} from "@/lib/paypal";

import { getDb } from "@/lib/mongodb";
import { PAYPAL_CURRENCY, PAYPAL_CUSTOM_ID_MAX_LENGTH } from "@/lib/constants/paypal";
import { COLLECTIONS } from "@/lib/constants/db";

import {
  getMinBookableIsoDateInCostaRica,
  isDateOnOrAfterMinBookableInCostaRica,
} from "@/lib/costa-rica-time";

import { fallbackPackagesForTour, normalizeTourPackages } from "@/lib/tour-packages";
import { getB2BSettings } from "@/lib/models/b2b-settings";

interface CreateOrderRequest {
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
  language?: string;
}

interface CreateOrderResponse {
  id?: string;
  links?: Array<{ rel?: string; href?: string }>;
}

export async function POST(req: Request) {
  try {
    const body: CreateOrderRequest = await req.json();

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
      language = "es",
    } = body;

    // Basic validation
    if (!name || !email || !phone || !tickets || !date || !tourPackage) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const safeTickets = Number(tickets);
    if (!Number.isFinite(safeTickets) || safeTickets < 1) {
      return NextResponse.json(
        { success: false, message: "Invalid ticket quantity" },
        { status: 400 }
      );
    }

    // Normalize and validate date
    const normalizedDate = normalizeOrderDate(date, dateIso);
    if (!normalizedDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reservation date format",
          selectedDate: String(date),
        },
        { status: 400 }
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
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get tour and packages
    const tour = tourSlug
      ? await db.collection(COLLECTIONS.TOURS).findOne({
          slug: tourSlug,
          isActive: { $ne: false },
        })
      : null;

    const dbPackages = normalizeTourPackages(tour?.packages);
    const availablePackages = dbPackages.length > 0 ? dbPackages : fallbackPackagesForTour(tourSlug);

    const packageLookup = resolveLegacyPackageId(packageId || tourPackage);
    const selectedPackage = availablePackages.find((pkg) => {
      const candidates = [pkg.id, pkg.name, pkg.nameEs].map(normalizePackageLookup);
      return candidates.includes(packageLookup);
    });

    if (!selectedPackage) {
      return NextResponse.json(
        { success: false, message: "Selected package is no longer available" },
        { status: 400 }
      );
    }

    // Price calculation
    const settings = await getB2BSettings();
    const ivaRate = Number(settings?.ivaRate ?? 13) / 100;

    const packagePrice = Number(selectedPackage.price);
    const subtotal = safeTickets * packagePrice;
    const totalWithTax = subtotal * (1 + ivaRate);
    const formattedTotal = totalWithTax.toFixed(2);

    // Package label for user
    const packageLabel = getPackageLabel(tourPackage, selectedPackage, language);

    // Custom ID (PayPal limit = 127 chars)
    const custom_id = createCustomId({
      tickets: safeTickets,
      time: tourTime ?? null,
      pkg: packageLabel,
      packageId: selectedPackage.id ?? null,
      ppUSD: packagePrice,
      tourSlug: tourSlug ?? null,
      tourName: tourName ?? null,
      date: normalizedDate,
      lang: language === "en" ? "en" : "es",
    });

    const accessToken = await getPayPalAccessToken();

    const res = await fetch(`${getPayPalApiBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: PAYPAL_CURRENCY,
              value: formattedTotal,
            },
            description: `Reserva: ${safeTickets} pax - ${tourName ?? packageLabel}${tourTime ? ` (${tourTime})` : ""} - ${normalizedDate}`,
            custom_id,
          },
        ],
      }),
    });

    const data: CreateOrderResponse = await res.json();

    if (!res.ok || !data.id) {
      console.error("PayPal Create Order Error:", { status: res.status, data, orderPayload: body });
      return NextResponse.json(
        { success: false, message: "Failed to create PayPal order", error: data },
        { status: res.status || 500 }
      );
    }

    // Save context in database
    await saveOrderContext(data.id, {
      name,
      email,
      phone,
      tickets: safeTickets,
      date: normalizedDate,
      tourTime,
      packageId: selectedPackage.id,
      tourPackage: packageLabel,
      packagePrice,
      tourSlug,
      tourName,
      clientTotal: total ? Number(total) : null,
      total: totalWithTax,
      ivaRate: Number(settings?.ivaRate ?? 13),
      language: language === "en" ? "en" : "es",
    });

    const approvalUrl = data.links?.find((link) => link.rel === "approve")?.href;

    if (!approvalUrl) {
      console.error("No approval URL returned from PayPal", data);
      return NextResponse.json(
        { success: false, message: "Order created but no approval URL", orderID: data.id },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderID: data.id,
      approvalUrl,
    });
  } catch (error: unknown) {
    console.error("Create Order Route Error:", error);

    const message = error instanceof Error ? error.message : "Unknown internal error";

    return NextResponse.json(
      { success: false, message: "Internal server error", error: message },
      { status: 500 }
    );
  }
}

// ====================== Helper Functions ======================

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

function normalizePackageLookup(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function resolveLegacyPackageId(value: unknown): string {
  const normalized = normalizePackageLookup(value);
  if (normalized === "basic") return "essential-package";
  if (normalized === "full-day") return "lunch-package";
  if (normalized === "private") return "private-package";
  return normalized;
}

function getPackageLabel(tourPackage: string | undefined, selectedPackage: any, language: string): string {
  if (tourPackage === "basic") return "Paquete Básico";
  if (tourPackage === "full-day") return "Día Completo con Almuerzo";
  if (tourPackage === "private") return "Tour Privado";

  return language === "en"
    ? selectedPackage.name
    : selectedPackage.nameEs || selectedPackage.name;
}

function createCustomId(data: Record<string, any>): string {
  let payload = JSON.stringify(data);
  if (payload.length <= PAYPAL_CUSTOM_ID_MAX_LENGTH) return payload;

  // Fallback - shorter version
  return JSON.stringify({
    tickets: data.tickets,
    time: data.time,
    pkg: data.packageId ?? data.pkg,
    date: data.date,
    lang: data.lang,
  });
}

async function saveOrderContext(orderId: string, bookingData: any) {
  try {
    const db = await getDb();
    await db.collection(COLLECTIONS.PAYPAL_ORDER_CONTEXTS).updateOne(
      { orderId },
      {
        $set: {
          orderId,
          customer: {
            name: bookingData.name,
            email: bookingData.email,
            phone: bookingData.phone,
          },
          booking: bookingData,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("Failed to save PayPal order context:", err);
    // Don't throw - we still want to return the orderID to frontend
  }
}