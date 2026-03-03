import { NextRequest, NextResponse } from "next/server";
import { getAdminToken, getSetCookieHeader } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = body.password as string | undefined;
  const expected = getAdminToken();

  if (!expected) {
    return NextResponse.json(
      { error: "Admin not configured. Set ADMIN_PASSWORD." },
      { status: 500 }
    );
  }

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", getSetCookieHeader(expected));
  return res;
}
