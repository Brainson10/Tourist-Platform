import { PageShell } from "@/components/shared/page-shell";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Admin",
  description: "Placeholder admin page for the Smart Tourism Platform foundation.",
};

export default function AdminPage() {
  return (
    <PageShell title="Admin" description="This route is reserved for future administration workflows and content management.">
      <Card title="Administration workspace" description="The foundation is ready for future admin modules without changing the global structure.">
        <p className="text-sm text-slate-600">No admin features have been implemented.</p>
      </Card>
    </PageShell>
  );
}
