"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

export async function logoutAction() {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch {
    // Session may already be gone; signing out is still the right end state.
  }

  redirect("/");
}
