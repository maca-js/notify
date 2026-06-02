import type { Database } from "@/shared/api/supabase.types";

export type PortfolioLot = Database["public"]["Tables"]["portfolio_lots"]["Row"];
export type PortfolioLotInsert = Database["public"]["Tables"]["portfolio_lots"]["Insert"];

export type PortfolioLotWithAsset = PortfolioLot & {
  assets: {
    id: string;
    symbol: string;
    name: string;
    external_id: string;
    asset_type: "crypto" | "stock";
  };
};
