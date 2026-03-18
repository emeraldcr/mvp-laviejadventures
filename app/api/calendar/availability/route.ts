import { NextResponse } from "next/server";
import { parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { getDb, isMongoConfigured } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/constants/db";
import { DEFAULT_AVAILABILITY } from "@/lib/constants/business";

function parseReservationDate(raw: unknown): Date | null {
  if (typeof raw !== "string" || raw.trim().length === 0) return null;

  const trimmed = raw.trim();

  // Avoid timezone drift for date-only values (e.g. "2026-03-14") which are
  // parsed as UTC by `new Date(...)` and can shift to the previous day locally.
  const isoDateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateOnly) {
    const [, yearRaw, monthRaw, dayRaw] = isoDateOnly;
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);
    const localDate = new Date(year, month - 1, day);
    if (isValid(localDate)) return localDate;
  }

  const asDate = new Date(trimmed);
  if (isValid(asDate)) return asDate;

  const esParsed = parse(trimmed, "EEEE, dd 'de' MMMM 'de' yyyy", new Date(), { locale: es });
  if (isValid(esParsed)) return esParsed;

  const enParsed = parse(trimmed, "EEEE, MMMM dd, yyyy", new Date());
  if (isValid(enParsed)) return enParsed;

  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 0 || month > 11) {
    return NextResponse.json({ message: "Invalid year/month." }, { status: 400 });
  }

  const docs = isMongoConfigured
    ? await (await getDb())
        .collection(COLLECTIONS.RESERVATIONS)
        .find(
          {
            status: {
              $in: ["COMPLETED", "completed", "confirmed", "CONFIRMED"],
            },
          },
          { projection: { date: 1, tickets: 1 } }
        )
        .toArray()
    : [];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const bookedByDay: Record<number, number> = {};

  for (const doc of docs) {
    const date = parseReservationDate(doc.date);
    if (!date) continue;
    if (date.getFullYear() !== year || date.getMonth() !== month) continue;

    const day = date.getDate();
    const tickets = typeof doc.tickets === "number" ? doc.tickets : Number(doc.tickets ?? 0);
    if (!Number.isFinite(tickets) || tickets <= 0) continue;

    bookedByDay[day] = (bookedByDay[day] ?? 0) + tickets;
  }

  const availability: Record<number, number> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const capacity = isWeekend ? DEFAULT_AVAILABILITY.WEEKEND : DEFAULT_AVAILABILITY.WEEKDAY;
    const reserved = bookedByDay[day] ?? 0;
    availability[day] = Math.max(0, capacity - reserved);
  }

  return NextResponse.json({ availability, bookedByDay });
}
