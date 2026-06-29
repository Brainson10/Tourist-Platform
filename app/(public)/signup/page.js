import { PageShell } from "@/components/shared/page-shell";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Signup",
  description: "Placeholder signup page for the Smart Tourism Platform foundation.",
};

export default function SignupPage() {
  return (
    <PageShell title="Create an account" description="This page exists as a structural placeholder for future onboarding flows.">
      <Card title="Register" description="Signup experience will be added later without affecting the shared layout.">
        <p className="text-sm text-slate-600">No authentication implementation is included in this foundation.</p>
      </Card>
    </PageShell>
  );
}
