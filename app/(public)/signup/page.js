import { SignupForm } from "@/components/auth/signup-form";
import { PageShell } from "@/components/shared/page-shell";

export const metadata = {
  title: "Signup",
  description: "Create a Smart Tourism Platform account.",
};

export default function SignupPage() {
  return (
    <PageShell title="Create an account" description="Join the platform to plan and personalize tourism experiences.">
      <div className="max-w-xl">
        <SignupForm />
      </div>
    </PageShell>
  );
}
