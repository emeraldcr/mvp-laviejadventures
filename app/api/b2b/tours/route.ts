import { NextRequest, NextResponse } from "next/server";
import { getOperatorFromRequest } from "@/lib/b2b-auth";
import { B2B_TOURS } from "@/lib/b2b-tours";

export async function GET(req: NextRequest) {
  const operator = getOperatorFromRequest(req);
  if (!operator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const toursWithCommission = B2B_TOURS.map((tour) => ({
    ...tour,
    commissionRate: operator.commissionRate,
    commissionPerPax: Math.round(tour.retailPricePerPax * (operator.commissionRate / 100)),
    netPricePerPax: Math.round(
      tour.retailPricePerPax * (1 - operator.commissionRate / 100)
    ),
  }));

  return NextResponse.json({ tours: toursWithCommission });
}
