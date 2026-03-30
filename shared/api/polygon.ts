import type { AssetPrice } from "./coingecko";

const BASE = "https://api.polygon.io";

function key() {
  return process.env.POLYGON_API_KEY ?? "";
}

export type StockInfo = {
  symbol: string;
  name: string;
};

export type StockSearchResult = {
  symbol: string;
  name: string;
};

export type StockPriceMap = Record<string, AssetPrice>;

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!key()) return [];
  try {
    const url = `${BASE}/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&market=stocks&type=CS&limit=10&apiKey=${key()}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map((r: { ticker: string; name: string }) => ({
      symbol: r.ticker,
      name: r.name,
    }));
  } catch {
    return [];
  }
}

export async function lookupStock(ticker: string): Promise<StockInfo | null> {
  if (!key()) return null;
  try {
    const url = `${BASE}/v3/reference/tickers/${ticker.toUpperCase()}?apiKey=${key()}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    const r = data.results;
    if (!r?.ticker) return null;
    return { symbol: r.ticker, name: r.name };
  } catch {
    return null;
  }
}

async function getStockHourlyChanges(symbols: string[]): Promise<Record<string, number>> {
  const now = Date.now();
  const from = new Date(now - 2 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = new Date(now).toISOString().slice(0, 10);
  const results = await Promise.all(
    symbols.map(async (ticker) => {
      try {
        const url = `${BASE}/v2/aggs/ticker/${ticker}/range/1/hour/${from}/${to}?adjusted=true&sort=desc&limit=2&apiKey=${key()}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return [ticker, 0] as const;
        const data = await res.json();
        const bars: { c: number }[] = data.results ?? [];
        if (bars.length < 2) return [ticker, 0] as const;
        const change = ((bars[0].c - bars[1].c) / bars[1].c) * 100;
        return [ticker, change] as const;
      } catch {
        return [ticker, 0] as const;
      }
    })
  );
  return Object.fromEntries(results);
}

export async function getStockPrices(symbols: string[]): Promise<StockPriceMap> {
  if (symbols.length === 0 || !key()) return {};
  try {
    const tickers = symbols.join(",");
    const url = `${BASE}/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${encodeURIComponent(tickers)}&apiKey=${key()}`;
    const [snapshotRes, hourlyChanges] = await Promise.all([
      fetch(url, { next: { revalidate: 60 } }),
      getStockHourlyChanges(symbols),
    ]);
    if (!snapshotRes.ok) return {};
    const data = await snapshotRes.json();
    const result: StockPriceMap = {};
    for (const t of data.tickers ?? []) {
      const price = t.day?.c ?? t.lastTrade?.p;
      if (price != null) {
        result[t.ticker] = {
          usd: price,
          usd_1h_change: hourlyChanges[t.ticker] ?? 0,
          usd_24h_change: t.todaysChangePerc ?? 0,
        };
      }
    }
    return result;
  } catch {
    return {};
  }
}
