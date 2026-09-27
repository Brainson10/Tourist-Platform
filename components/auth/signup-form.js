"use client";

import { useActionState } from "react";
import { signupAction } from "@/actions/auth/signup";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/field";

export function SignupForm({ redirectTo }) {
  const [state, formAction, pending] = useActionState(signupAction, {});

  return (
    <form action={formAction} noValidate className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
      <Field id="fullName" label="Full name" error={state.errors?.fullName}>
        {(aria) => <Input {...aria} name="fullName" autoComplete="name" defaultValue={state.values?.fullName ?? ""} />}
      </Field>
      <Field id="email" label="Email" error={state.errors?.email}>
        {(aria) => <Input {...aria} name="email" type="email" autoComplete="email" defaultValue={state.values?.email ?? ""} />}
      </Field>
      <Field id="password" label="Password" hint="At least 8 characters, with a letter and a number." error={state.errors?.password}>
        {(aria) => <Input {...aria} name="password" type="password" autoComplete="new-password" />}
      </Field>
      <Field id="confirmPassword" label="Confirm password" error={state.errors?.confirmPassword}>
        {(aria) => <Input {...aria} name="confirmPassword" type="password" autoComplete="new-password" />}
      </Field>
      <FormMessage>{state.formError}</FormMessage>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
