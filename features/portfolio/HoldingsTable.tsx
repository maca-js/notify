"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import type { PortfolioLotWithAsset } from "@/entities/portfolio/model";
import type { StockPriceMap } from "@/shared/api/finnhub";
import { deleteLotAction } from "./actions";

export type Position = {
  assetId: string;
  symbol: string;
  name: string;
  totalShares: number;
  avgCost: number;
  currentPrice: number | null;
  lots: PortfolioLotWithAsset[];
};

type Props = {
  positions: Position[];
  onAddLot: (symbol: string, name: string) => void;
  onEditLot: (lot: PortfolioLotWithAsset) => void;
};

function formatUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function PnlCell({ value, pct }: { value: number; pct: number }) {
  const pos = value >= 0;
  return (
    <div className={pos ? "text-green-500" : "text-red-500"}>
      <span className="font-medium">{pos ? "+" : ""}{formatUsd(value)}</span>
      <span className="text-xs ml-1">({pos ? "+" : ""}{pct.toFixed(2)}%)</span>
    </div>
  );
}

function PositionRow({ position, onAddLot, onEditLot }: { position: Position; onAddLot: Props["onAddLot"]; onEditLot: Props["onEditLot"] }) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const marketValue = position.currentPrice != null ? position.totalShares * position.currentPrice : null;
  const totalCost = position.totalShares * position.avgCost;
  const pnl = marketValue != null ? marketValue - totalCost : null;
  const pnlPct = pnl != null && totalCost > 0 ? (pnl / totalCost) * 100 : null;

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setExpanded((v) => !v)}>
        <TableCell>
          <div className="flex items-center gap-1.5">
            {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            <span className="font-medium">{position.symbol}</span>
          </div>
        </TableCell>
        <TableCell>{position.totalShares.toLocaleString(undefined, { maximumFractionDigits: 6 })}</TableCell>
        <TableCell>{formatUsd(position.avgCost)}</TableCell>
        <TableCell>{position.currentPrice != null ? formatUsd(position.currentPrice) : <span className="text-muted-foreground">—</span>}</TableCell>
        <TableCell>{marketValue != null ? formatUsd(marketValue) : <span className="text-muted-foreground">—</span>}</TableCell>
        <TableCell>
          {pnl != null && pnlPct != null ? <PnlCell value={pnl} pct={pnlPct} /> : <span className="text-muted-foreground">—</span>}
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" onClick={() => onAddLot(position.symbol, position.name)}>
            <Plus className="h-3 w-3 mr-1" />
            Add lot
          </Button>
        </TableCell>
      </TableRow>

      {expanded && position.lots.map((lot) => (
        <TableRow key={lot.id} className="bg-muted/30 text-sm">
          <TableCell className="pl-10 text-muted-foreground">{lot.purchase_date}</TableCell>
          <TableCell>{Number(lot.quantity).toLocaleString(undefined, { maximumFractionDigits: 6 })}</TableCell>
          <TableCell>{formatUsd(Number(lot.cost_basis))}</TableCell>
          <TableCell></TableCell>
          <TableCell className="text-muted-foreground">{formatUsd(Number(lot.quantity) * Number(lot.cost_basis))}</TableCell>
          <TableCell></TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-1">
              <Button size="sm" variant="ghost" disabled={isPending} onClick={() => onEditLot(lot)}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                disabled={isPending}
                onClick={() => startTransition(() => deleteLotAction(lot.id))}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function MobilePositionCard({ position, onAddLot, onEditLot }: { position: Position; onAddLot: Props["onAddLot"]; onEditLot: Props["onEditLot"] }) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const marketValue = position.currentPrice != null ? position.totalShares * position.currentPrice : null;
  const totalCost = position.totalShares * position.avgCost;
  const pnl = marketValue != null ? marketValue - totalCost : null;
  const pnlPct = pnl != null && totalCost > 0 ? (pnl / totalCost) * 100 : null;
  const isPositive = pnl != null && pnl >= 0;

  return (
    <Card className="px-4 py-3 gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-sm truncate">{position.name}</span>
          <Badge variant="outline" className="shrink-0">{position.symbol}</Badge>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="sm" variant="outline" onClick={() => onAddLot(position.symbol, position.name)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setExpanded((v) => !v)}>
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-1">
        <div className="text-muted-foreground">Shares</div>
        <div>{position.totalShares.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
        <div className="text-muted-foreground">Avg cost</div>
        <div>{formatUsd(position.avgCost)}</div>
        {position.currentPrice != null && (
          <>
            <div className="text-muted-foreground">Current</div>
            <div>{formatUsd(position.currentPrice)}</div>
          </>
        )}
        {marketValue != null && (
          <>
            <div className="text-muted-foreground">Value</div>
            <div>{formatUsd(marketValue)}</div>
          </>
        )}
        {pnl != null && pnlPct != null && (
          <>
            <div className="text-muted-foreground">P&amp;L</div>
            <div className={isPositive ? "text-green-500" : "text-red-500"}>
              {isPositive ? "+" : ""}{formatUsd(pnl)} ({isPositive ? "+" : ""}{pnlPct.toFixed(2)}%)
            </div>
          </>
        )}
      </div>

      {expanded && (
        <div className="mt-2 space-y-2 border-t pt-2">
          {position.lots.map((lot) => (
            <div key={lot.id} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{lot.purchase_date}</span>
              <span>{Number(lot.quantity)} shares @ {formatUsd(Number(lot.cost_basis))}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" disabled={isPending} onClick={() => onEditLot(lot)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteLotAction(lot.id))}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function HoldingsTable({ positions, onAddLot, onEditLot }: Props) {
  if (positions.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-6 text-center">
        No holdings yet. Add your first position to get started.
      </p>
    );
  }

  return (
    <>
      {/* Mobile */}
      <div className="space-y-3 sm:hidden">
        {positions.map((pos) => (
          <MobilePositionCard key={pos.assetId} position={pos} onAddLot={onAddLot} onEditLot={onEditLot} />
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stock</TableHead>
              <TableHead>Shares</TableHead>
              <TableHead>Avg cost</TableHead>
              <TableHead>Current price</TableHead>
              <TableHead>Market value</TableHead>
              <TableHead>Unrealized P&amp;L</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((pos) => (
              <PositionRow key={pos.assetId} position={pos} onAddLot={onAddLot} onEditLot={onEditLot} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
