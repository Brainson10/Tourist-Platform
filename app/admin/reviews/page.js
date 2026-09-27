import { AdminHeader } from "@/components/admin/admin-header";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { ReviewModeration } from "@/components/admin/review-moderation";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { requireAdminPage } from "@/lib/auth/admin";
import { listReviewsForAdmin } from "@/lib/services/review.service";
import { withQuery } from "@/lib/utils/query-string";
import { parseSearchParams } from "@/lib/utils/search-params";
import { adminListQuerySchema } from "@/lib/validators/admin";

export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage({ searchParams }) {
  await requireAdminPage("/admin/reviews");
  const query = parseSearchParams(adminListQuerySchema, await searchParams);
  const { data, meta } = await listReviewsForAdmin({ ...query, limit: 20 });

  return (
    <>
      <AdminHeader title="Reviews" description="New and edited reviews wait here until you approve them (unless auto-approve is on in Settings)." />
      <div className="mb-4">
        <FilterChips
          label="Review status"
          options={[
            { value: undefined, label: "All" },
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "HIDDEN", label: "Hidden" },
          ]}
          active={query.status}
          hrefFor={(value) => withQuery("/admin/reviews", { status: value, search: query.search })}
        />
      </div>
      <AdminToolbar basePath="/admin/reviews" query={query} total={meta.total} noun="review" preserve={{ status: query.status }} />
      <ReviewModeration reviews={data} />
      <Pagination className="mt-6" meta={meta} basePath="/admin/reviews" params={{ status: query.status, search: query.search }} />
    </>
  );
}
