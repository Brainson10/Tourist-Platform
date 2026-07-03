import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCmsClient } from "@/components/admin/admin-cms-client";
import { PageShell } from "@/components/shared/page-shell";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { getDestinationAdminOptions, listDestinationCollection } from "@/lib/services/destination.service";
import { getAdminDashboardStats, getAdminOptions, listAdminResource } from "@/lib/services/admin.service";

export const metadata = {
  title: "Tourism CMS Admin",
  description: "Admin workspace for managing tourism intelligence content.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    return (
      <PageShell title="Admin" description="This workspace is restricted to platform administrators.">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Admin access required</h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-700">
            Your current account does not have permission to manage destination intelligence records.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Back to home
          </Link>
        </div>
      </PageShell>
    );
  }

  const [
    destinations,
    destinationOptions,
    stats,
    adminOptions,
    villages,
    categories,
    festivals,
    experiences,
    stories,
    reviews,
    users,
    settings,
  ] = await Promise.all([
    listDestinationCollection({ page: 1, limit: 100, sort: "createdAt" }),
    getDestinationAdminOptions(),
    getAdminDashboardStats(),
    getAdminOptions(),
    listAdminResource("villages", { page: 1, limit: 10 }),
    listAdminResource("categories", { page: 1, limit: 10 }),
    listAdminResource("festivals", { page: 1, limit: 10 }),
    listAdminResource("experiences", { page: 1, limit: 10 }),
    listAdminResource("stories", { page: 1, limit: 10 }),
    listAdminResource("reviews", { page: 1, limit: 10 }),
    listAdminResource("users", { page: 1, limit: 10 }),
    listAdminResource("settings", { page: 1, limit: 1 }),
  ]);

  return (
    <PageShell
      title="Tourism CMS"
      description="Manage destinations, villages, categories, festivals, experiences, stories, reviews, users, and platform settings."
    >
      <AdminCmsClient
        initialStats={stats}
        initialResources={{ villages, categories, festivals, experiences, stories, reviews, users, settings }}
        destinations={destinations}
        destinationOptions={{
          ...destinationOptions,
          destinations: adminOptions.destinations,
        }}
      />
    </PageShell>
  );
}
