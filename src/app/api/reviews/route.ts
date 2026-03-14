import { NextRequest, NextResponse } from "next/server";
import { getReviewsForProduct } from "@/lib/reviews";

/**
 * GET /api/reviews?productId=<id>
 * Returns approved reviews for a product. Public endpoint.
 */
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json(
      { error: "productId query parameter is required." },
      { status: 400 }
    );
  }

  try {
    const reviews = await getReviewsForProduct(productId);
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("[GET /api/reviews] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}
