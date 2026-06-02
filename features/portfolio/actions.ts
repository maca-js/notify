"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/shared/api/supabase";
import { getSession } from "@/shared/lib/auth";
import { createLot, updateLot, deleteLot } from "@/entities/portfolio/queries";
import type { PortfolioLot } from "@/entities/portfolio/model";

export async function addLotAction(data: {
  symbol: string;
  name: string;
  quantity: number;
  cost_basis: number;
  purchase_date: string;
}) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const db = getAdminClient();

  const { data: asset, error: assetError } = await db
    .from("assets")
    .upsert(
      { external_id: data.symbol.toUpperCase(), symbol: data.symbol.toUpperCase(), name: data.name, asset_type: "stock" },
      { onConflict: "external_id" }
    )
    .select()
    .single();

  if (assetError) throw new Error(`addLotAction asset: ${assetError.message}`);

  await createLot({
    user_id: session.userId,
    asset_id: asset.id,
    quantity: data.quantity,
    cost_basis: data.cost_basis,
    purchase_date: data.purchase_date,
  });

  revalidatePath("/portfolio");
}

export async function updateLotAction(
  id: string,
  data: Partial<Pick<PortfolioLot, "quantity" | "cost_basis" | "purchase_date">>
) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  await updateLot(id, data);
  revalidatePath("/portfolio");
}

export async function deleteLotAction(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  await deleteLot(id);
  revalidatePath("/portfolio");
}
