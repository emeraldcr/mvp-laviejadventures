import type { Db, Document } from "mongodb";

import { RESERVATIONS_COLLECTION } from "../constants";
import type { Booking } from "../types";

export function bookingQueryForUser(userId: string | null, userEmail: string | null) {
  if (userId) {
    return { $or: [{ userId }, { userEmail }, { email: userEmail }] };
  }

  return { email: userEmail };
}

export function serializeBooking(doc: Document): Booking {
  return {
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
  };
}

export async function readUserBookings(db: Db, userId: string | null, userEmail: string | null) {
  const docs = await db
    .collection(RESERVATIONS_COLLECTION)
    .find(bookingQueryForUser(userId, userEmail))
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map(serializeBooking);
}

