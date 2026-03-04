import { NextRequest, NextResponse } from "next/server";
import { getAdminPassword, getAdminToken, getSetCookieHeader } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = (body.password as string | undefined)?.trim();
  const expectedPw = getAdminPassword();
  const expected = getAdminToken();

  if (!expectedPw || !expected) {
    return NextResponse.json(
      { error: "Admin not configured. Set ADMIN_PASSWORD in environment." },
      { status: 500 }
    );
  }

  if (!password || password !== expectedPw) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const isSecure = req.headers.get("x-forwarded-proto") === "https" || req.url.startsWith("https");
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", getSetCookieHeader(expected, isSecure));
  return res;
}
