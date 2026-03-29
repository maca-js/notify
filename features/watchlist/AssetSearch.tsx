"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2 } from "lucide-react";
import type { CoinSearchResult } from "@/shared/api/coingecko";
import type { StockSearchResult } from "@/shared/api/polygon";
import { addToWatchlist } from "./actions";

type AssetType = "crypto" | "stock";

export function AssetSearch() {
  const [assetType, setAssetType] = useState<AssetType>("crypto");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          variant={assetType === "crypto" ? "default" : "outline"}
          size="sm"
          onClick={() => setAssetType("crypto")}
        >
          Crypto
        </Button>
        <Button
          variant={assetType === "stock" ? "default" : "outline"}
          size="sm"
          onClick={() => setAssetType("stock")}
        >
          Stock
        </Button>
      </div>

      {assetType === "crypto" ? <CryptoSearch /> : <StockSearch />}
    </div>
  );
}

function CryptoSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CoinSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: abortRef.current.signal });
        const data = await res.json();
        setResults(data);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  function handleAdd(coin: CoinSearchResult) {
    startTransition(async () => {
      await addToWatchlist(coin.id, coin.symbol, coin.name, "crypto");
      setAddedIds((prev) => new Set(prev).add(coin.id));
    });
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          placeholder="Search crypto (e.g. bitcoin, ethereum...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-8"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </div>
      </div>

      {results.length > 0 && (
        <ul className="border rounded-md divide-y bg-background shadow-sm max-h-64 overflow-y-auto">
          {results.map((coin) => (
            <li key={coin.id} className="flex items-center justify-between px-3 py-2 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {coin.thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coin.thumb}
                    alt={coin.name}
                    className="w-6 h-6 rounded-full shrink-0"
                  />
                )}
                <span className="font-medium truncate">{coin.name}</span>
                <Badge variant="secondary" className="shrink-0">
                  {coin.symbol.toUpperCase()}
                </Badge>
              </div>
              <Button
                size="sm"
                variant={addedIds.has(coin.id) ? "secondary" : "default"}
                onClick={() => handleAdd(coin)}
                disabled={isPending || addedIds.has(coin.id)}
                className="shrink-0"
              >
                {addedIds.has(coin.id) ? "Added" : <><Plus className="h-3 w-3 mr-1" />Add</>}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StockSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [addedSymbols, setAddedSymbols] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setSearching(true);
      try {
        const res = await fetch(`/api/stock-search?q=${encodeURIComponent(query)}`, { signal: abortRef.current.signal });
        const data = await res.json();
        setResults(data);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  function handleAdd(stock: StockSearchResult) {
    startTransition(async () => {
      await addToWatchlist(stock.symbol, stock.symbol, stock.name, "stock");
      setAddedSymbols((prev) => new Set(prev).add(stock.symbol));
    });
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          placeholder="Search stocks (e.g. Microsoft, Apple...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-8"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </div>
      </div>

      {results.length > 0 && (
        <ul className="border rounded-md divide-y bg-background shadow-sm max-h-64 overflow-y-auto">
          {results.map((stock) => (
            <li key={stock.symbol} className="flex items-center justify-between px-3 py-2 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate">{stock.name}</span>
                <Badge variant="secondary" className="shrink-0">
                  {stock.symbol}
                </Badge>
              </div>
              <Button
                size="sm"
                variant={addedSymbols.has(stock.symbol) ? "secondary" : "default"}
                onClick={() => handleAdd(stock)}
                disabled={isPending || addedSymbols.has(stock.symbol)}
                className="shrink-0"
              >
                {addedSymbols.has(stock.symbol) ? "Added" : <><Plus className="h-3 w-3 mr-1" />Add</>}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
