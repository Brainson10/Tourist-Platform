import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { ReviewModeration } from "@/components/admin/review-moderation";
import { ButtonLink } from "@/components/ui/button";
import { requireAdminPage } from "@/lib/auth/admin";
import { getAdminOverview } from "@/lib/services/admin.service";

export const metadata = { title: "Overview" };

const STAT_LINKS = [
  ["destinations", "Destinations", "/admin/destinations"],
  ["experiences", "Experiences", "/admin/experiences"],
  ["festivals", "Festivals", "/admin/festivals"],
  ["stories", "Stories", "/admin/stories"],
  ["souvenirs", "Souvenirs", "/admin/souvenirs"],
  ["reviews", "Reviews", "/admin/reviews"],
  ["users", "Users", "/admin/users"],
  ["guides", "Approved guides", "/admin/guides"],
  ["villages", "Villages", "/admin/villages"],
  ["trips", "Trips planned", null],
];

export default async function AdminOverviewPage() {
  await requireAdminPage("/admin");
  const { counts, pendingReviews, incompleteDestinations } = await getAdminOverview();

  return (
    <>
      <AdminHeader title="Overview" description="Content health at a glance.">
        <ButtonLink href="/admin/destinations/new">＋ New destination</ButtonLink>
      </AdminHeader>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {STAT_LINKS.map(([key, label, href]) => {
          const body = (
            <>
              <dt className="text-sm text-ink-muted">{label}</dt>
              <dd className="mt-1 text-2xl font-semibold text-ink">{counts[key] ?? 0}</dd>
            </>
          );

          return href ? (
            <Link key={key} href={href} className="rounded-xl border border-line bg-surface p-4 hover:border-line-strong">
              {body}
            </Link>
          ) : (
            <div key={key} className="rounded-xl border border-line bg-surface p-4">
              {body}
            </div>
          );
        })}
      </dl>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="pending-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="pending-title" className="text-lg font-semibold text-ink">
              Reviews waiting for approval ({counts.pendingReviews})
            </h2>
            {counts.pendingReviews > pendingReviews.length ? (
              <Link href="/admin/reviews?status=PENDING" className="text-sm font-medium text-link hover:underline">
                See all
              </Link>
            ) : null}
          </div>
          <ReviewModeration reviews={pendingReviews} />
        </section>

        <section aria-labelledby="incomplete-title">
          <h2 id="incomplete-title" className="mb-3 text-lg font-semibold text-ink">
            Destinations that need attention
          </h2>
          {incompleteDestinations.length ? (
            <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
              {incompleteDestinations.map((destination) => (
                <li key={destination.id} className="px-4 py-3">
                  <Link href={`/admin/destinations/${destination.id}`} className="font-medium text-ink hover:underline">
                    {destination.name}
                  </Link>
                  <p className="text-xs text-ink-muted">
                    {[
                      !destination.coverImage && "no cover image",
                      !destination._count.photos && "no gallery photos",
                      !destination._count.destinationCategories && "no categories",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-line bg-surface p-4 text-sm text-ink-muted">Every destination has photos and categories.</p>
          )}
        </section>
      </div>
    </>
  );
}
