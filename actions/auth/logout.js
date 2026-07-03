"use server";

import { clearSessionCookie } from "@/lib/auth/session";

export async function logoutAction() {
  await clearSessionCookie();

  return {
    success: true,
    message: "Signed out successfully",
  };
}
