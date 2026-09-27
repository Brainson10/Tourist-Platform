"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/config";
import { getCurrentUser } from "@/lib/auth/session";
import { fieldErrors, passwordChangeSchema, profileUpdateSchema } from "@/lib/auth/validators";
import { optionalImageUrl } from "@/lib/validators/common";

export async function updateProfileAction(_previousState, formData) {
  const user = await getCurrentUser();

  if (!user) {
    return { formError: "Please sign in again." };
  }

  const parsed = profileUpdateSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  try {
    await auth.api.updateUser({
      body: { name: parsed.data.fullName, phone: parsed.data.phone },
      headers: await headers(),
    });
  } catch {
    return { formError: "We couldn't save your profile. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: "Profile updated." };
}

export async function changePasswordAction(_previousState, formData) {
  const user = await getCurrentUser();

  if (!user) {
    return { formError: "Please sign in again." };
  }

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch {
    return { errors: { currentPassword: ["Your current password is incorrect."] } };
  }

  return { success: "Password changed. Other devices have been signed out." };
}

/** Sets (or clears, with an empty string) the traveler's profile photo. */
export async function updateAvatarAction(url) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };

  const parsed = optionalImageUrl.safeParse(url);
  if (!parsed.success) return { ok: false, message: "That image link isn't valid." };

  try {
    await auth.api.updateUser({ body: { image: parsed.data ?? null }, headers: await headers() });
  } catch {
    return { ok: false, message: "We couldn't save your photo. Please try again." };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: parsed.data ? "Profile photo updated." : "Profile photo removed." };
}
