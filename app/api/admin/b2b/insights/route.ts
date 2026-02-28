import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { listOperators } from "@/lib/models/operator";
import { listUsers } from "@/lib/models/user";
import { listLoginLogs } from "@/lib/models/login-log";
import { getDb } from "@/lib/mongodb";

function isAuthorized(req: NextRequest): boolean {
  return Boolean(getAdminFromRequest(req));
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [operators, users, loginLogs, reservations] = await Promise.all([
      listOperators(),
      listUsers(),
      listLoginLogs(),
      (async () => {
        const db = await getDb();
        const docs = await db
          .collection("Reservations")
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
    ]);

    return NextResponse.json({ operators, users, loginLogs, reservations });
  } catch (error) {
    console.error("Admin insights error", error);
    return NextResponse.json({ error: "Failed to load admin insights." }, { status: 500 });
  }
}
