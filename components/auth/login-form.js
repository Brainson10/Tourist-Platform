"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import { loginAction } from "@/actions/auth/login";

const initialState = {
  success: false,
  error: null,
  message: "",
  redirectTo: "",
};

function FieldError({ errors }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm font-medium text-red-700">{errors[0]}</p>;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.push(redirectTo || state.redirectTo || "/dashboard");
      router.refresh();
    }
  }, [redirectTo, router, state]);

  return (
    <form action={formAction} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Sign in</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Use your administrator account to manage destination intelligence records.
        </p>
      </div>

      <div className="mt-6 grid gap-5">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
          <FieldError errors={state.error?.email} />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
          <FieldError errors={state.error?.password} />
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input name="rememberMe" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-700" />
          Keep me signed in
        </label>

        {state.error?._form?.length ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {state.error._form[0]}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </div>

      <p className="mt-6 text-sm text-slate-600">
        Need an account?{" "}
        <Link href="/signup" className="font-semibold text-emerald-800 hover:text-emerald-900">
          Create one
        </Link>
      </p>
    </form>
  );
}
