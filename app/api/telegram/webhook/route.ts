import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/shared/api/telegram";
import { getAdminClient } from "@/shared/api/supabase";

type TelegramUpdate = {
  message?: {
    chat: { id: number };
    text?: string;
    from?: { first_name?: string };
  };
};

export async function POST(req: NextRequest) {
  const update: TelegramUpdate = await req.json();
  const message = update.message;

  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId = message.chat.id;
  const text = message.text.trim();
  const firstName = message.from?.first_name ?? "there";

  if (text === "/start") {
    await sendMessage(
      chatId,
      `👋 Hello <b>${firstName}</b>!\n\nThis bot sends you price alerts for your tracked crypto assets.\n\nSet up your watchlist and alerts at <b>${process.env.NEXT_PUBLIC_APP_URL}</b>`
    );
    return NextResponse.json({ ok: true });
  }

  if (text === "/alerts") {
    const db = getAdminClient();
    const { data: user } = await db
      .from("users")
      .select("id")
      .eq("telegram_id", chatId)
      .single();

    if (!user) {
      await sendMessage(chatId, "You don't have an account yet. Visit the app to get started.");
      return NextResponse.json({ ok: true });
    }

    const { data: alerts } = await db
      .from("alerts")
      .select("*, assets(name, symbol)")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (!alerts || alerts.length === 0) {
      await sendMessage(chatId, "You have no active alerts.");
      return NextResponse.json({ ok: true });
    }

    const lines = alerts.map((a) => {
      const asset = a.assets as { name: string; symbol: string } | null;
      if (!asset) return "";
      const val =
        a.type === "percent_change" ? `${a.value}%` : `$${a.value.toLocaleString()}`;
      const dir = a.condition === "above" ? "↑" : "↓";
      return `• ${asset.name} (${asset.symbol.toUpperCase()}) ${dir} ${val}`;
    });

    await sendMessage(chatId, `Your active alerts:\n\n${lines.join("\n")}`);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
