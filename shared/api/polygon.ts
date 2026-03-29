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

export async function getStockPrices(symbols: string[]): Promise<StockPriceMap> {
  if (symbols.length === 0 || !key()) return {};
  try {
    const tickers = symbols.join(",");
    const url = `${BASE}/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${encodeURIComponent(tickers)}&apiKey=${key()}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return {};
    const data = await res.json();
    const result: StockPriceMap = {};
    for (const t of data.tickers ?? []) {
      const price = t.day?.c ?? t.lastTrade?.p;
      if (price != null) {
        result[t.ticker] = {
          usd: price,
          usd_24h_change: t.todaysChangePerc ?? 0,
        };
      }
    }
    return result;
  } catch {
    return {};
  }
}
