import { PageShell } from "@/components/shared/page-shell";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Dashboard",
  description: "Placeholder dashboard page for the Smart Tourism Platform foundation.",
};

export default function DashboardPage() {
  return (
    <PageShell title="Dashboard" description="This route is reserved for future traveler and operator dashboards.">
      <Card title="Dashboard overview" description="The shared shell and reusable UI are already in place for the next feature layer.">
        <p className="text-sm text-slate-600">No dashboard data or analytics has been implemented.</p>
      </Card>
    </PageShell>
  );
}
