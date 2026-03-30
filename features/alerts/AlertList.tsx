'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AlertWithAsset } from '@/entities/alert/model';
import { ALERT_CONDITION_LABELS, getAlertTypeLabel } from '@/entities/alert/model';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { deleteAlertAction, toggleAlertAction } from './actions';

function formatCooldown(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return hours === 1 ? '1 hour' : `${hours} hours`;
}

type Props = {
  alerts: AlertWithAsset[];
  onNewAlert: (assetId: string, assetName: string) => void;
  onEditAlert: (alert: AlertWithAsset) => void;
};

export function AlertList({ alerts, onNewAlert, onEditAlert }: Props) {
  const [isPending, startTransition] = useTransition();

  if (alerts.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4 text-center">
        No alerts configured. Add an asset to your watchlist and create an alert.
      </p>
    );
  }

  // Group alerts by asset
  const grouped = alerts.reduce<Record<string, AlertWithAsset[]>>((acc, alert) => {
    const key = alert.asset_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(alert);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([assetId, assetAlerts]) => {
        const assetName = assetAlerts[0].assets.name;
        const symbol = assetAlerts[0].assets.symbol;
        return (
          <div key={assetId}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{assetName}</h3>
                <Badge variant="outline">{symbol.toUpperCase()}</Badge>
              </div>
              <Button size="sm" variant="outline" onClick={() => onNewAlert(assetId, assetName)}>
                <Plus className="h-3 w-3 mr-1" />
                Add alert
              </Button>
            </div>
            {/* Mobile card layout */}
            <div className="space-y-2 sm:hidden">
              {assetAlerts.map((alert) => (
                <Card key={alert.id} className="px-4 py-3 gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm truncate">
                      {getAlertTypeLabel(alert.type, alert.timeframe)}
                      <span className="text-muted-foreground"> · {ALERT_CONDITION_LABELS[alert.condition]} · </span>
                      <span className="font-medium">{alert.type === 'percent_change' ? `${alert.value}%` : `$${alert.value.toLocaleString()}`}</span>
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground mr-1">{alert.is_active ? 'Active' : 'Inactive'}</span>
                      <Switch
                        checked={alert.is_active}
                        disabled={isPending}
                        onCheckedChange={(checked) => startTransition(() => toggleAlertAction(alert.id, checked))}
                      />
                      <Button size="sm" variant="ghost" disabled={isPending} onClick={() => onEditAlert(alert)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={isPending}
                        onClick={() => startTransition(() => deleteAlertAction(alert.id))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop table layout */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Cooldown</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{getAlertTypeLabel(alert.type, alert.timeframe)}</TableCell>
                      <TableCell className="capitalize">{ALERT_CONDITION_LABELS[alert.condition]}</TableCell>
                      <TableCell>
                        {alert.type === 'percent_change' ? `${alert.value}%` : `$${alert.value.toLocaleString()}`}
                      </TableCell>
                      <TableCell>{formatCooldown(alert.cooldown_minutes)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={alert.is_active}
                          disabled={isPending}
                          onCheckedChange={(checked) => startTransition(() => toggleAlertAction(alert.id, checked))}
                        />
                      </TableCell>
                      <TableCell className="flex items-center gap-2 justify-end">
                        <Button size="sm" variant="ghost" disabled={isPending} onClick={() => onEditAlert(alert)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={isPending}
                          onClick={() => startTransition(() => deleteAlertAction(alert.id))}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
