import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { updateReview, deleteReview } from "@/lib/reviews";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/reviews/:id
 * Approve or update a review. Body: { approved?: boolean, ... }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const allowedFields = ["approved", "rating", "title", "body"] as const;
  const update: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) update[field] = body[field];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update." },
      { status: 400 }
    );
  }

  try {
    const modified = await updateReview(id, update as Parameters<typeof updateReview>[1]);
    if (!modified) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/reviews/:id] error:", err);
    return NextResponse.json(
      { error: "Failed to update review." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/:id
 * Permanently removes a review.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const deleted = await deleteReview(id);
    if (!deleted) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/reviews/:id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete review." },
      { status: 500 }
    );
  }
}
