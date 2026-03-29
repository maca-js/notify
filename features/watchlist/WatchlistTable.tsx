"use client";

import { useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Bell } from "lucide-react";
import { removeFromWatchlist } from "./actions";

type WatchlistItem = {
  id: string;
  assets: {
    id: string;
    coingecko_id: string;
    symbol: string;
    name: string;
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onManageAlerts(asset.id, asset.name)}
                  >
                    <Bell className="h-3 w-3 mr-1" />
                    Alerts
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() => removeFromWatchlist(item.id))
                    }
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
  );
}
