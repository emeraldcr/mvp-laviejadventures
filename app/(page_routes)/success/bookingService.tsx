import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/data/mongodb";
import { auth } from "@/lib/auth";
import { ownsPayment } from "@/lib/security/payment-owner";
import { allowRequest } from "@/lib/security/rate-limit";
import { sendConfirmationEmail } from "./emailService";
import { COLLECTIONS } from "@/lib/data/collections";

type SuccessPageResult = {
  error: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  date?: string | null;
  tourName?: string | null;
  tourPackage?: string | null;
  tourTime?: string | null;
  tickets?: string | number | null;
  amount?: string | number | null;
  currency?: string | null;
  orderId?: string | null;
  captureId?: string | null;
  reservationId?: string | null;
  status?: string | null;
  emailStatus?: "sent" | "failed" | "not_configured" | "not_requested";
};

// A voucher is a view of an already persisted payment. Rendering a page never
// reconstructs a paid reservation or assigns ownership from its current visitor.
export async function processSuccessfulBooking(orderId: string): Promise<SuccessPageResult> {
  const unavailable = { error: "No se pudo acceder a esta reserva. Use el navegador del pago o inicie sesión con la cuenta verificada de la reserva. Si ya pagó, contacte al operador; no repita el pago." };
  if (typeof orderId !== "string" || !/^[A-Z0-9]{10,32}$/.test(orderId)) return unavailable;
  try {
    const session = await auth();
    const browserOwner = await ownsPayment(orderId);
    const userId = session?.user?.id;
    const email = session?.user?.email;
    const verified = (session?.user as { verifiedEmail?: boolean } | undefined)?.verifiedEmail === true;
    if (!browserOwner && !userId && !(verified && email)) return unavailable;
    const reservations = (await getDb()).collection(COLLECTIONS.RESERVATIONS);
    const record = await reservations.findOne({ orderId, status: "COMPLETED" });
    if (!record || typeof record.captureId !== "string" || !record.captureId) return unavailable;
    const accountOwner = Boolean(userId && record.userId === userId) || Boolean(verified && email && (record.email === email || record.userEmail === email));
    if (!browserOwner && !accountOwner) return unavailable;

    let emailStatus: SuccessPageResult["emailStatus"] = record.emailDeliveryStatus === "sent" ? "sent" : "not_requested";
    if (record.email && emailStatus !== "sent" && await allowRequest(`voucher-email:${orderId}`, 3, 3_600_000)) {
      const claim = randomUUID();
      const claimed = await reservations.findOneAndUpdate({
        _id: record._id, emailDeliveryStatus: { $ne: "sent" },
        $or: [{ emailDeliveryLeaseUntil: { $exists: false } }, { emailDeliveryLeaseUntil: { $lte: new Date() } }],
      }, { $set: { emailDeliveryClaim: claim, emailDeliveryLeaseUntil: new Date(Date.now() + 120_000) } }, { returnDocument: "after" });
      if (claimed) {
        try {
          const result = await sendConfirmationEmail({
            to: record.email, name: record.name, phone: record.phone, date: record.date,
            tickets: String(record.tickets ?? ""), amount: String(record.amount ?? ""),
            currency: record.currency, orderId, captureId: record.captureId,
            status: record.status, reservationId: record._id.toString(),
            language: record.language === "en" ? "en" : "es", tourName: record.tourName,
            tourPackage: record.tourPackage, tourTime: record.tourTime,
          });
          emailStatus = result.status;
        } catch {
          emailStatus = "failed";
        }
        await reservations.updateOne({ _id: record._id, emailDeliveryClaim: claim }, {
          $set: { emailDeliveryStatus: emailStatus },
          $unset: { emailDeliveryClaim: "", emailDeliveryLeaseUntil: "" },
        });
      }
    }
    return {
      error: null, name: record.name, email: record.email, phone: record.phone,
      date: record.date, tourName: record.tourName, tourPackage: record.tourPackage,
      tourTime: record.tourTime, tickets: record.tickets, amount: record.amount,
      currency: record.currency, orderId, captureId: record.captureId,
      reservationId: record._id.toString(), status: record.status, emailStatus,
    };
  } catch {
    return unavailable;
  }
}
