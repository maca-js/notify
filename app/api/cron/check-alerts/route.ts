import { NextRequest, NextResponse } from "next/server";
import { getAllActiveAlerts, updateAlertTriggered } from "@/entities/alert/queries";
import { getCoinPrices } from "@/shared/api/coingecko";
import { sendMessage } from "@/shared/api/telegram";
import { evaluateAlert, isInCooldown, formatAlertMessage } from "@/shared/lib/alert-evaluator";
import { getAdminClient } from "@/shared/api/supabase";

export async function POST(req: NextRequest) {
  // Verify shared secret to prevent unauthorized calls
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await getAllActiveAlerts();
  if (alerts.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  // Collect unique coingecko IDs
  const coinIds = [...new Set(alerts.map((a) => a.assets.coingecko_id))];
  const prices = await getCoinPrices(coinIds);

  const db = getAdminClient();
  let triggered = 0;

  for (const alert of alerts) {
    const price = prices[alert.assets.coingecko_id];
    if (!price) continue;
    if (isInCooldown(alert)) continue;
    if (!evaluateAlert(alert, price)) continue;

    const message = formatAlertMessage(
      alert.assets.name,
      alert.assets.symbol,
      alert,
      price
    );

    // Get user's telegram_id
    const { data: user } = await db
      .from("users")
      .select("telegram_id")
      .eq("id", alert.user_id)
      .single();

    if (!user) continue;

    try {
      await sendMessage(user.telegram_id, message);
      await updateAlertTriggered(alert.id);

      // Log notification
      await db.from("notifications").insert({
        user_id: alert.user_id,
        alert_id: alert.id,
        asset_name: alert.assets.name,
        message,
      });

      triggered++;
    } catch (err) {
      console.error(`Failed to send notification for alert ${alert.id}:`, err);
    }
  }

  return NextResponse.json({ processed: alerts.length, triggered });
}
