import { AdminHeader } from "@/components/admin/admin-header";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { GuideModeration } from "@/components/admin/guide-moderation";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { requireAdminPage } from "@/lib/auth/admin";
import { listGuidesForAdmin } from "@/lib/services/guide.service";
import { withQuery } from "@/lib/utils/query-string";
import { parseSearchParams } from "@/lib/utils/search-params";
import { adminListQuerySchema } from "@/lib/validators/admin";

export const metadata = { title: "Guides" };

export default async function AdminGuidesPage({ searchParams }) {
  await requireAdminPage("/admin/guides");
  const query = parseSearchParams(adminListQuerySchema, await searchParams);
  const { data, meta } = await listGuidesForAdmin({ ...query, limit: 20 });

  return (
    <>
      <AdminHeader title="Local guides" description="Approving an application lists the guide publicly and gives the account the Guide role. Unlisting turns it back into a tourist account." />
      <div className="mb-4">
        <FilterChips
          label="Guide status"
          options={[
            { value: undefined, label: "All" },
            { value: "PENDING", label: "Waiting for review" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
          ]}
          active={query.status}
          hrefFor={(value) => withQuery("/admin/guides", { status: value, search: query.search })}
        />
      </div>
      <AdminToolbar basePath="/admin/guides" query={query} total={meta.total} noun="guide profile" preserve={{ status: query.status }} />
      <GuideModeration guides={data} />
      <Pagination className="mt-6" meta={meta} basePath="/admin/guides" params={{ status: query.status, search: query.search }} />
    </>
  );
}
