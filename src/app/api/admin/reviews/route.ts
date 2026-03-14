import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getAllReviews } from "@/lib/reviews";

/**
 * GET /api/admin/reviews
 * Returns all reviews (pending + approved) for admin moderation.
 */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reviews = await getAllReviews();
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("[GET /api/admin/reviews] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}
