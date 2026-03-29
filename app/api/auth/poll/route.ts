import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/shared/api/supabase";
import { signSession } from "@/shared/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const db = getAdminClient();
  const { data } = await db
    .from("auth_tokens")
    .select("verified_at, user_id, expires_at")
    .eq("token", token)
    .single();

  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }

  if (!data.verified_at || !data.user_id) {
    return NextResponse.json({ pending: true });
  }

  const { data: user } = await db
    .from("users")
    .select("*")
    .eq("id", data.user_id)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const sessionToken = await signSession({
    userId: user.id,
    telegramId: user.telegram_id,
    firstName: user.first_name,
  });

  const cookieStore = await cookies();
  cookieStore.set("sn_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  await db.from("auth_tokens").delete().eq("token", token);

  return NextResponse.json({ success: true });
}
