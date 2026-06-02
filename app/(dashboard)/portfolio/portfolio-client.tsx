"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PortfolioSummary } from "@/features/portfolio/PortfolioSummary";
import { HoldingsTable, type Position } from "@/features/portfolio/HoldingsTable";
import { AddLotForm } from "@/features/portfolio/AddLotForm";
import type { PortfolioLotWithAsset } from "@/entities/portfolio/model";

type Props = {
  positions: Position[];
  totalValue: number;
  totalCost: number;
};

export function PortfolioClient({ positions, totalValue, totalCost }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [prefillSymbol, setPrefillSymbol] = useState<string | undefined>();
  const [prefillName, setPrefillName] = useState<string | undefined>();
  const [editLot, setEditLot] = useState<PortfolioLotWithAsset | undefined>();

  function openAddLot(symbol?: string, name?: string) {
    setPrefillSymbol(symbol);
    setPrefillName(name);
    setEditLot(undefined);
    setFormOpen(true);
  }

  function openEditLot(lot: PortfolioLotWithAsset) {
    setPrefillSymbol(undefined);
    setPrefillName(undefined);
    setEditLot(lot);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setPrefillSymbol(undefined);
    setPrefillName(undefined);
    setEditLot(undefined);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Portfolio</h1>
        <Button size="sm" onClick={() => openAddLot()}>
          <Plus className="h-4 w-4 mr-1" />
          Add position
        </Button>
      </div>

      <PortfolioSummary totalValue={totalValue} totalCost={totalCost} />

      <HoldingsTable
        positions={positions}
        onAddLot={(symbol, name) => openAddLot(symbol, name)}
        onEditLot={openEditLot}
      />

      <AddLotForm
        open={formOpen}
        onClose={closeForm}
        prefillSymbol={prefillSymbol}
        prefillName={prefillName}
        lot={editLot}
      />
    </>
  );
}
