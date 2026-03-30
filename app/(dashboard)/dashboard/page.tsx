import { getSession } from "@/shared/lib/auth";
import { getAdminClient } from "@/shared/api/supabase";
import { getAlertsForUser } from "@/entities/alert/queries";
import { getCoinPrices } from "@/shared/api/coingecko";
import { getStockPrices } from "@/shared/api/finnhub";
import { DashboardClient } from "../dashboard-client";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const db = getAdminClient();

  const [watchlistResult, alerts, notificationsResult] = await Promise.all([
    db
      .from("watchlist")
      .select("id, created_at, assets(id, external_id, symbol, name, asset_type)")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false }),
    getAlertsForUser(session.userId),
    db
      .from("notifications")
      .select()
      .eq("user_id", session.userId)
      .order("sent_at", { ascending: false })
      .limit(50),
  ]);

  const items = watchlistResult.data ?? [];
  const cryptoIds = items.flatMap((i) => i.assets?.asset_type === "crypto" ? [i.assets.external_id] : []);
  const stockSymbols = items.flatMap((i) => i.assets?.asset_type === "stock" ? [i.assets.symbol.toUpperCase()] : []);

  const [cryptoPrices, stockPrices] = await Promise.all([
    getCoinPrices(cryptoIds),
    getStockPrices(stockSymbols),
  ]);
  const prices = { ...cryptoPrices, ...stockPrices };

  return (
    <DashboardClient
      watchlist={items as Parameters<typeof DashboardClient>[0]["watchlist"]}
      alerts={alerts}
      notifications={notificationsResult.data ?? []}
      prices={prices}
    />
  );
}
