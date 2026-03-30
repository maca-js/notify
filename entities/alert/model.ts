import type { Database } from "@/shared/api/supabase.types";

export type Alert = Database["public"]["Tables"]["alerts"]["Row"];
export type AlertInsert = Database["public"]["Tables"]["alerts"]["Insert"];

export type AlertWithAsset = Alert & {
  assets: {
    id: string;
    name: string;
    symbol: string;
    external_id: string;
    asset_type: "crypto" | "stock";
  };
};

export function getAlertTypeLabel(type: Alert["type"], timeframe: Alert["timeframe"]): string {
  if (type === "percent_change") return `% change (${timeframe})`;
  return "Price threshold";
}

export const ALERT_CONDITION_LABELS: Record<Alert["condition"], string> = {
  above: "goes above",
  below: "goes below",
};

export function getAlertSummary(alert: Alert): string {
  const direction = alert.condition === "above" ? "goes up" : "goes down";
  const value = alert.type === "percent_change"
    ? `${alert.value}%`
    : `$${alert.value.toLocaleString()}`;
  const timeframe = alert.type === "percent_change" ? ` (${alert.timeframe})` : "";
  return `${direction} ${value}${timeframe}`;
}
