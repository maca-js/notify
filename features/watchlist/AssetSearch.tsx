"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2 } from "lucide-react";
import type { CoinSearchResult } from "@/shared/api/coingecko";
import type { StockInfo } from "@/shared/api/yahoo-finance";
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

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } finally {
      setSearching(false);
    }
  }

  function handleAdd(coin: CoinSearchResult) {
    startTransition(async () => {
      await addToWatchlist(coin.id, coin.symbol, coin.name, "crypto");
      setAddedIds((prev) => new Set(prev).add(coin.id));
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Search crypto (e.g. bitcoin, ethereum...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={searching} variant="outline" size="icon">
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
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
  const [ticker, setTicker] = useState("");
  const [result, setResult] = useState<StockInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [looking, setLooking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  async function handleLookup() {
    if (!ticker.trim()) return;
    setLooking(true);
    setNotFound(false);
    setResult(null);
    setAdded(false);
    try {
      const res = await fetch(`/api/stock-lookup?ticker=${encodeURIComponent(ticker.trim())}`);
      const data: StockInfo | null = await res.json();
      if (data) {
        setResult(data);
      } else {
        setNotFound(true);
      }
    } finally {
      setLooking(false);
    }
  }

  function handleAdd() {
    if (!result) return;
    startTransition(async () => {
      await addToWatchlist(result.symbol, result.symbol, result.name, "stock");
      setAdded(true);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Enter ticker (e.g. AAPL, MSFT, TSLA)"
          value={ticker}
          onChange={(e) => {
            setTicker(e.target.value.toUpperCase());
            setResult(null);
            setNotFound(false);
            setAdded(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
        />
        <Button
          onClick={handleLookup}
          disabled={looking || !ticker.trim()}
          variant="outline"
          size="icon"
        >
          {looking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {notFound && (
        <p className="text-sm text-muted-foreground">
          Ticker not found. Check the symbol and try again.
        </p>
      )}

      {result && (
        <div className="border rounded-md px-3 py-2 flex items-center justify-between gap-2 bg-background">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium truncate">{result.name}</span>
            <Badge variant="secondary" className="shrink-0">
              {result.symbol}
            </Badge>
          </div>
          <Button
            size="sm"
            variant={added ? "secondary" : "default"}
            onClick={handleAdd}
            disabled={isPending || added}
            className="shrink-0"
          >
            {added ? "Added" : <><Plus className="h-3 w-3 mr-1" />Add</>}
          </Button>
        </div>
      )}
    </div>
  );
}
