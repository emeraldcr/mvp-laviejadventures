import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const docs = await db
    .collection("Reservations")
    .find({ email: session.user.email })
    .sort({ createdAt: -1 })
    .toArray();

  const bookings = docs.map((doc) => ({
    id: doc._id.toString(),
    orderId: doc.orderId ?? null,
    name: doc.name ?? null,
    email: doc.email ?? null,
    phone: doc.phone ?? null,
    date: doc.date ?? null,
    tickets: doc.tickets ?? null,
    amount: doc.amount ?? null,
    currency: doc.currency ?? null,
    status: doc.status ?? null,
    tourTime: doc.tourTime ?? null,
    tourPackage: doc.tourPackage ?? null,
    packagePrice: doc.packagePrice ?? null,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
  }));

  return NextResponse.json({ bookings });
}
