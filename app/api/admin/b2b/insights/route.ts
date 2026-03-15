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
  event: "booking_step" | "booking_submitted";
  path: string | null;
  sessionId: string | null;
  happenedAt: string | null;
  createdAt: string | null;
  metadata: {
    step?: string;
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

function isAuthorized(req: NextRequest): boolean {
  return Boolean(getAdminFromRequest(req));
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
          .find({ event: { $in: ["booking_step", "booking_submitted"] } })
          .sort({ happenedAt: -1 })
          .limit(200)
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

    const bookingAnalytics = {
      totalEvents: bookingAnalyticsRaw.length,
      bookingSteps: bookingAnalyticsRaw.filter((event) => event.event === "booking_step").length,
      bookingSubmissions: submissions.length,
      uniqueSessions: uniqueSessions.size,
      conversionRate:
        uniqueSessions.size > 0
          ? Number(((submissions.length / uniqueSessions.size) * 100).toFixed(2))
          : 0,
      recentEvents: bookingAnalyticsRaw,
    };

    return NextResponse.json({ operators, users, loginLogs, reservations, bookingAnalytics, heroSlogans });
  } catch (error) {
    console.error("Admin insights error", error);
    return NextResponse.json({ error: "Failed to load admin insights." }, { status: 500 });
  }
}
