import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardUI } from "@/components/dashboard/dashboard-ui";
import { PageShell } from "@/components/shared/page-shell";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { getDashboardData } from "@/lib/services/dashboard.service";

export const metadata = {
  title: "Dashboard",
  description: "Traveler dashboard for destination intelligence, trips, recommendations, festivals, and experiences.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  let data = null;
  let loadError = false;

  try {
    data = await getDashboardData(user);
  } catch {
    loadError = true;
  }

  if (loadError || !data) {
    return (
      <PageShell title="Dashboard" description="Your tourism workspace could not load right now.">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">Data connection</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Dashboard intelligence is temporarily unavailable.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-700">
            Check that PostgreSQL is running and Prisma migrations are applied. The dashboard reads destinations, trips, festivals, experiences, and recommendations from the service layer.
          </p>
          <Link href="/destinations" className="mt-6 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            Browse destinations
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <DashboardUI data={data} />
    </PageShell>
  );
}
