import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { requireAdminPage } from "@/lib/auth/admin";
import { getDestinationFilterOptions, listDestinationsForAdmin } from "@/lib/services/destination.service";
import { formatRating, locationLabel } from "@/lib/utils/format";
import { parseSearchParams } from "@/lib/utils/search-params";
import { adminListQuerySchema } from "@/lib/validators/admin";

export const metadata = { title: "Destinations" };

export default async function AdminDestinationsPage({ searchParams }) {
  await requireAdminPage("/admin/destinations");
  const query = parseSearchParams(adminListQuerySchema, await searchParams);
  const [{ data, meta }, options] = await Promise.all([listDestinationsForAdmin({ ...query, limit: 20 }), getDestinationFilterOptions()]);
  const filters = [
    { name: "state", label: "All states", options: options.locations.map((location) => ({ value: location.state, label: location.state })) },
    { name: "category", label: "All categories", options: options.categories.map((category) => ({ value: category.slug, label: category.name })) },
    { name: "featured", label: "Featured or not", options: [{ value: "true", label: "Featured" }, { value: "false", label: "Not featured" }] },
  ];

  return (
    <>
      <AdminHeader title="Destinations" description="Everything travelers see on destination pages.">
        <ButtonLink href="/admin/destinations/new">＋ New destination</ButtonLink>
      </AdminHeader>
      <AdminToolbar basePath="/admin/destinations" query={query} filters={filters} total={meta.total} noun="destination" />

      {data.length ? (
        <div className="relative overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-surface-muted text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Destination</th>
                <th scope="col" className="px-4 py-3 font-medium">Location</th>
                <th scope="col" className="px-4 py-3 font-medium">Categories</th>
                <th scope="col" className="px-4 py-3 font-medium">Rating</th>
                <th scope="col" className="px-4 py-3 text-right font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((destination) => (
                <tr key={destination.id} className="hover:bg-surface-muted/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                        <AppImage src={destination.image} alt="" sizes="56px" />
                      </div>
                      <div>
                        <Link href={`/admin/destinations/${destination.id}`} className="font-medium text-ink hover:underline">
                          {destination.name}
                        </Link>
                        <div className="mt-0.5 flex gap-1">
                          {destination.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
                          {!destination.image ? <Badge tone="amber">No photo</Badge> : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{locationLabel(destination.village, { includeVillage: true })}</td>
                  <td className="px-4 py-3 text-ink-muted">{destination.categories.map((category) => category.name).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">{destination.reviewCount ? `${formatRating(destination.ratingAverage)} (${destination.reviewCount})` : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <ButtonLink href={`/admin/destinations/${destination.id}`} size="sm" variant="ghost">
                      Edit<span className="sr-only"> {destination.name}</span>
                    </ButtonLink>
                    <ButtonLink href={`/destinations/${destination.slug}`} size="sm" variant="ghost" target="_blank">
                      View ↗<span className="sr-only"> {destination.name} (opens in a new tab)</span>
                    </ButtonLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-ink-muted">
          No destinations match. Clear your filters or create a new destination.
        </div>
      )}
      <Pagination className="mt-6" meta={meta} basePath="/admin/destinations" params={{ search: query.search, state: query.state, category: query.category, featured: query.featured }} />
    </>
  );
}
