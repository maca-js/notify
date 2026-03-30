'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { removeFromWatchlist } from './actions';

type WatchlistItem = {
  id: string;
  assets: {
    id: string;
    external_id: string;
    symbol: string;
    name: string;
    asset_type: 'crypto' | 'stock';
  } | null;
};

type Props = {
  items: WatchlistItem[];
  onManageAlerts: (assetId: string, assetName: string) => void;
};

export function WatchlistTable({ items, onManageAlerts }: Props) {
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-6 text-center">
        Your watchlist is empty. Search for an asset to get started.
      </p>
    );
  }

  return (
    <>
      {/* Mobile card layout */}
      <div className="space-y-3 sm:hidden">
        {items.map((item) => {
          if (!item.assets) return null;
          const asset = item.assets;
          return (
            <Card key={item.id} className="px-4 py-3 flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm truncate">{asset.name}</span>
                <Badge variant="outline" className="shrink-0">{asset.symbol.toUpperCase()}</Badge>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="outline" onClick={() => onManageAlerts(asset.id, asset.name)}>
                  <Bell className="h-3.5 w-3.5" />
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={isPending}
                  onClick={() => startTransition(() => removeFromWatchlist(item.id))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Desktop table layout */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              if (!item.assets) return null;
              const asset = item.assets;
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{asset.symbol.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => onManageAlerts(asset.id, asset.name)}>
                        <Bell className="h-3 w-3 mr-1" />
                        Alert
                        <Plus className="h-3 w-3 ml-1" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={isPending}
                        onClick={() => startTransition(() => removeFromWatchlist(item.id))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
