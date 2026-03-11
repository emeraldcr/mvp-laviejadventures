import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { BookingClient } from "./BookingClient";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/platform");
  }

  const userId = (session.user as { id?: string }).id ?? null;
  const userEmail = session.user.email ?? null;

  const db = await getDb();

  // Query by userId if available (most reliable), fallback to email match
  const query = userId
    ? { $or: [{ userId }, { userEmail }, { email: userEmail }] }
    : { email: userEmail };

  const docs = await db
    .collection("Reservations")
    .find(query)
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
    createdAt: doc.createdAt ? (doc.createdAt as Date).toISOString() : null,
  }));

  return (
    <BookingClient
      bookings={bookings}
      userName={session.user.name ?? null}
      userEmail={userEmail}
    />
  );
}
