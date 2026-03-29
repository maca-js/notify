import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
const COOKIE_NAME = "sn_session";

export type SessionPayload = {
  userId: string;
  telegramId: number;
  firstName: string;
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function setSessionCookie(token: string): Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[0] {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  };
}

export function clearSessionCookie(): Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[0] {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  };
}

/**
 * Verify Telegram Login Widget HMAC hash.
 * https://core.telegram.org/widgets/login#checking-authorization
 */
export function verifyTelegramHash(data: Record<string, string>): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN!;
  const { hash, ...rest } = data;
  if (!hash) return false;

  const secretKey = crypto.createHash("sha256").update(botToken).digest();

  const checkString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  // Ensure auth_date is recent (within 1 hour)
  const authDate = parseInt(rest.auth_date, 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 3600) return false;

  return computedHash === hash;
}
