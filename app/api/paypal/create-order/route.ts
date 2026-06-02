// app/api/paypal/create-order/route.ts

import { NextResponse } from "next/server";
import {
  getPayPalApiBaseUrl,
  getPayPalAccessToken,
} from "@/lib/paypal";

import { getDb } from "@/lib/mongodb";
import { PAYPAL_CURRENCY, PAYPAL_CUSTOM_ID_MAX_LENGTH } from "@/lib/constants/paypal";
import { COLLECTIONS } from "@/lib/constants/db";
import { DEFAULT_AVAILABILITY } from "@/lib/constants/business";

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
  countryCode?: string;
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
      countryCode,
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

    // === Improved Package Lookup ===
    const selectedPackage = findPackageByLegacyOrCurrentId(availablePackages, packageId || tourPackage);

    if (!selectedPackage) {
      console.error("Package lookup failed - Selected package is no longer available", {
        tourSlug,
        packageId,
        tourPackage,
        availablePackages: availablePackages.map((p) => ({
          id: p.id,
          name: p.name,
          nameEs: p.nameEs,
        })),
      });

      return NextResponse.json(
        { 
          success: false, 
          message: "Selected package is no longer available",
          debug: {
            input: packageId || tourPackage,
            availableCount: availablePackages.length,
            tourSlug,
          }
        },
        { status: 400 }
      );
    }

    const remainingCapacity = await getRemainingCapacityForTourDate({
      db,
      tourSlug,
      date: normalizedDate,
    });

    if (safeTickets > remainingCapacity) {
      return NextResponse.json(
        {
          success: false,
          message: "Not enough availability remains for this tour and date.",
          selectedDate: normalizedDate,
          tourSlug,
          requestedTickets: safeTickets,
          remainingCapacity,
        },
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

    const payer = createPayPalPayer({ name, email, phone, countryCode });
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
        payer,
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
      console.error("PayPal Create Order Error:", { status: res.status, data });
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

  const legacyMap: Record<string, string> = {
    "basic": "essential-package",
    "full-day": "lunch-package",
    "full_day": "lunch-package",
    "private": "private-package",
    "standard": "essential-package",
    // Add more mappings as needed
  };

  return legacyMap[normalized] || normalized;
}

function findPackageByLegacyOrCurrentId(
  packages: any[], 
  input: string | undefined
): any | null {
  if (!input || !packages?.length) return null;

  const normalizedInput = normalizePackageLookup(input);
  const legacyMapped = resolveLegacyPackageId(input);

  return packages.find((pkg) => {
    const candidates = [
      pkg.id,
      pkg.name,
      pkg.nameEs,
      pkg._id?.toString?.(), // in case of ObjectId
    ].filter(Boolean).map(normalizePackageLookup);

    return candidates.includes(normalizedInput) || 
           candidates.includes(normalizePackageLookup(legacyMapped));
  });
}

function getPackageLabel(tourPackage: string | undefined, selectedPackage: any, language: string): string {
  if (tourPackage === "basic") return "Paquete Básico";
  if (tourPackage === "full-day") return "Día Completo con Almuerzo";
  if (tourPackage === "private") return "Tour Privado";

  return language === "en"
    ? selectedPackage.name
    : selectedPackage.nameEs || selectedPackage.name;
}

async function getRemainingCapacityForTourDate({
  db,
  tourSlug,
  date,
}: {
  db: Awaited<ReturnType<typeof getDb>>;
  tourSlug?: string;
  date: string;
}): Promise<number> {
  const dateParts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateParts) return 0;

  const [, yearRaw, monthRaw, dayRaw] = dateParts;
  const localDate = new Date(Number(yearRaw), Number(monthRaw) - 1, Number(dayRaw));
  const isWeekend = localDate.getDay() === 0 || localDate.getDay() === 6;
  const capacity = isWeekend ? DEFAULT_AVAILABILITY.WEEKEND : DEFAULT_AVAILABILITY.WEEKDAY;

  const query: Record<string, unknown> = {
    date,
    status: {
      $in: ["COMPLETED", "completed", "confirmed", "CONFIRMED"],
    },
  };

  if (tourSlug?.trim()) {
    query.tourSlug = tourSlug.trim();
  }

  const existingReservations = await db
    .collection(COLLECTIONS.RESERVATIONS)
    .find(query, { projection: { tickets: 1 } })
    .toArray();

  const reserved = existingReservations.reduce((sum, doc) => {
    const tickets = typeof doc.tickets === "number" ? doc.tickets : Number(doc.tickets ?? 0);
    return Number.isFinite(tickets) && tickets > 0 ? sum + tickets : sum;
  }, 0);

  return Math.max(0, capacity - reserved);
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

function normalizeCountryCode(countryCode: unknown): string {
  const normalizedCountryCode = String(countryCode ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalizedCountryCode) ? normalizedCountryCode : "CR";
}

function createPayPalPayer({
  name,
  email,
  phone,
  countryCode,
}: {
  name?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
}) {
  const trimmedName = String(name ?? "").trim().replace(/\s+/g, " ");
  const nameParts = trimmedName.split(" ").filter(Boolean);
  const givenName = nameParts[0] ?? undefined;
  const surname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;
  const nationalPhone = String(phone ?? "").replace(/^\+\d{1,3}\s*/, "").replace(/\D/g, "");
  const normalizedCountryCode = normalizeCountryCode(countryCode);

  return {
    email_address: String(email ?? "").trim(),
    address: {
      country_code: normalizedCountryCode,
    },
    ...(givenName && surname
      ? {
          name: {
            given_name: givenName,
            surname,
          },
        }
      : {}),
    ...(nationalPhone
      ? {
          phone: {
            phone_type: "MOBILE",
            phone_number: {
              national_number: nationalPhone,
            },
          },
        }
      : {}),
  };
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
  }
}
