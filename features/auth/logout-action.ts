"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("sn_session", "", { maxAge: 0, path: "/" });
  redirect("/");
}
