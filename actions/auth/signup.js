"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { fieldErrors, signupSchema } from "@/lib/auth/validators";
import { safeRedirectPath } from "@/lib/utils/safe-redirect";

export async function signupAction(_previousState, formData) {
  const values = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
  const parsed = signupSchema.safeParse(values);
  const echo = { fullName: values.fullName, email: values.email };

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values: echo };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name: parsed.data.fullName,
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (String(error?.body?.code ?? "").startsWith("USER_ALREADY_EXISTS")) {
      return { errors: { email: ["An account with this email already exists. Try signing in."] }, values: echo };
    }

    // Anything else is unexpected (e.g. the database isn't migrated) — log it instead of blaming the email.
    console.error("[signup] failed", error);
    return { formError: "We couldn't create your account right now. Please try again.", values: echo };
  }

  redirect(safeRedirectPath(String(formData.get("redirectTo") ?? ""), "/dashboard"));
}
