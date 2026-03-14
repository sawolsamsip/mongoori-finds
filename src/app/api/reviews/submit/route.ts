import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  createReview,
  reviewExistsForSession,
  ReviewInput,
} from "@/lib/reviews";
import { getProductBySlug } from "@/lib/products";

/**
 * POST /api/reviews/submit
 *
 * Body:
 * {
 *   productId: string,
 *   productSlug: string,
 *   customerEmail: string,
 *   customerName: string,
 *   rating: number (1–5),
 *   title: string,
 *   body: string,
 *   checkoutSessionId: string  // Stripe session ID – used to verify purchase
 * }
 *
 * Purchase verification:
 * - Retrieves the Stripe checkout session by ID.
 * - Confirms session is paid and belongs to the submitting email.
 * - Confirms the product is present in the session's line items.
 * - Prevents duplicate reviews for the same session + product.
 */
export async function POST(req: NextRequest) {
  let body: Partial<ReviewInput & { checkoutSessionId: string }>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    productId,
    productSlug,
    customerEmail,
    customerName,
    rating,
    title,
    body: reviewBody,
    checkoutSessionId,
  } = body;

  // --- Validate required fields ---
  if (
    !productId ||
    !productSlug ||
    !customerEmail ||
    !customerName ||
    !rating ||
    !title ||
    !reviewBody ||
    !checkoutSessionId
  ) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be a number between 1 and 5." },
      { status: 400 }
    );
  }

  if (title.trim().length < 3 || title.trim().length > 120) {
    return NextResponse.json(
      { error: "Review title must be between 3 and 120 characters." },
      { status: 400 }
    );
  }

  if (reviewBody.trim().length < 10 || reviewBody.trim().length > 2000) {
    return NextResponse.json(
      { error: "Review body must be between 10 and 2000 characters." },
      { status: 400 }
    );
  }

  // --- Validate product exists ---
  const product = getProductBySlug(productSlug);
  if (!product || product.id !== productId) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  // --- Prevent duplicate review for same session + product ---
  const duplicate = await reviewExistsForSession(checkoutSessionId, productId);
  if (duplicate) {
    return NextResponse.json(
      { error: "A review for this order has already been submitted." },
      { status: 409 }
    );
  }

  // --- Verify purchase via Stripe ---
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });

  let verified = false;
  try {
    const session = await stripe.checkout.sessions.retrieve(
      checkoutSessionId,
      { expand: ["line_items"] }
    );

    const sessionEmail =
      session.customer_details?.email ?? session.customer_email ?? "";
    const emailMatch =
      sessionEmail.toLowerCase() === customerEmail.toLowerCase();
    const isPaid = session.payment_status === "paid";

    // Check if the product's name appears in any line item description.
    const lineItems = session.line_items?.data ?? [];
    const productInOrder = lineItems.some((li) =>
      li.description?.toLowerCase().includes(product.name.toLowerCase())
    );

    verified = emailMatch && isPaid && productInOrder;
  } catch (err) {
    console.error("[POST /api/reviews/submit] Stripe error:", err);
    // If session lookup fails, we still allow unverified review submission
    // so that customers are not blocked by transient Stripe errors.
    verified = false;
  }

  // --- Persist review ---
  try {
    const review = await createReview({
      productId,
      productSlug,
      checkoutSessionId,
      customerEmail,
      customerName: customerName.trim(),
      rating: Math.round(rating),
      title: title.trim(),
      body: reviewBody.trim(),
      verified,
      approved: false, // Requires admin approval before appearing publicly
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reviews/submit] DB error:", err);
    return NextResponse.json(
      { error: "Failed to save review. Please try again." },
      { status: 500 }
    );
  }
}
