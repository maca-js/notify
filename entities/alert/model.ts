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

export const ALERT_TYPE_LABELS: Record<Alert["type"], string> = {
  percent_change: "% change (24h)",
  threshold: "Price",
};

export const ALERT_CONDITION_LABELS: Record<Alert["condition"], string> = {
  above: "goes above",
  below: "goes below",
};
