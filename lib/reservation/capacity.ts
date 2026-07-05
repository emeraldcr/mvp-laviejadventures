import type { Db } from "mongodb";
import { COLLECTIONS } from "@/lib/constants/db";
import { DEFAULT_AVAILABILITY } from "@/lib/constants/business";
import { isWeekendIsoDate } from "./dates";

export async function getRemainingCapacityForTourDate({
  db,
  tourSlug,
  date,
}: {
  db: Db;
  tourSlug?: string;
  date: string;
}): Promise<number> {
  const capacity = isWeekendIsoDate(date)
    ? DEFAULT_AVAILABILITY.WEEKEND
    : DEFAULT_AVAILABILITY.WEEKDAY;

  const query: Record<string, unknown> = {
    date,
    status: {
      $in: ["COMPLETED", "completed", "confirmed", "CONFIRMED"],
    },
  };

  if (tourSlug?.trim()) {
    query.tourSlug = tourSlug.trim();
  }

  const existingReservations = await db
    .collection(COLLECTIONS.RESERVATIONS)
    .find(query, { projection: { tickets: 1 } })
    .toArray();

  const reserved = existingReservations.reduce((sum, doc) => {
    const tickets = typeof doc.tickets === "number" ? doc.tickets : Number(doc.tickets ?? 0);
    return Number.isFinite(tickets) && tickets > 0 ? sum + tickets : sum;
  }, 0);

  return Math.max(0, capacity - reserved);
}
