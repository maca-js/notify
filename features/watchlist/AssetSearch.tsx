"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2 } from "lucide-react";
import type { CoinSearchResult } from "@/shared/api/coingecko";
import { addToWatchlist } from "./actions";

export function AssetSearch() {
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
      await addToWatchlist(coin.id, coin.symbol, coin.name);
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
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {results.length > 0 && (
        <ul className="border rounded-md divide-y bg-background shadow-sm max-h-64 overflow-y-auto">
          {results.map((coin) => (
            <li key={coin.id} className="flex items-center justify-between px-3 py-2 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {coin.thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coin.thumb} alt={coin.name} className="w-6 h-6 rounded-full shrink-0" />
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
