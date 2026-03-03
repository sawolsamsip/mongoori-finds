import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isAdmin } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 }
    );
  }

  const { sessionId } = await params;
  const body = await req.json().catch(() => ({}));
  const shippingStatus = body.shippingStatus as string | undefined;
  const trackingNumber = (body.trackingNumber as string) ?? null;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!paymentIntentId) {
    return NextResponse.json(
      { error: "No payment intent for this session" },
      { status: 400 }
    );
  }

  const metadata: Record<string, string> = {
    shipping_status: shippingStatus ?? "pending",
    ...(trackingNumber != null && { tracking_number: trackingNumber }),
  };

  await stripe.paymentIntents.update(paymentIntentId, { metadata });
  return NextResponse.json({ ok: true, metadata });
}
