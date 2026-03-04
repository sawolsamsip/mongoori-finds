import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_token";
const SALT = "mongoori-finds-admin";

export function getAdminPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD?.trim();
  return pw && pw.length > 0 ? pw : null;
}

export function getAdminToken(): string | null {
  const pw = getAdminPassword();
  if (!pw) return null;
  return createHmac("sha256", pw).update(SALT).digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? null;
  const expected = getAdminToken();
  if (!expected || !token) return false;
  try {
    const a = Buffer.from(token, "utf8");
    const b = Buffer.from(expected, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function getSetCookieHeader(value: string, secure = false): string {
  const securePart = secure ? "; Secure" : "";
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${securePart}`;
}
