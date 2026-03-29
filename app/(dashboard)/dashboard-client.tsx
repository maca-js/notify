"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WatchlistTable } from "@/features/watchlist/WatchlistTable";
import { AssetSearch } from "@/features/watchlist/AssetSearch";
import { AlertList } from "@/features/alerts/AlertList";
import { AlertForm } from "@/features/alerts/AlertForm";
import { NotificationLog } from "@/features/notifications/NotificationLog";
import { Separator } from "@/components/ui/separator";
import type { AlertWithAsset } from "@/entities/alert/model";
import type { Database } from "@/shared/api/supabase.types";

type WatchlistItem = {
  id: string;
  assets: {
    id: string;
    coingecko_id: string;
    symbol: string;
    name: string;
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
        <TabsList className="mb-6">
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="history">Notification history</TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add asset</CardTitle>
              </CardHeader>
              <CardContent>
                <AssetSearch />
              </CardContent>
            </Card>

            <Separator />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Your watchlist ({watchlist.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WatchlistTable
                  items={watchlist}
                  onManageAlerts={openAlertForm}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Active alerts ({alerts.filter((a) => a.is_active).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AlertList alerts={alerts} onNewAlert={openAlertForm} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationLog notifications={notifications} />
            </CardContent>
          </Card>
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
