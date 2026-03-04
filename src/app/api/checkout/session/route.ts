import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * GET ?session_id=cs_xxx — returns shipping info for the success page (no auth).
 * Only returns recipient name, address, phone. Used to show "Ship to" on checkout success.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session_id" }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete") {
      return NextResponse.json({ error: "Session not complete" }, { status: 404 });
    }

    const shipping = session.collected_information?.shipping_details;
    const addr = shipping?.address;
    const shippingAddress = addr
      ? [
          addr.line1,
          addr.line2,
          [addr.city, addr.state, addr.postal_code].filter(Boolean).join(", "),
          addr.country,
        ]
        .filter(Boolean)
        .join("\n")
      : null;

    return NextResponse.json({
      recipientName: shipping?.name ?? session.customer_details?.name ?? null,
      shippingAddress,
      phone: session.customer_details?.phone ?? null,
    });
  } catch (err) {
    console.error("Session fetch error:", err);
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
}
