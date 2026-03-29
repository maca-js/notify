"use server";
import { getAdminClient } from "@/shared/api/supabase";
import type { User, UserInsert } from "./model";

export async function upsertUser(data: UserInsert): Promise<User> {
  const db = getAdminClient();
  const { data: user, error } = await db
    .from("users")
    .upsert(data, { onConflict: "telegram_id" })
    .select()
    .single();

  if (error) throw new Error(`upsertUser: ${error.message}`);
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = getAdminClient();
  const { data, error } = await db
    .from("users")
    .select()
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
