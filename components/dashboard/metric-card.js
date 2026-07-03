import { DashboardCard } from "@/components/dashboard/dashboard-card";

export function MetricCard({ label, value, detail }) {
  return (
    <DashboardCard>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </DashboardCard>
  );
}
