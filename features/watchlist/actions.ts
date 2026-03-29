"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/shared/api/supabase";
import { getSession } from "@/shared/lib/auth";

export async function addToWatchlist(
  coingeckoId: string,
  symbol: string,
  name: string
) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const db = getAdminClient();

  // Upsert asset
  const { data: asset, error: assetError } = await db
    .from("assets")
    .upsert({ coingecko_id: coingeckoId, symbol, name }, { onConflict: "coingecko_id" })
    .select()
    .single();

  if (assetError) throw new Error(`addToWatchlist asset: ${assetError.message}`);

  // Add to watchlist (ignore duplicate)
  const { error } = await db
    .from("watchlist")
    .upsert({ user_id: session.userId, asset_id: asset.id }, { onConflict: "user_id,asset_id" });

  if (error) throw new Error(`addToWatchlist: ${error.message}`);
  revalidatePath("/dashboard");
}

export async function removeFromWatchlist(watchlistId: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const db = getAdminClient();
  const { error } = await db
    .from("watchlist")
    .delete()
    .eq("id", watchlistId)
    .eq("user_id", session.userId);

  if (error) throw new Error(`removeFromWatchlist: ${error.message}`);
  revalidatePath("/dashboard");
}

export async function getWatchlist() {
  const session = await getSession();
  if (!session) return [];

  const db = getAdminClient();
  const { data, error } = await db
    .from("watchlist")
    .select("id, created_at, assets(id, coingecko_id, symbol, name)")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}
