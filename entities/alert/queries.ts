"use server";
import { getAdminClient } from "@/shared/api/supabase";
import type { Alert, AlertInsert, AlertWithAsset } from "./model";

export async function getAlertsForUser(userId: string): Promise<AlertWithAsset[]> {
  const db = getAdminClient();
  const { data, error } = await db
    .from("alerts")
    .select("*, assets(id, name, symbol, external_id, asset_type)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getAlertsForUser: ${error.message}`);
  return (data ?? []) as AlertWithAsset[];
}

export async function getAllActiveAlerts(): Promise<AlertWithAsset[]> {
  const db = getAdminClient();
  const { data, error } = await db
    .from("alerts")
    .select("*, assets(id, name, symbol, external_id, asset_type)")
    .eq("is_active", true);

  if (error) throw new Error(`getAllActiveAlerts: ${error.message}`);
  return (data ?? []) as AlertWithAsset[];
}

export async function createAlert(data: AlertInsert): Promise<Alert> {
  const db = getAdminClient();
  const { data: alert, error } = await db
    .from("alerts")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`createAlert: ${error.message}`);
  return alert;
}

export async function updateAlert(
  id: string,
  data: Partial<Pick<Alert, "type" | "condition" | "value" | "cooldown_minutes">>
): Promise<void> {
  const db = getAdminClient();
  const { error } = await db.from("alerts").update(data).eq("id", id);
  if (error) throw new Error(`updateAlert: ${error.message}`);
}

export async function updateAlertActive(id: string, isActive: boolean): Promise<void> {
  const db = getAdminClient();
  const { error } = await db
    .from("alerts")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw new Error(`updateAlertActive: ${error.message}`);
}

export async function updateAlertTriggered(id: string): Promise<void> {
  const db = getAdminClient();
  const { error } = await db
    .from("alerts")
    .update({ last_triggered_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`updateAlertTriggered: ${error.message}`);
}

export async function deleteAlert(id: string): Promise<void> {
  const db = getAdminClient();
  const { error } = await db.from("alerts").delete().eq("id", id);
  if (error) throw new Error(`deleteAlert: ${error.message}`);
}
