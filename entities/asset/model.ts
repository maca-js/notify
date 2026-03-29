import type { Database } from "@/shared/api/supabase.types";

export type Asset = Database["public"]["Tables"]["assets"]["Row"];
export type AssetInsert = Database["public"]["Tables"]["assets"]["Insert"];

export type WatchlistEntry = {
  watchlistId: string;
  asset: Asset;
};
