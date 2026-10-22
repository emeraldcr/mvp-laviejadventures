import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/helpers/mongodb";
import { BookingClient } from "@/app/(page_routes)/booking/BookingClient";
import { readUserBookings } from "@/app/(page_routes)/booking/lib/booking-data";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const userId = (session.user as { id?: string }).id ?? null;
  const userEmail = session.user.email ?? null;
  const db = await getDb();
  const bookings = await readUserBookings(db, userId, userEmail);

  return <BookingClient bookings={bookings} userName={session.user.name ?? null} userEmail={userEmail} />;
}
