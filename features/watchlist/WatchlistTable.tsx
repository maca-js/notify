'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import type { AssetPrice } from '@/shared/api/coingecko';
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
  prices: Record<string, AssetPrice>;
  onManageAlerts: (assetId: string, assetName: string) => void;
};

function formatPrice(price: AssetPrice) {
  if (price.usd >= 1) {
    return '$' + price.usd.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  return '$' + price.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function formatChange(change: number) {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export function WatchlistTable({ items, prices, onManageAlerts }: Props) {
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
          const priceKey = asset.asset_type === 'crypto' ? asset.external_id : asset.symbol.toUpperCase();
          const price = prices[priceKey];
          return (
            <Card key={item.id} className="px-4 py-3 flex-row items-center justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{asset.name}</span>
                  <Badge variant="outline" className="shrink-0">{asset.symbol.toUpperCase()}</Badge>
                </div>
                {price ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm">{formatPrice(price)}</span>
                    <span className={`text-xs ${price.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatChange(price.usd_24h_change)}
                    </span>
                  </div>
                ) : null}
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
              <TableHead>Price / 24h</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              if (!item.assets) return null;
              const asset = item.assets;
              const priceKey = asset.asset_type === 'crypto' ? asset.external_id : asset.symbol.toUpperCase();
              const price = prices[priceKey];
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{asset.symbol.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    {price ? (
                      <div className="flex items-center gap-2">
                        <span>{formatPrice(price)}</span>
                        <span className={`text-xs ${price.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatChange(price.usd_24h_change)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
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
