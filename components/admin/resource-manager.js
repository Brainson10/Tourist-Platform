"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RESOURCE_CONFIGS, toPayload } from "@/components/admin/resource-configs";
import { ResourceForm } from "@/components/admin/resource-form";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";

export function ResourceManager({ resource, rows, options = {} }) {
  const config = RESOURCE_CONFIGS[resource];
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [pending, setPending] = useState(false);
  const { notify } = useToast();
  const router = useRouter();

  async function save(values) {
    const isNew = !editing?.id;
    const result = await apiRequest(isNew ? `/api/admin/${resource}` : `/api/admin/${resource}/${editing?.id}`, {
      method: isNew ? "POST" : "PUT",
      body: toPayload(config, values),
    });

    if (!result.ok) return result;

    notify(isNew ? `New ${config.singular} added` : "Changes saved");
    setEditing(null);
    router.refresh();
    return result;
  }

  async function remove() {
    setPending(true);
    const result = await apiRequest(`/api/admin/${resource}/${deleting?.id}`, { method: "DELETE" });
    setPending(false);
    setDeleting(null);
    notify(result.ok ? `${config.singular[0].toUpperCase()}${config.singular.slice(1)} deleted` : result.message, result.ok ? "success" : "error");
    if (result.ok) router.refresh();
  }

  const primaryColumn = config.columns.find((column) => column.primary);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing({ ...config.empty })}>＋ New {config.singular}</Button>
      </div>

      {rows.length ? (
        <div className="relative overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-surface-muted text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                {config.columns.map((column) => (
                  <th key={column.label} scope="col" className="px-4 py-3 font-medium">
                    {column.label}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-muted/60">
                  {config.columns.map((column) => (
                    <td key={column.label} className={column.primary ? "px-4 py-3 font-medium text-ink" : "px-4 py-3 text-ink-muted"}>
                      {column.render(row) ?? "—"}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(config.toForm ? config.toForm(row) : row)}>
                      Edit<span className="sr-only"> {primaryColumn.render(row)}</span>
                    </Button>
                    <Button size="sm" variant="danger-ghost" onClick={() => setDeleting(row)}>
                      Delete<span className="sr-only"> {primaryColumn.render(row)}</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-ink-muted">
          Nothing here yet. Use “New {config.singular}” to add the first one, or clear your search.
        </div>
      )}

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.id ? `Edit ${config.singular}` : `New ${config.singular}`} size="lg">
        {editing ? (
          <ResourceForm
            config={config}
            initialValues={{ ...config.empty, ...Object.fromEntries(Object.entries(editing).map(([key, value]) => [key, value ?? ""])) }}
            options={options}
            onSubmit={save}
            onCancel={() => setEditing(null)}
            submitLabel={editing?.id ? "Save changes" : `Add ${config.singular}`}
          />
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        pending={pending}
        title={`Delete this ${config.singular}?`}
        description={deleting ? `“${primaryColumn.render(deleting)}” will be permanently deleted. ${config.deleteWarning ?? ""}` : ""}
      />
    </div>
  );
}
