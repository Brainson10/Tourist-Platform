import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { ButtonLink } from "@/components/ui/button";
import { getAdminPageUser } from "@/lib/auth/admin";
import { getAdminCounts } from "@/lib/services/admin.service";

export const metadata = { title: { default: "Admin", template: "%s · Admin · Smart Tourism" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const admin = await getAdminPageUser();

  if (!admin) {
    return (
      <main id="main" className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-sm font-semibold text-danger-ink">403</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">You don&apos;t have access to this area</h1>
          <p className="mt-2 text-ink-muted">The admin panel is only available to platform administrators.</p>
          <ButtonLink href="/dashboard" className="mt-6">
            Go to your dashboard
          </ButtonLink>
        </div>
      </main>
    );
  }

  const counts = await getAdminCounts().catch(() => ({}));

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="bg-night px-3 py-3 text-white lg:sticky lg:top-0 lg:h-screen lg:py-5">
        <div className="flex items-center justify-between px-2 lg:block">
          <Link href="/admin" className="text-base font-semibold">
            Smart Tourism <span className="font-normal text-white/60">Admin</span>
          </Link>
          <Link href="/" className="text-sm text-white/70 hover:text-white lg:mt-1 lg:block">
            View site ↗
          </Link>
        </div>
        <div className="mt-3 lg:mt-6">
          <AdminNav badges={{ pendingReviews: counts.pendingReviews, pendingGuides: counts.pendingGuides }} />
        </div>
        <p className="mt-6 hidden truncate px-3 text-xs text-white/50 lg:block">Signed in as {admin.email}</p>
      </aside>
      <main id="main" className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
