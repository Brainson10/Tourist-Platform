import { AdminHeader } from "@/components/admin/admin-header";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { UserAccessControls } from "@/components/admin/user-access-controls";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { requireAdminPage } from "@/lib/auth/admin";
import { listUsers } from "@/lib/services/user-admin.service";
import { formatDate } from "@/lib/utils/format";
import { parseSearchParams } from "@/lib/utils/search-params";
import { adminListQuerySchema } from "@/lib/validators/admin";

export const metadata = { title: "Users" };

export default async function AdminUsersPage({ searchParams }) {
  const admin = await requireAdminPage("/admin/users");
  const query = parseSearchParams(adminListQuerySchema, await searchParams);
  const { data, meta } = await listUsers({ ...query, limit: 20 });
  const filters = [
    { name: "role", label: "All roles", options: [{ value: "TOURIST", label: "Tourists" }, { value: "GUIDE", label: "Guides" }, { value: "ADMIN", label: "Admins" }] },
    { name: "blocked", label: "Any status", options: [{ value: "false", label: "Active" }, { value: "true", label: "Blocked" }] },
  ];

  return (
    <>
      <AdminHeader title="Users" description="Change roles or block accounts. Blocking signs the person out immediately." />
      <AdminToolbar basePath="/admin/users" query={query} filters={filters} total={meta.total} noun="user" />
      {data.length ? (
        <div className="relative overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-surface-muted text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Joined</th>
                <th scope="col" className="px-4 py-3 font-medium">Activity</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">
                      {user.fullName} {user.id === admin.id ? <span className="text-xs font-normal text-ink-muted">(you)</span> : null}
                    </p>
                    <p className="text-xs text-ink-muted">{user.email}</p>
                    {user.isBlocked ? <Badge tone="red" className="mt-1">Blocked</Badge> : null}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {user._count.trips} trips · {user._count.reviews} reviews
                  </td>
                  <td className="px-4 py-3">
                    <UserAccessControls user={user} isSelf={user.id === admin.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-ink-muted">No users match these filters.</div>
      )}
      <Pagination className="mt-6" meta={meta} basePath="/admin/users" params={{ search: query.search, role: query.role, blocked: query.blocked }} />
    </>
  );
}
