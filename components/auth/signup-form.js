"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { signupAction } from "@/actions/auth/signup";

const initialState = {
  success: false,
  error: null,
  message: "",
};

function FieldError({ errors }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm font-medium text-red-700">{errors[0]}</p>;
}

export function SignupForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/login");
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Create account</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          New accounts start as tourist accounts. Admin access is assigned by the platform owner.
        </p>
      </div>

      <div className="mt-6 grid gap-5">
        <div>
          <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            autoComplete="name"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
          <FieldError errors={state.error?.fullName} />
        </div>

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
            autoComplete="new-password"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
          <FieldError errors={state.error?.password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />
          <FieldError errors={state.error?.confirmPassword} />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </div>

      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-emerald-800 hover:text-emerald-900">
          Sign in
        </Link>
      </p>
    </form>
  );
}
