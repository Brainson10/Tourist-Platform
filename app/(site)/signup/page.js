import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUser } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/utils/safe-redirect";

export const metadata = { title: "Create an account" };

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo = typeof params?.redirectTo === "string" ? safeRedirectPath(params.redirectTo, "") : "";

  if (await getCurrentUser()) redirect(redirectTo || "/dashboard");

  return (
    <AuthCard
      title="Create your account"
      description="Save places, plan trips day by day and share reviews with other travelers."
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`} className="font-semibold text-link hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm redirectTo={redirectTo} />
    </AuthCard>
  );
}
