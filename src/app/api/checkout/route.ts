import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getPointsBalance, redeemPoints } from "@/lib/points";

const FREE_SHIPPING_THRESHOLD_CENTS = 5000; // $50.00 for regular customers

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured. Set STRIPE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });

    const body = await req.json();
    const items = body.items as Array<{ name: string; price: number; image: string; quantity: number }>;
    const hostEmail = typeof body.hostEmail === "string" ? body.hostEmail.trim() : null;
    const pointsToRedeem: number = typeof body.pointsToRedeem === "number" ? body.pointsToRedeem : 0;
    const customerEmail: string | null = typeof body.customerEmail === "string" ? body.customerEmail.trim() : null;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Verify host status server-side
    let isVerifiedHost = false;
    if (hostEmail) {
      try {
        const verifyRes = await fetch(
          `${req.nextUrl.origin}/api/host-verify?email=${encodeURIComponent(hostEmail)}`
        );
        const verifyData = await verifyRes.json();
        isVerifiedHost = verifyData.isHost === true;
      } catch {
        // non-fatal: proceed without host perks
      }
    }

    // Success/cancel URL
    const originHeader = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const originFromReferer = referer ? (() => { try { return new URL(referer).origin; } catch { return ""; } })() : "";
    const requestOrigin = originHeader || originFromReferer || "";
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      requestOrigin ||
      "http://localhost:4173";

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

    const subtotalCents = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    // Hosts: always free shipping. Others: free when $50+
    const freeShipping = isVerifiedHost || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;

    // Handle points redemption
    let pointsDiscountCents = 0;
    const pointsOrderId = `pending-${Date.now()}`;
    if (pointsToRedeem > 0 && customerEmail) {
      const redeemResult = await redeemPoints(customerEmail, pointsToRedeem, pointsOrderId);
      if (redeemResult.success) {
        pointsDiscountCents = redeemResult.discountCents;
      }
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      allow_promotion_codes: true,
      shipping_address_collection: { allowed_countries: ["US"] },
      phone_number_collection: { enabled: true },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: {
        customerEmail: hostEmail || customerEmail || "",
        isHost: isVerifiedHost ? "true" : "false",
        pointsRedeemed: String(pointsToRedeem),
        pointsOrderId,
      },
    };

    // Points discount coupon (one-time, exact amount)
    if (pointsDiscountCents > 0) {
      const couponId = `POINTS_${Date.now()}`;
      await stripe.coupons.create({
        id: couponId,
        amount_off: pointsDiscountCents,
        currency: "usd",
        duration: "once",
        name: `Points discount (${pointsToRedeem} pts)`,
        max_redemptions: 1,
      });
      sessionParams.discounts = [{ coupon: couponId }];
      sessionParams.allow_promotion_codes = false;
    }

    // Shipping options
    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [];
    if (freeShipping) {
      shippingOptions.push({
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "usd" },
          display_name: isVerifiedHost ? "Free Shipping (Host Benefit)" : "Free Shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      });
      shippingOptions.push({
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 999, currency: "usd" },
          display_name: "Express Shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 2 },
            maximum: { unit: "business_day", value: 3 },
          },
        },
      });
    } else {
      shippingOptions.push({
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 799, currency: "usd" },
          display_name: "Standard Shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      });
      shippingOptions.push({
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 999, currency: "usd" },
          display_name: "Express Shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 2 },
            maximum: { unit: "business_day", value: 3 },
          },
        },
      });
    }
    sessionParams.shipping_options = shippingOptions;

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      url: session.url,
      pointsDiscountCents,
    });
  } catch (err) {
    console.error("Checkout session error:", err);
    const message = err instanceof Error ? err.message : "Payment session failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/checkout/points-preview?email=xxx&points=200
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const points = parseInt(req.nextUrl.searchParams.get("points") ?? "0", 10);
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const { balance, ledger } = await getPointsBalance(email);
  const maxRedeemable = Math.floor(balance / 100) * 100; // floor to nearest 100
  const discountCents = Math.min(points, maxRedeemable); // 1 pt = 1 cent

  return NextResponse.json({ balance, maxRedeemable, previewDiscountCents: discountCents, ledger });
}
