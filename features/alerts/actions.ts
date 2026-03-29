"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/shared/lib/auth";
import {
  createAlert,
  updateAlertActive,
  deleteAlert,
} from "@/entities/alert/queries";
import type { AlertInsert } from "@/entities/alert/model";

export async function createAlertAction(
  data: Omit<AlertInsert, "user_id">
) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  await createAlert({ ...data, user_id: session.userId });
  revalidatePath("/dashboard");
}

export async function toggleAlertAction(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  await updateAlertActive(id, isActive);
  revalidatePath("/dashboard");
}

export async function deleteAlertAction(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  await deleteAlert(id);
  revalidatePath("/dashboard");
}
