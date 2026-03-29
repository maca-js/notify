import YahooFinance from "yahoo-finance2";
import type { AssetPrice } from "./coingecko";

const yf = new YahooFinance();

export type StockInfo = {
  symbol: string;
  name: string;
};

export type StockPriceMap = Record<string, AssetPrice>;

export async function lookupStock(ticker: string): Promise<StockInfo | null> {
  const symbol = ticker.toUpperCase().trim();
  try {
    const quote = await yf.quote(symbol);
    if (!quote?.regularMarketPrice) return null;
    return {
      symbol: quote.symbol,
      name: quote.shortName ?? quote.longName ?? quote.symbol,
    };
  } catch {
    return null;
  }
}

export async function getStockPrices(symbols: string[]): Promise<StockPriceMap> {
  if (symbols.length === 0) return {};

  const result: StockPriceMap = {};
  const quotes = await Promise.allSettled(symbols.map((s) => yf.quote(s)));

  for (let i = 0; i < quotes.length; i++) {
    const q = quotes[i];
    if (q.status === "fulfilled" && q.value?.regularMarketPrice != null) {
      result[symbols[i]] = {
        usd: q.value.regularMarketPrice,
        usd_24h_change: q.value.regularMarketChangePercent ?? 0,
      };
    }
  }

  return result;
}
