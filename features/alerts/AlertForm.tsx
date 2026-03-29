"use client";

import { useState, useTransition } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createAlertAction } from "./actions";

type Props = {
  assetId: string;
  assetName: string;
  open: boolean;
  onClose: () => void;
};

type AlertType = "percent_change" | "threshold";
type AlertCondition = "above" | "below";

export function AlertForm({ assetId, assetName, open, onClose }: Props) {
  const [type, setType] = useState<AlertType>("percent_change");
  const [condition, setCondition] = useState<AlertCondition>("above");
  const [value, setValue] = useState("");
  const [cooldown, setCooldown] = useState("60");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;

    startTransition(async () => {
      await createAlertAction({
        asset_id: assetId,
        type,
        condition,
        value: numValue,
        timeframe: "24h",
        is_active: true,
        cooldown_minutes: parseInt(cooldown, 10),
        last_triggered_at: null,
      });
      setValue("");
      onClose();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New alert for {assetName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Alert type</Label>
            <Select value={type} onValueChange={(v) => setType(v as AlertType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent_change">% change (24h)</SelectItem>
                <SelectItem value="threshold">Price threshold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Condition</Label>
            <Select
              value={condition}
              onValueChange={(v) => setCondition(v as AlertCondition)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">
                  {type === "percent_change" ? "Up by ≥" : "Goes above"}
                </SelectItem>
                <SelectItem value="below">
                  {type === "percent_change" ? "Down by ≥" : "Goes below"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              {type === "percent_change" ? "Percentage (%)" : "Price (USD)"}
            </Label>
            <Input
              type="number"
              step="any"
              min="0"
              placeholder={type === "percent_change" ? "e.g. 5" : "e.g. 100000"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Cooldown (minutes)</Label>
            <Select value={cooldown} onValueChange={setCooldown}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="360">6 hours</SelectItem>
                <SelectItem value="1440">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create alert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
