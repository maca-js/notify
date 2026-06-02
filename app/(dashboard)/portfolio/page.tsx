import { redirect } from "next/navigation";
import { getSession } from "@/shared/lib/auth";
import { getLotsForUser } from "@/entities/portfolio/queries";
import { getStockPrices } from "@/shared/api/finnhub";
import { PortfolioClient } from "./portfolio-client";
import type { Position } from "@/features/portfolio/HoldingsTable";
import type { PortfolioLotWithAsset } from "@/entities/portfolio/model";

export default async function PortfolioPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const lots = await getLotsForUser(session.userId);

  const symbols = [...new Set(lots.map((l) => l.assets.symbol.toUpperCase()))];
  const prices = await getStockPrices(symbols);

  // Aggregate lots into positions grouped by asset
  const positionMap = new Map<string, { lots: PortfolioLotWithAsset[] } & Pick<PortfolioLotWithAsset["assets"], "symbol" | "name"> & { assetId: string }>();

  for (const lot of lots) {
    const key = lot.asset_id;
    if (!positionMap.has(key)) {
      positionMap.set(key, { assetId: lot.asset_id, symbol: lot.assets.symbol, name: lot.assets.name, lots: [] });
    }
    positionMap.get(key)!.lots.push(lot);
  }

  const positions: Position[] = Array.from(positionMap.values()).map(({ assetId, symbol, name, lots: posLots }) => {
    const totalShares = posLots.reduce((sum, l) => sum + Number(l.quantity), 0);
    const totalCostRaw = posLots.reduce((sum, l) => sum + Number(l.quantity) * Number(l.cost_basis), 0);
    const avgCost = totalShares > 0 ? totalCostRaw / totalShares : 0;
    const price = prices[symbol.toUpperCase()];
    return {
      assetId,
      symbol,
      name,
      totalShares,
      avgCost,
      currentPrice: price?.usd ?? null,
      lots: posLots,
    };
  });

  const totalCost = positions.reduce((sum, p) => sum + p.totalShares * p.avgCost, 0);
  const totalValue = positions.reduce((sum, p) => {
    if (p.currentPrice == null) return sum + p.totalShares * p.avgCost;
    return sum + p.totalShares * p.currentPrice;
  }, 0);

  return (
    <PortfolioClient positions={positions} totalValue={totalValue} totalCost={totalCost} />
  );
}
