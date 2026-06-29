"use server";

import { getCurrentUser } from "@/lib/auth/auth";

export async function getCurrentUserAction() {
  return getCurrentUser();
}
