const BASE_URL = "https://api.coingecko.com/api/v3";

export type CoinSearchResult = {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
};

export type CoinPrice = {
  usd: number;
  usd_24h_change: number;
};

export type CoinPriceMap = Record<string, CoinPrice>;

export async function searchCoins(query: string): Promise<CoinSearchResult[]> {
  const res = await fetch(
    `${BASE_URL}/search?query=${encodeURIComponent(query)}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error("CoinGecko search failed");
  const data = await res.json();
  return (data.coins as CoinSearchResult[]).slice(0, 10);
}

export async function getCoinPrices(ids: string[]): Promise<CoinPriceMap> {
  if (ids.length === 0) return {};
  const idsParam = ids.join(",");
  const res = await fetch(
    `${BASE_URL}/simple/price?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("CoinGecko price fetch failed");
  return res.json();
}
