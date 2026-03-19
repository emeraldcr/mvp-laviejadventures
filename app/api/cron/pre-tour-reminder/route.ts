// app/api/cron/pre-tour-reminder/route.ts
// Vercel Cron Job — runs daily at 10:00 AM Costa Rica time (UTC-6 = 16:00 UTC)
// Finds bookings whose tour date is exactly 2 days away and sends the pre-tour
// reminder email. Marks each booking with `reminder48hSent: true` to prevent
// duplicate sends on re-runs.

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendPreTourReminderEmail } from "@/lib/email/booking-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // ── Security: verify Vercel Cron secret ──────────────────────────────────
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Compute target date: today + 2 days (YYYY-MM-DD) ─────────────────────
  const now = new Date();
  const target = new Date(now);
  target.setDate(target.getDate() + 2);

  // Zero-pad month and day
  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, "0");
  const dd = String(target.getDate()).padStart(2, "0");
  const targetDateStr = `${yyyy}-${mm}-${dd}`; // e.g. "2025-03-20"

  console.log(`[pre-tour-reminder] Running for date: ${targetDateStr}`);

  // ── Query bookings ────────────────────────────────────────────────────────
  let bookings: Record<string, unknown>[] = [];
  try {
    const db = await getDb();
    const col = db.collection("Reservations");

    // Match bookings where `date` starts with the target YYYY-MM-DD string
    // and the reminder has not been sent yet.
    const cursor = col.find({
      date: { $regex: `^${targetDateStr}` },
      reminder48hSent: { $ne: true },
      email: { $ne: null, $exists: true },
    });

    bookings = (await cursor.toArray()) as Record<string, unknown>[];
  } catch (err) {
    console.error("[pre-tour-reminder] DB query error:", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  console.log(`[pre-tour-reminder] Found ${bookings.length} booking(s) to notify`);

  if (bookings.length === 0) {
    return NextResponse.json({
      ok: true,
      date: targetDateStr,
      sent: 0,
      message: "No bookings found for this date",
    });
  }

  // ── Send emails and mark as sent ──────────────────────────────────────────
  let sent = 0;
  let errors = 0;

  for (const booking of bookings) {
    const email = booking.email as string;
    const orderId = booking.orderId as string;

    try {
      await sendPreTourReminderEmail({
        to: email,
        name: (booking.name as string) || "Aventurero/a",
        date: (booking.date as string) || targetDateStr,
        tourTime: (booking.tourTime as string | null) ?? null,
        tourName: (booking.tourName as string | null) ?? null,
        tourPackage: (booking.tourPackage as string | null) ?? null,
        tickets: (booking.tickets as number | string) ?? 1,
        orderId,
        language: ((booking.language ?? "es") as "es" | "en"),
      });

      // Mark as sent to prevent duplicate emails on re-runs
      const db = await getDb();
      await db.collection("Reservations").updateOne(
        { orderId },
        { $set: { reminder48hSent: true, reminder48hSentAt: new Date() } }
      );

      sent++;
      console.log(`[pre-tour-reminder] ✓ Sent to ${email} (order: ${orderId})`);
    } catch (err) {
      errors++;
      console.error(`[pre-tour-reminder] ✗ Failed for ${email}:`, err);
    }
  }

  return NextResponse.json({
    ok: true,
    date: targetDateStr,
    found: bookings.length,
    sent,
    errors,
  });
}
