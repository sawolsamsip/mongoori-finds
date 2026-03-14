import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendOrderEmails, sendPaymentFailedEmail } from "@/lib/email";

// Next.js App Router: read raw body for Stripe signature verification
export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("Webhook signature error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          const lineItems = await stripe.checkout.sessions.listLineItems(
            session.id,
            { limit: 100 }
          );
          await sendOrderEmails(session, lineItems.data);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(
          "Payment failed:",
          paymentIntent.id,
          paymentIntent.last_payment_error?.message
        );
        await sendPaymentFailedEmail(paymentIntent);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Error handling webhook event:", event.type, err);
    // Return 200 so Stripe does not keep retrying a processing error
    return NextResponse.json({ received: true, warning: "Processing error" });
  }

  return NextResponse.json({ received: true });
}
