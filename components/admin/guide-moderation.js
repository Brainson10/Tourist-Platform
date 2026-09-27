"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";
import { formatDate } from "@/lib/utils/format";

const STATUS = { PENDING: ["amber", "Waiting for review"], APPROVED: ["brand", "Approved"], REJECTED: ["red", "Rejected"] };

export function GuideModeration({ guides }) {
  const [busy, setBusy] = useState(null);
  const [removing, setRemoving] = useState(null);
  const { notify } = useToast();
  const router = useRouter();

  async function setStatus(guide, status) {
    setBusy(guide.id);
    const result = await apiRequest(`/api/admin/guides/${guide.id}`, { method: "PATCH", body: { status } });
    setBusy(null);
    notify(result.ok ? (status === "APPROVED" ? `${guide.user.fullName} is now a listed guide` : status === "REJECTED" ? "Application rejected" : "Moved back to review") : result.message, result.ok ? "success" : "error");
    if (result.ok) router.refresh();
  }

  async function remove() {
    setBusy(removing?.id);
    const result = await apiRequest(`/api/admin/guides/${removing?.id}`, { method: "DELETE" });
    setBusy(null);
    setRemoving(null);
    notify(result.ok ? "Guide profile removed" : result.message, result.ok ? "success" : "error");
    if (result.ok) router.refresh();
  }

  if (!guides.length) {
    return <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-ink-muted">No guide profiles here.</div>;
  }

  return (
    <>
      <ul className="space-y-3">
        {guides.map((guide) => {
          const [tone, label] = STATUS[guide.status];
          return (
            <li key={guide.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{guide.user.fullName}</p>
                    <Badge tone={tone}>{label}</Badge>
                  </div>
                  <p className="text-xs text-ink-subtle">
                    {guide.user.email} · applied {formatDate(guide.createdAt)} · {guide._count.requests} requests
                  </p>
                  <p className="mt-2 font-medium text-ink">{guide.headline}</p>
                  <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-ink-muted">{guide.bio}</p>
                  <p className="mt-2 text-xs text-ink-muted">
                    <span className="font-medium">Languages:</span> {guide.languages.join(", ")} · <span className="font-medium">Areas:</span>{" "}
                    {guide.areas.map((area) => area.destination.name).join(", ")} · <span className="font-medium">Experience:</span> {guide.yearsExperience} yrs
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {guide.status !== "APPROVED" ? (
                    <Button size="sm" disabled={busy === guide.id} onClick={() => setStatus(guide, "APPROVED")}>
                      Approve
                    </Button>
                  ) : null}
                  {guide.status !== "REJECTED" ? (
                    <Button size="sm" variant="secondary" disabled={busy === guide.id} onClick={() => setStatus(guide, "REJECTED")}>
                      {guide.status === "APPROVED" ? "Unlist" : "Reject"}
                    </Button>
                  ) : null}
                  <Button size="sm" variant="danger-ghost" disabled={busy === guide.id} onClick={() => setRemoving(guide)}>
                    Remove
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        pending={Boolean(busy)}
        title="Remove this guide profile?"
        description="Their profile and all requests they've received will be deleted. The account itself stays."
        confirmLabel="Remove profile"
      />
    </>
  );
}
