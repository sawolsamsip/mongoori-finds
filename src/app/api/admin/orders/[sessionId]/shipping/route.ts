import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isAdmin } from "@/lib/admin-auth";
import { sendCustomerShippingEmail, type ShippingStatus } from "@/lib/email";

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

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
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

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const previousStatus = paymentIntent.metadata?.shipping_status ?? "pending";

  const metadata: Record<string, string> = {
    shipping_status: shippingStatus ?? "pending",
    ...(trackingNumber != null && { tracking_number: trackingNumber }),
  };

  await stripe.paymentIntents.update(paymentIntentId, { metadata });

  // Send customer shipping notification when status changes to shipped or delivered
  const notifiableStatuses: ShippingStatus[] = ["shipped", "delivered"];
  const isNotifiable = notifiableStatuses.includes(shippingStatus as ShippingStatus);
  const hasChanged = shippingStatus !== previousStatus;

  if (isNotifiable && hasChanged) {
    const customerEmail =
      session.customer_details?.email ?? session.customer_email ?? null;

    if (customerEmail) {
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
            .join(", ")
        : null;

      const lineItems = (session.line_items?.data ?? []).map((li) => ({
        description: li.description,
        quantity: li.quantity,
        amount: li.amount_total ?? null,
      }));

      try {
        await sendCustomerShippingEmail({
          customerEmail,
          customerName:
            session.customer_details?.name ?? shipping?.name ?? null,
          orderId: sessionId,
          shippingStatus: shippingStatus as ShippingStatus,
          trackingNumber: trackingNumber || null,
          shippingAddress,
          lineItems,
          currency: session.currency ?? "usd",
          amountTotal: session.amount_total,
        });
      } catch (err) {
        // Log but don't fail the shipping update if email fails
        console.error("Failed to send shipping notification email:", err);
      }
    }
  }

  return NextResponse.json({ ok: true, metadata });
}
