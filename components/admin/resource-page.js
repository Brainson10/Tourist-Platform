import { AdminHeader } from "@/components/admin/admin-header";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { ResourceManager } from "@/components/admin/resource-manager";
import { Pagination } from "@/components/ui/pagination";
import { requireAdminPage } from "@/lib/auth/admin";
import { getResourceHandler } from "@/lib/services/admin.service";
import { listDestinationOptions } from "@/lib/services/destination.service";
import { listAllVillages } from "@/lib/services/place.service";
import { parseSearchParams } from "@/lib/utils/search-params";
import { adminListQuerySchema } from "@/lib/validators/admin";

/** Shared server page for simple CMS resources. */
const EIGHT_STATES = ["Arunachal Pradesh", "Assam", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura"];

export async function ResourcePage({ resource, title, description, noun, searchParams, filters = [], needsDestinations = false, needsStates = false }) {
  await requireAdminPage(`/admin/${resource}`);
  const query = parseSearchParams(adminListQuerySchema, await searchParams);
  const [{ data, meta }, destinations, villages] = await Promise.all([
    getResourceHandler(resource, "list")({ ...query, limit: 20 }),
    needsDestinations ? listDestinationOptions() : [],
    needsStates ? listAllVillages() : [],
  ]);
  // The eight Northeast states, plus any other state an admin has already added villages for.
  const states = [...new Set([...EIGHT_STATES, ...villages.map((village) => village.state)])].sort();

  return (
    <>
      <AdminHeader title={title} description={description} />
      <AdminToolbar basePath={`/admin/${resource}`} query={query} filters={filters} total={meta.total} noun={noun} />
      <ResourceManager
        resource={resource}
        rows={data}
        options={{ destinations: destinations.map((item) => ({ value: item.id, label: item.name })), states: states.map((state) => ({ value: state, label: state })) }}
      />
      <Pagination className="mt-6" meta={meta} basePath={`/admin/${resource}`} params={{ search: query.search, ...Object.fromEntries(filters.map((filter) => [filter.name, query[filter.name]])) }} />
    </>
  );
}
