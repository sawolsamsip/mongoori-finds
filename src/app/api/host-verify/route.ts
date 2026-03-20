import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const ridesUrl = process.env.RIDES_API_URL || "https://rides.mongoori.com";
  const apiKey = process.env.RIDES_INTERNAL_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Host verification not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `${ridesUrl}/api/user/host-verify?email=${encodeURIComponent(email)}`,
      {
        headers: { "x-finds-api-key": apiKey },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ isHost: false, error: "Verification failed" }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json({ isHost: data.isHost === true, orderCount: data.orderCount ?? 0 });
  } catch {
    return NextResponse.json({ isHost: false }, { status: 200 });
  }
}
