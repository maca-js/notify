import { NextResponse } from "next/server";
import { getAdminClient } from "@/shared/api/supabase";
import crypto from "crypto";

export async function POST() {
  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  const db = getAdminClient();
  const { error } = await db.from("auth_tokens").insert({ token, expires_at: expiresAt });

  if (error) {
    return NextResponse.json({ error: "Failed to create auth token" }, { status: 500 });
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const deepLink = `https://t.me/${botUsername}?start=${token}`;

  return NextResponse.json({ token, deepLink });
}
