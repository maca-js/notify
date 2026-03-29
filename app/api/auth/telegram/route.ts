import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramHash, signSession } from "@/shared/lib/auth";
import { upsertUser } from "@/entities/user/queries";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());

  if (!verifyTelegramHash(params)) {
    return NextResponse.json({ error: "Invalid Telegram auth" }, { status: 401 });
  }

  const user = await upsertUser({
    telegram_id: parseInt(params.id, 10),
    first_name: params.first_name,
    last_name: params.last_name ?? null,
    username: params.username ?? null,
    photo_url: params.photo_url ?? null,
  });

  const token = await signSession({
    userId: user.id,
    telegramId: user.telegram_id,
    firstName: user.first_name,
  });

  const cookieStore = await cookies();
  cookieStore.set("sn_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
