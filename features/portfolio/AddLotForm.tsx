"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, X } from "lucide-react";
import type { PortfolioLotWithAsset } from "@/entities/portfolio/model";
import { addLotAction, updateLotAction } from "./actions";

type StockResult = { symbol: string; name: string };

type Props = {
  open: boolean;
  onClose: () => void;
  prefillSymbol?: string;
  prefillName?: string;
  lot?: PortfolioLotWithAsset;
};

export function AddLotForm({ open, onClose, prefillSymbol, prefillName, lot }: Props) {
  const isEdit = !!lot;

  const [selectedSymbol, setSelectedSymbol] = useState(prefillSymbol ?? lot?.assets.symbol ?? "");
  const [selectedName, setSelectedName] = useState(prefillName ?? lot?.assets.name ?? "");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [quantity, setQuantity] = useState(lot ? String(lot.quantity) : "");
  const [costBasis, setCostBasis] = useState(lot ? String(lot.cost_basis) : "");
  const [purchaseDate, setPurchaseDate] = useState(lot?.purchase_date ?? "");
  const [isPending, startTransition] = useTransition();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedSymbol(prefillSymbol ?? lot?.assets.symbol ?? "");
    setSelectedName(prefillName ?? lot?.assets.name ?? "");
    setQuantity(lot ? String(lot.quantity) : "");
    setCostBasis(lot ? String(lot.cost_basis) : "");
    setPurchaseDate(lot?.purchase_date ?? "");
    setQuery("");
    setResults([]);
  }, [open, lot, prefillSymbol, prefillName]);

  function handleQueryChange(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/stock-search?q=${encodeURIComponent(val)}`);
        const data: StockResult[] = await res.json();
        setResults(data);
      } finally {
        setSearching(false);
      }
    }, 400);
  }

  function selectStock(result: StockResult) {
    setSelectedSymbol(result.symbol);
    setSelectedName(result.name);
    setQuery("");
    setResults([]);
  }

  function clearStock() {
    setSelectedSymbol("");
    setSelectedName("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const cost = parseFloat(costBasis);
    if (!selectedSymbol || isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0 || !purchaseDate) return;

    startTransition(async () => {
      if (isEdit && lot) {
        await updateLotAction(lot.id, { quantity: qty, cost_basis: cost, purchase_date: purchaseDate });
      } else {
        await addLotAction({ symbol: selectedSymbol, name: selectedName, quantity: qty, cost_basis: cost, purchase_date: purchaseDate });
      }
      onClose();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit lot" : "Add lot"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {!isEdit && (
            <div className="space-y-2">
              <Label>Stock</Label>
              {selectedSymbol ? (
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <span className="font-medium">{selectedSymbol}</span>
                  <span className="text-muted-foreground truncate flex-1">{selectedName}</span>
                  <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={clearStock}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Search symbol or company name"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                  />
                  {(results.length > 0 || searching) && (
                    <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md">
                      {searching && (
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Searching…
                        </div>
                      )}
                      {results.map((r) => (
                        <button
                          key={r.symbol}
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                          onClick={() => selectStock(r)}
                        >
                          <span className="font-medium w-16 shrink-0">{r.symbol}</span>
                          <span className="text-muted-foreground truncate">{r.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {isEdit && (
            <div className="rounded-md border px-3 py-2 text-sm">
              <span className="font-medium">{lot.assets.symbol}</span>
              <span className="text-muted-foreground ml-2">{lot.assets.name}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity (shares)</Label>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Cost basis / share ($)</Label>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 150.00"
                value={costBasis}
                onChange={(e) => setCostBasis(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Purchase date</Label>
            <Input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending || (!isEdit && !selectedSymbol)}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Save changes" : "Add lot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
