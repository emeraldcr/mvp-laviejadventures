import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    // FIX: use request.headers instead of headers()
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "";

    const form = await request.formData();
    const name = form.get("name");
    const email = form.get("email");
    const tickets = Number(form.get("tickets"));
    const date = form.get("date");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email as string,
      metadata: { name: String(name), date: String(date), tickets },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Tour – ${date}` },
            unit_amount: 3900,
          },
          quantity: tickets,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return NextResponse.redirect(session.url!, 303);
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
