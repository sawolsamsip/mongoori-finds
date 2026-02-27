import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured. Set STRIPE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const items = body.items as Array<{ name: string; price: number; image: string; quantity: number }>;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: "usd",
        unit_amount: item.price,
        product_data: {
          name: item.name,
          images: item.image ? [item.image.startsWith("http") ? item.image : `${baseUrl}${item.image}`] : undefined,
        },
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      allow_promotion_codes: true,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    const message = err instanceof Error ? err.message : "Payment session failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
