import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { listOperators } from "@/lib/models/operator";
import { listUsers } from "@/lib/models/user";
import { listLoginLogs } from "@/lib/models/login-log";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";
import { listHeroSloganLogs } from "@/lib/models/hero-slogan-log";

type BookingAnalyticsEvent = {
  _id: string;
  event:
    | "booking_step"
    | "booking_submitted"
    | "booking_checkout_started"
    | "payment_order_created"
    | "payment_approved"
    | "payment_error"
    | "booking_completed";
  path: string | null;
  sessionId: string | null;
  happenedAt: string | null;
  createdAt: string | null;
  metadata: {
    step?: string | number;
    stepLabel?: string;
    stage?: string;
    tickets?: number;
    amount?: number;
    currency?: string;
    [key: string]: unknown;
  };
  user: {
    userId?: string | null;
    email?: string | null;
    name?: string | null;
  };
  request: {
    country?: string | null;
    city?: string | null;
    deviceType?: string | null;
    browser?: string | null;
    os?: string | null;
  };
};

const BOOKING_ANALYTICS_EVENTS: BookingAnalyticsEvent["event"][] = [
  "booking_step",
  "booking_submitted",
  "booking_checkout_started",
  "payment_order_created",
  "payment_approved",
  "payment_error",
  "booking_completed",
];

function isAuthorized(req: NextRequest): boolean {
  return Boolean(getAdminFromRequest(req));
}

function numberFrom(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function stringFrom(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function bookingMeta(event: BookingAnalyticsEvent) {
  const nested = event.metadata.booking && typeof event.metadata.booking === "object"
    ? event.metadata.booking as Record<string, unknown>
    : {};

  return {
    tourSlug: stringFrom(event.metadata.tourSlug) ?? stringFrom(nested.selectedTourSlug) ?? null,
    tourName: stringFrom(event.metadata.tourName) ?? stringFrom(nested.selectedTourName) ?? null,
    tourPackage: stringFrom(event.metadata.tourPackage) ?? stringFrom(nested.selectedPackage) ?? null,
    tourTime: stringFrom(event.metadata.tourTime) ?? stringFrom(nested.selectedTime) ?? null,
    date: stringFrom(event.metadata.date) ?? stringFrom(nested.selectedDate) ?? null,
    tickets: numberFrom(event.metadata.tickets) ?? numberFrom(nested.tickets),
    amount:
      numberFrom(event.metadata.amount) ??
      numberFrom(event.metadata.totalWithTaxes) ??
      numberFrom(nested.totalWithTaxes),
    currency: stringFrom(event.metadata.currency) ?? "USD",
  };
}

function countBy<T>(items: T[], keyFn: (item: T) => string | null | undefined) {
  return Object.entries(
    items.reduce<Record<string, number>>((acc, item) => {
      const key = keyFn(item);
      if (!key) return acc;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [operators, users, loginLogs, reservations, bookingAnalyticsRaw, heroSlogans] = await Promise.all([
      listOperators(),
      listUsers(),
      listLoginLogs(),
      (async () => {
        const db = await getDb();
        const docs = await db
          .collection(COLLECTIONS.RESERVATIONS)
          .find({})
          .sort({ createdAt: -1 })
          .toArray();

        return docs.map((reservation) => ({
          _id: reservation._id.toString(),
          name: reservation.name ?? null,
          email: reservation.email ?? null,
          date: reservation.date ?? null,
          tickets: reservation.tickets ?? null,
          amount: reservation.amount ?? null,
          currency: reservation.currency ?? null,
          status: reservation.status ?? null,
          tourName: reservation.tourName ?? null,
          createdAt: reservation.createdAt
            ? reservation.createdAt.toISOString()
            : null,
        }));
      })(),
      (async (): Promise<BookingAnalyticsEvent[]> => {
        const db = await getDb();
        const docs = await db
          .collection(COLLECTIONS.ANALYTICS_EVENTS)
          .find({ event: { $in: BOOKING_ANALYTICS_EVENTS } })
          .sort({ happenedAt: -1 })
          .limit(1000)
          .toArray();

        return docs.map((eventDoc) => ({
          _id: eventDoc._id.toString(),
          event: eventDoc.event,
          path: eventDoc.path ?? null,
          sessionId: eventDoc.sessionId ?? null,
          happenedAt: eventDoc.happenedAt instanceof Date ? eventDoc.happenedAt.toISOString() : null,
          createdAt: eventDoc.createdAt instanceof Date ? eventDoc.createdAt.toISOString() : null,
          metadata: (eventDoc.metadata ?? {}) as BookingAnalyticsEvent["metadata"],
          user: {
            userId: (eventDoc.user as { userId?: string | null } | undefined)?.userId ?? null,
            email: (eventDoc.user as { email?: string | null } | undefined)?.email ?? null,
            name: (eventDoc.user as { name?: string | null } | undefined)?.name ?? null,
          },
          request: {
            country: (eventDoc.request as { country?: string | null } | undefined)?.country ?? null,
            city: (eventDoc.request as { city?: string | null } | undefined)?.city ?? null,
            deviceType: (eventDoc.request as { deviceType?: string | null } | undefined)?.deviceType ?? null,
            browser: (eventDoc.request as { browser?: string | null } | undefined)?.browser ?? null,
            os: (eventDoc.request as { os?: string | null } | undefined)?.os ?? null,
          },
        }));
      })(),
      listHeroSloganLogs(),
    ]);

    const uniqueSessions = new Set(bookingAnalyticsRaw.map((event) => event.sessionId).filter(Boolean));
    const submissions = bookingAnalyticsRaw.filter((event) => event.event === "booking_submitted");
    const checkoutStarts = bookingAnalyticsRaw.filter((event) => event.event === "booking_checkout_started");
    const paymentOrders = bookingAnalyticsRaw.filter((event) => event.event === "payment_order_created");
    const paymentApprovals = bookingAnalyticsRaw.filter((event) => event.event === "payment_approved");
    const paymentErrors = bookingAnalyticsRaw.filter((event) => event.event === "payment_error");
    const completedBookings = bookingAnalyticsRaw.filter((event) => event.event === "booking_completed");
    const completedRevenue = completedBookings.reduce((sum, event) => sum + (bookingMeta(event).amount ?? 0), 0);
    const reservationRevenue = reservations.reduce((sum, reservation) => sum + (typeof reservation.amount === "number" ? reservation.amount : 0), 0);
    const eventCounts = countBy(bookingAnalyticsRaw, (event) => event.event);
    const topTours = countBy(
      bookingAnalyticsRaw.filter((event) => event.event !== "booking_step"),
      (event) => bookingMeta(event).tourName ?? bookingMeta(event).tourSlug
    ).slice(0, 8);
    const topPackages = countBy(
      bookingAnalyticsRaw.filter((event) => event.event !== "booking_step"),
      (event) => bookingMeta(event).tourPackage
    ).slice(0, 8);
    const deviceBreakdown = countBy(bookingAnalyticsRaw, (event) => event.request.deviceType).slice(0, 5);
    const browserBreakdown = countBy(bookingAnalyticsRaw, (event) => event.request.browser).slice(0, 5);
    const recentIntents = bookingAnalyticsRaw
      .filter((event) => event.event !== "booking_step" || event.metadata.stepLabel === "review")
      .slice(0, 30)
      .map((event) => ({
        _id: event._id,
        event: event.event,
        step: event.metadata.step ?? null,
        stepLabel: event.metadata.stepLabel ?? null,
        stage: event.metadata.stage ?? null,
        happenedAt: event.happenedAt,
        path: event.path,
        sessionId: event.sessionId,
        user: event.user,
        request: event.request,
        ...bookingMeta(event),
      }));

    const bookingAnalytics = {
      totalEvents: bookingAnalyticsRaw.length,
      bookingSteps: bookingAnalyticsRaw.filter((event) => event.event === "booking_step").length,
      bookingSubmissions: submissions.length,
      checkoutStarts: checkoutStarts.length,
      paymentOrders: paymentOrders.length,
      paymentApprovals: paymentApprovals.length,
      paymentErrors: paymentErrors.length,
      completedBookings: completedBookings.length,
      uniqueSessions: uniqueSessions.size,
      conversionRate:
        uniqueSessions.size > 0
          ? Number(((submissions.length / uniqueSessions.size) * 100).toFixed(2))
          : 0,
      completionRate:
        uniqueSessions.size > 0
          ? Number(((completedBookings.length / uniqueSessions.size) * 100).toFixed(2))
          : 0,
      paymentApprovalRate:
        paymentOrders.length > 0
          ? Number(((paymentApprovals.length / paymentOrders.length) * 100).toFixed(2))
          : 0,
      completedRevenue,
      reservationRevenue,
      eventCounts,
      funnel: [
        { label: "Sesiones", count: uniqueSessions.size },
        { label: "Enviaron reserva", count: submissions.length },
        { label: "Checkout", count: checkoutStarts.length },
        { label: "Orden PayPal", count: paymentOrders.length },
        { label: "Pago aprobado", count: paymentApprovals.length },
        { label: "Reserva final", count: completedBookings.length },
      ],
      topTours,
      topPackages,
      deviceBreakdown,
      browserBreakdown,
      recentIntents,
      recentEvents: bookingAnalyticsRaw.slice(0, 200),
    };

    return NextResponse.json({ operators, users, loginLogs, reservations, bookingAnalytics, heroSlogans });
  } catch (error) {
    console.error("Admin insights error", error);
    return NextResponse.json({ error: "Failed to load admin insights." }, { status: 500 });
  }
}
