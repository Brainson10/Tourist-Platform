import { PageShell } from "@/components/shared/page-shell";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Login",
  description: "Placeholder login page for the Smart Tourism Platform foundation.",
};

export default function LoginPage() {
  return (
    <PageShell title="Login" description="Authentication is intentionally left out of this foundation scaffold.">
      <Card title="Sign in" description="This route is ready for future auth integration.">
        <p className="text-sm text-slate-600">No backend or auth flow has been implemented.</p>
      </Card>
    </PageShell>
  );
}
