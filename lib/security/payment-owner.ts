import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

function signature(orderId: string, expires: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Payment ownership secret is not configured");
  return createHmac("sha256", secret).update(`paypal:${orderId}:${expires}`).digest("hex");
}

export async function setPaymentOwner(orderId: string) {
  const expires = String(Date.now() + 6 * 60 * 60 * 1000);
  (await cookies()).set(`lva-paypal-${orderId}`, `${expires}.${signature(orderId, expires)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: 6 * 60 * 60,
  });
}

export async function ownsPayment(orderId: string): Promise<boolean> {
  const value = (await cookies()).get(`lva-paypal-${orderId}`)?.value ?? "";
  if (!/^\d{13}\.[a-f0-9]{64}$/.test(value)) return false;
  const [expires, digest] = value.split(".");
  if (Number(expires) <= Date.now()) return false;
  return timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(signature(orderId, expires), "hex"));
}
