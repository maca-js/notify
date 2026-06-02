"use client";

import { Card } from "@/components/ui/card";

type Props = {
  totalValue: number;
  totalCost: number;
};

function formatUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export function PortfolioSummary({ totalValue, totalCost }: Props) {
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  const isPositive = pnl >= 0;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <Card className="px-4 py-3">
        <p className="text-xs text-muted-foreground mb-1">Portfolio value</p>
        <p className="text-lg font-semibold">{formatUsd(totalValue)}</p>
      </Card>
      <Card className="px-4 py-3">
        <p className="text-xs text-muted-foreground mb-1">Total cost</p>
        <p className="text-lg font-semibold">{formatUsd(totalCost)}</p>
      </Card>
      <Card className="px-4 py-3">
        <p className="text-xs text-muted-foreground mb-1">Unrealized P&amp;L</p>
        <p className={`text-lg font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{formatUsd(pnl)}
        </p>
        <p className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{pnlPct.toFixed(2)}%
        </p>
      </Card>
    </div>
  );
}
