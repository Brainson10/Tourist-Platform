import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/utils/safe-redirect";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo = typeof params?.redirectTo === "string" ? safeRedirectPath(params.redirectTo, "") : "";
  const user = await getCurrentUser();

  if (user) redirect(redirectTo || (user.role === "ADMIN" ? "/admin" : "/dashboard"));

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to see your trips, saved places and reviews."
      footer={
        <>
          New here?{" "}
          <Link href={`/signup${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`} className="font-semibold text-link hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthCard>
  );
}
