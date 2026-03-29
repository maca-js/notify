const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export async function sendMessage(chatId: number, text: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Telegram sendMessage failed: ${error}`);
  }
}

export async function setWebhook(url: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error("Failed to set Telegram webhook");
}
