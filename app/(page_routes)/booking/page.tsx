import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/helpers/mongodb";
import { BookingClient } from "./BookingClient";
import { readUserBookings } from "./lib/booking-data";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/platform");
  }

  const userId = (session.user as { id?: string }).id ?? null;
  const userEmail = session.user.email ?? null;

  const db = await getDb();
  const bookings = await readUserBookings(db, userId, userEmail);

  return (
    <BookingClient
      bookings={bookings}
      userName={session.user.name ?? null}
      userEmail={userEmail}
    />
  );
}
