import { NextRequest, NextResponse } from "next/server";
import { getPointsBalance } from "@/lib/points";

/**
 * GET /api/points?email=xxx
 * Returns points balance and recent ledger entries for a customer.
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  try {
    const { balance, ledger } = await getPointsBalance(email);
    // Expose last 20 entries, most recent first
    const recentLedger = [...ledger].reverse().slice(0, 20);
    return NextResponse.json({ balance, ledger: recentLedger });
  } catch (err) {
    console.error("Points balance error:", err);
    return NextResponse.json({ error: "Failed to fetch points" }, { status: 500 });
  }
}
