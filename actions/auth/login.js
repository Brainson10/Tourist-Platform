"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { fieldErrors, loginSchema } from "@/lib/auth/validators";
import { safeRedirectPath } from "@/lib/utils/safe-redirect";

export async function loginAction(_previousState, formData) {
  const values = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    rememberMe: formData.get("rememberMe") === "on",
  };
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values: { email: values.email } };
  }

  let result;

  try {
    result = await auth.api.signInEmail({
      body: parsed.data,
      headers: await headers(),
    });
  } catch (error) {
    if (error?.status === "FORBIDDEN") {
      return { formError: error.body?.message || "This account has been suspended.", values: { email: values.email } };
    }

    if (error?.status === "UNAUTHORIZED" || error?.status === "BAD_REQUEST") {
      return { formError: "Incorrect email or password.", values: { email: values.email } };
    }

    console.error("[login] failed", error);
    return { formError: "We couldn't sign you in right now. Please try again in a moment.", values: { email: values.email } };
  }

  const fallback = result?.user?.role === "ADMIN" ? "/admin" : "/dashboard";
  redirect(safeRedirectPath(String(formData.get("redirectTo") ?? ""), fallback));
}
