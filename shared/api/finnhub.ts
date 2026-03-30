import type { AssetPrice } from "./coingecko";

const BASE = "https://finnhub.io/api/v1";

function key() {
  return process.env.FINNHUB_API_KEY ?? "";
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
    const url = `${BASE}/search?q=${encodeURIComponent(query)}&token=${key()}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    // Keep only plain US tickers (no exchange suffix like "AAPL:US")
    return (data.result ?? [])
      .filter((r: { symbol: string; type: string }) =>
        r.type === "Common Stock" && /^[A-Z.]+$/.test(r.symbol)
      )
      .slice(0, 10)
      .map((r: { symbol: string; description: string }) => ({
        symbol: r.symbol,
        name: r.description,
      }));
  } catch {
    return [];
  }
}

export async function lookupStock(ticker: string): Promise<StockInfo | null> {
  if (!key()) return null;
  try {
    const url = `${BASE}/stock/profile2?symbol=${ticker.toUpperCase()}&token=${key()}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.ticker) return null;
    return { symbol: data.ticker, name: data.name };
  } catch {
    return null;
  }
}

export async function getStockHourlyChanges(symbols: string[]): Promise<Record<string, number>> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - 2 * 60 * 60;
  const results = await Promise.all(
    symbols.map(async (ticker) => {
      try {
        const url = `${BASE}/stock/candle?symbol=${ticker}&resolution=60&from=${from}&to=${now}&token=${key()}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return [ticker, 0] as const;
        const data = await res.json();
        if (data.s !== "ok" || !data.c || data.c.length < 2) return [ticker, 0] as const;
        const closes = data.c as number[];
        const prev = closes[closes.length - 2];
        const curr = closes[closes.length - 1];
        return [ticker, ((curr - prev) / prev) * 100] as const;
      } catch {
        return [ticker, 0] as const;
      }
    })
  );
  return Object.fromEntries(results);
}

export async function getStockPrices(symbols: string[]): Promise<StockPriceMap> {
  if (symbols.length === 0 || !key()) return {};
  const results = await Promise.all(
    symbols.map(async (ticker) => {
      try {
        const url = `${BASE}/quote?symbol=${ticker}&token=${key()}`;
        const res = await fetch(url, { next: { revalidate: 120 } });
        if (!res.ok) return [ticker, null] as const;
        const q = await res.json();
        // q.c is 0 when no data (e.g. invalid ticker)
        if (!q.c) return [ticker, null] as const;
        return [ticker, {
          usd: q.c as number,
          usd_1h_change: 0,
          usd_24h_change: (q.dp as number) ?? 0,
        }] as const;
      } catch {
        return [ticker, null] as const;
      }
    })
  );
  const map: StockPriceMap = {};
  for (const [ticker, price] of results) {
    if (price != null) map[ticker] = price;
  }
  return map;
}
