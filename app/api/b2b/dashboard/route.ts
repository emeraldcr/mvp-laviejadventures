import { NextRequest, NextResponse } from "next/server";
import { getOperatorFromRequest } from "@/lib/b2b-auth";
import { getBookingStats, findBookingsByOperator } from "@/lib/models/booking";
import { createLogger } from "@/lib/logger";

const logger = createLogger("b2b.dashboard");

export async function GET(req: NextRequest) {
  const operator = getOperatorFromRequest(req);
  if (!operator) {
    logger.warn("Unauthorized dashboard request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [stats, allBookings] = await Promise.all([
    getBookingStats(operator.id),
    findBookingsByOperator(operator.id),
  ]);

  const recentBookings = allBookings.slice(0, 5);

  logger.info("Dashboard data fetched", {
    operatorId: operator.id,
    bookings: allBookings.length,
    recentBookings: recentBookings.length,
  });

  return NextResponse.json({ stats, recentBookings });
}
