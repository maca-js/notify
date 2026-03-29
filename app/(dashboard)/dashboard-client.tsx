"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WatchlistTable } from "@/features/watchlist/WatchlistTable";
import { AssetSearch } from "@/features/watchlist/AssetSearch";
import { AlertList } from "@/features/alerts/AlertList";
import { AlertForm } from "@/features/alerts/AlertForm";
import { NotificationLog } from "@/features/notifications/NotificationLog";
import type { AlertWithAsset } from "@/entities/alert/model";
import type { Database } from "@/shared/api/supabase.types";

type WatchlistItem = {
  id: string;
  assets: {
    id: string;
    external_id: string;
    symbol: string;
    name: string;
    asset_type: "crypto" | "stock";
  } | null;
};

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

type Props = {
  watchlist: WatchlistItem[];
  alerts: AlertWithAsset[];
  notifications: Notification[];
};

export function DashboardClient({ watchlist, alerts, notifications }: Props) {
  const [alertModal, setAlertModal] = useState<{
    assetId: string;
    assetName: string;
  } | null>(null);

  function openAlertForm(assetId: string, assetName: string) {
    setAlertModal({ assetId, assetName });
  }

  return (
    <>
      <Tabs defaultValue="watchlist">
        <TabsList variant="line" className="mb-8 w-full justify-start gap-6">
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist">
          <div className="space-y-10">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Add asset</p>
              <AssetSearch />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                Watchlist · {watchlist.length}
              </p>
              <WatchlistTable items={watchlist} onManageAlerts={openAlertForm} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
              Active alerts · {alerts.filter((a) => a.is_active).length}
            </p>
            <AlertList alerts={alerts} onNewAlert={openAlertForm} />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Recent notifications</p>
            <NotificationLog notifications={notifications} />
          </div>
        </TabsContent>
      </Tabs>

      {alertModal && (
        <AlertForm
          assetId={alertModal.assetId}
          assetName={alertModal.assetName}
          open={true}
          onClose={() => setAlertModal(null)}
        />
      )}
    </>
  );
}
