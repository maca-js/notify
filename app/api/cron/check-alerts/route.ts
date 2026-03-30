import { NextRequest, NextResponse } from "next/server";
import { getAllActiveAlerts, updateAlertTriggered } from "@/entities/alert/queries";
import { getCoinPrices, type AssetPrice } from "@/shared/api/coingecko";
import { getStockPrices, getStockHourlyChanges } from "@/shared/api/finnhub";
import { sendMessage } from "@/shared/api/telegram";
import { evaluateAlert, isInCooldown, formatAlertMessage } from "@/shared/lib/alert-evaluator";
import { getAdminClient } from "@/shared/api/supabase";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await getAllActiveAlerts();
  if (alerts.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  // Fetch prices for crypto and stocks separately, then merge
  const cryptoIds = [...new Set(
    alerts.filter((a) => a.assets.asset_type === "crypto").map((a) => a.assets.external_id)
  )];
  const stockSymbols = [...new Set(
    alerts.filter((a) => a.assets.asset_type === "stock").map((a) => a.assets.external_id)
  )];

  const stockSymbolsWith1h = [...new Set(
    alerts
      .filter((a) => a.assets.asset_type === "stock" && a.timeframe === "1h")
      .map((a) => a.assets.external_id)
  )];

  const [cryptoPrices, stockPrices, hourlyChanges] = await Promise.all([
    getCoinPrices(cryptoIds),
    getStockPrices(stockSymbols),
    stockSymbolsWith1h.length > 0 ? getStockHourlyChanges(stockSymbolsWith1h) : Promise.resolve({} as Record<string, number>),
  ]);

  for (const sym of stockSymbolsWith1h) {
    if (stockPrices[sym]) {
      stockPrices[sym].usd_1h_change = hourlyChanges[sym] ?? 0;
    }
  }

  const prices: Record<string, AssetPrice> = { ...cryptoPrices, ...stockPrices };

  const db = getAdminClient();
  let triggered = 0;

  for (const alert of alerts) {
    const price = prices[alert.assets.external_id];
    if (!price) continue;
    if (isInCooldown(alert)) continue;
    if (!evaluateAlert(alert, price)) continue;

    const message = formatAlertMessage(
      alert.assets.name,
      alert.assets.symbol,
      alert,
      price
    );

    const { data: user } = await db
      .from("users")
      .select("telegram_id")
      .eq("id", alert.user_id)
      .single();

    if (!user) continue;

    try {
      await sendMessage(user.telegram_id, message);
      await updateAlertTriggered(alert.id);

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
