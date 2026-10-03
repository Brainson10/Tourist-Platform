import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { requireAdminPage } from "@/lib/auth/admin";
import { listDestinationOptions } from "@/lib/services/destination.service";
import { listSouvenirCategoryOptions, listSouvenirsForAdmin } from "@/lib/services/souvenir.service";
import { formatPriceRange } from "@/lib/utils/format";
import { parseSearchParams } from "@/lib/utils/search-params";
import { adminListQuerySchema } from "@/lib/validators/admin";

export const metadata = { title: "Souvenirs" };

export default async function AdminSouvenirsPage({ searchParams }) {
  await requireAdminPage("/admin/souvenirs");
  const query = parseSearchParams(adminListQuerySchema, await searchParams);
  const [{ data, meta }, categories, destinations] = await Promise.all([listSouvenirsForAdmin({ ...query, limit: 20 }), listSouvenirCategoryOptions(), listDestinationOptions()]);
  const filters = [
    { name: "destinationId", label: "All destinations", options: destinations.map((destination) => ({ value: destination.id, label: destination.name })) },
    { name: "category", label: "All categories", options: categories.map((category) => ({ value: category.slug, label: category.name })) },
    { name: "published", label: "Published or draft", options: [{ value: "true", label: "Published" }, { value: "false", label: "Draft" }] },
  ];

  return (
    <>
      <AdminHeader title="Souvenirs" description="Local treasures travelers see under “Take Home a Memory”. Discovery only — nothing is sold here.">
        <ButtonLink href="/admin/souvenirs/new">＋ New souvenir</ButtonLink>
      </AdminHeader>
      <AdminToolbar basePath="/admin/souvenirs" query={query} filters={filters} total={meta.total} noun="souvenir" />

      {data.length ? (
        <div className="relative overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line bg-surface-muted text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Souvenir</th>
                <th scope="col" className="px-4 py-3 font-medium">Category</th>
                <th scope="col" className="px-4 py-3 font-medium">Destinations</th>
                <th scope="col" className="px-4 py-3 font-medium">Approx. price</th>
                <th scope="col" className="px-4 py-3 font-medium">Places</th>
                <th scope="col" className="px-4 py-3 text-right font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((souvenir) => (
                <tr key={souvenir.id} className="hover:bg-surface-muted/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                        <AppImage src={souvenir.image} alt="" sizes="56px" />
                      </div>
                      <div>
                        <Link href={`/admin/souvenirs/${souvenir.id}`} className="font-medium text-ink hover:underline">
                          {souvenir.name}
                        </Link>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {!souvenir.isPublished ? <Badge>Draft</Badge> : null}
                          {souvenir.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
                          {souvenir.needsVerification ? <Badge tone="amber">Needs verification</Badge> : null}
                          {!souvenir.image ? <Badge tone="blue">No photo</Badge> : null}
                          {!souvenir.destinations.length ? <Badge tone="red">No destination</Badge> : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{souvenir.category.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{souvenir.destinations.map((destination) => destination.name).join(", ") || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">{formatPriceRange(souvenir.priceMin, souvenir.priceMax)}</td>
                  <td className="px-4 py-3 text-ink-muted">{souvenir.sellerCount || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <ButtonLink href={`/admin/souvenirs/${souvenir.id}`} size="sm" variant="ghost">
                      Edit<span className="sr-only"> {souvenir.name}</span>
                    </ButtonLink>
                    {souvenir.isPublished ? (
                      <ButtonLink href={`/souvenirs/${souvenir.slug}`} size="sm" variant="ghost" target="_blank">
                        View ↗<span className="sr-only"> {souvenir.name} (opens in a new tab)</span>
                      </ButtonLink>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-ink-muted">
          No souvenirs match. Clear your filters or add the first local treasure.
        </div>
      )}
      <Pagination
        className="mt-6"
        meta={meta}
        basePath="/admin/souvenirs"
        params={{ search: query.search, destinationId: query.destinationId, category: query.category, published: query.published }}
      />
    </>
  );
}
