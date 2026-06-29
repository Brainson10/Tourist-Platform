"use server";

import { auth } from "@/lib/auth/config";
import { cookies } from "next/headers";

export async function logoutAction() {
  const cookieStore = await cookies();

  await auth.api.signOut({
    headers: {
      cookie: cookieStore.getAll().map((cookie) => `${cookie.name}=${cookie.value}`).join("; "),
    },
  });

  return {
    success: true,
    message: "Signed out successfully",
  };
}
