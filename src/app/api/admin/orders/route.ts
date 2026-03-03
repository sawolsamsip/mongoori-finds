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
        const paymentIntent =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;
        const pi =
          paymentIntent &&
          (await stripe.paymentIntents.retrieve(paymentIntent).catch(() => null));
        const metadata = (pi?.metadata ?? {}) as Record<string, string>;
        const lineItems = await stripe.checkout.sessions.listLineItems(
          session.id
        );
        return {
          id: session.id,
          paymentIntentId: paymentIntent ?? null,
          created: session.created,
          amountTotal: session.amount_total ?? 0,
          currency: (session.currency ?? "usd").toUpperCase(),
          customerEmail:
            session.customer_details?.email ??
            session.customer_email ??
            null,
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
