"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth/login";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/field";

export function LoginForm({ redirectTo }) {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <form action={formAction} noValidate className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
      <Field id="email" label="Email" error={state.errors?.email}>
        {(aria) => <Input {...aria} name="email" type="email" autoComplete="email" defaultValue={state.values?.email ?? ""} />}
      </Field>
      <Field id="password" label="Password" error={state.errors?.password}>
        {(aria) => <Input {...aria} name="password" type="password" autoComplete="current-password" />}
      </Field>
      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input name="rememberMe" type="checkbox" className="h-4 w-4 rounded border-line-strong accent-brand-700" defaultChecked />
        Keep me signed in
      </label>
      <FormMessage>{state.formError}</FormMessage>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
