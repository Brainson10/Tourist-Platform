"use client";

import { useActionState } from "react";
import { changePasswordAction, updateProfileAction } from "@/actions/auth/account";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/field";

export function ProfileForm({ user }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {});

  return (
    <form action={formAction} noValidate className="space-y-4">
      <Field id="profile-name" label="Full name" error={state.errors?.fullName}>
        {(aria) => <Input {...aria} name="fullName" defaultValue={user.fullName} autoComplete="name" />}
      </Field>
      <Field id="profile-email" label="Email" hint="Contact support to change your sign-in email.">
        {(aria) => <Input {...aria} value={user.email} disabled readOnly />}
      </Field>
      <Field id="profile-phone" label="Phone" hint="Optional. Only used to contact you about your account." error={state.errors?.phone}>
        {(aria) => <Input {...aria} name="phone" type="tel" defaultValue={user.phone ?? ""} autoComplete="tel" />}
      </Field>
      <FormMessage>{state.formError}</FormMessage>
      <FormMessage tone="success">{state.success}</FormMessage>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, {});

  return (
    <form action={formAction} noValidate className="space-y-4" key={state.success ? "done" : "form"}>
      <Field id="current-password" label="Current password" error={state.errors?.currentPassword}>
        {(aria) => <Input {...aria} name="currentPassword" type="password" autoComplete="current-password" />}
      </Field>
      <Field id="new-password" label="New password" hint="At least 8 characters, with a letter and a number." error={state.errors?.newPassword}>
        {(aria) => <Input {...aria} name="newPassword" type="password" autoComplete="new-password" />}
      </Field>
      <Field id="confirm-password" label="Confirm new password" error={state.errors?.confirmPassword}>
        {(aria) => <Input {...aria} name="confirmPassword" type="password" autoComplete="new-password" />}
      </Field>
      <FormMessage>{state.formError}</FormMessage>
      <FormMessage tone="success">{state.success}</FormMessage>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
}
