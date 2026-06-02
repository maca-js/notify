"use server";
import { getAdminClient } from "@/shared/api/supabase";
import type { PortfolioLot, PortfolioLotInsert, PortfolioLotWithAsset } from "./model";

export async function getLotsForUser(userId: string): Promise<PortfolioLotWithAsset[]> {
  const db = getAdminClient();
  const { data, error } = await db
    .from("portfolio_lots")
    .select("*, assets(id, symbol, name, external_id, asset_type)")
    .eq("user_id", userId)
    .order("purchase_date", { ascending: false });

  if (error) throw new Error(`getLotsForUser: ${error.message}`);
  return (data ?? []) as PortfolioLotWithAsset[];
}

export async function createLot(data: PortfolioLotInsert): Promise<PortfolioLot> {
  const db = getAdminClient();
  const { data: lot, error } = await db
    .from("portfolio_lots")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`createLot: ${error.message}`);
  return lot;
}

export async function updateLot(
  id: string,
  data: Partial<Pick<PortfolioLot, "quantity" | "cost_basis" | "purchase_date">>
): Promise<void> {
  const db = getAdminClient();
  const { error } = await db.from("portfolio_lots").update(data).eq("id", id);
  if (error) throw new Error(`updateLot: ${error.message}`);
}

export async function deleteLot(id: string): Promise<void> {
  const db = getAdminClient();
  const { error } = await db.from("portfolio_lots").delete().eq("id", id);
  if (error) throw new Error(`deleteLot: ${error.message}`);
}
