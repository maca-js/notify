import { getSession } from "@/shared/lib/auth";
import { getAdminClient } from "@/shared/api/supabase";
import { getAlertsForUser } from "@/entities/alert/queries";
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

  return (
    <DashboardClient
      watchlist={(watchlistResult.data ?? []) as Parameters<typeof DashboardClient>[0]["watchlist"]}
      alerts={alerts}
      notifications={notificationsResult.data ?? []}
    />
  );
}
