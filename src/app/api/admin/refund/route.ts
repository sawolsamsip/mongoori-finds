import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const paymentIntentId = body.paymentIntentId as string | undefined;

  if (!paymentIntentId) {
    return NextResponse.json(
      { error: "paymentIntentId required" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    return NextResponse.json({ refundId: refund.id, status: refund.status });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Refund failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
