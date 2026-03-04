import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isAdmin } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });

  const sessions = await stripe.checkout.sessions.list({
    status: "complete",
    limit: 100,
  });

  const orders = await Promise.all(
    sessions.data
      .filter((s) => s.payment_status === "paid" && s.payment_intent)
      .map(async (session) => {
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: [],
        });
        const paymentIntent =
          typeof fullSession.payment_intent === "string"
            ? fullSession.payment_intent
            : fullSession.payment_intent?.id;
        const pi = paymentIntent
          ? ((await stripe.paymentIntents
              .retrieve(paymentIntent)
              .catch(() => null)) as Stripe.PaymentIntent | null)
          : null;
        const metadata = (pi?.metadata ?? {}) as Record<string, string>;
        const lineItems = await stripe.checkout.sessions.listLineItems(
          fullSession.id
        );
        const shipping = fullSession.collected_information?.shipping_details;
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
        return {
          id: fullSession.id,
          paymentIntentId: paymentIntent ?? null,
          created: fullSession.created,
          amountTotal: fullSession.amount_total ?? 0,
          currency: (fullSession.currency ?? "usd").toUpperCase(),
          customerEmail:
            fullSession.customer_details?.email ??
            fullSession.customer_email ??
            null,
          recipientName: shipping?.name ?? fullSession.customer_details?.name ?? null,
          shippingAddress,
          phone: fullSession.customer_details?.phone ?? null,
          shippingStatus: metadata.shipping_status ?? "pending",
          trackingNumber: metadata.tracking_number ?? null,
          lineItems: lineItems.data.map((li) => ({
            description: li.description,
            quantity: li.quantity,
            amount: li.amount_total,
          })),
        };
      })
  );

  orders.sort((a, b) => b.created - a.created);

  return NextResponse.json({ orders });
}
