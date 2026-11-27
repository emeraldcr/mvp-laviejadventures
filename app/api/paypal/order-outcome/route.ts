import { NextResponse } from "next/server";
import { ownsPayment } from "@/lib/security/payment-owner";
import { getDb } from "@/lib/data/mongodb";
import { COLLECTIONS } from "@/lib/data/collections";

// Only the browser that created the order may report an explicit cancellation.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const orderId = typeof body?.orderID === "string" ? body.orderID.trim() : "";
  if (!/^[A-Z0-9]{10,32}$/.test(orderId)) return NextResponse.json({ success: false }, { status: 400 });
  if (!await ownsPayment(orderId)) return NextResponse.json({ success: false }, { status: 403 });
  try {
    const db = await getDb();
    await db.collection(COLLECTIONS.PAYPAL_ORDER_CONTEXTS).updateOne(
      { orderId, status: { $in: ["created", "returned", "cancelled"] } },
      { $set: { status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() } },
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to record PayPal cancellation:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
