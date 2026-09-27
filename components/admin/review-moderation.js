"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { PhotoStrip } from "@/components/ui/photo-strip";
import { Stars } from "@/components/ui/rating";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";
import { formatDate } from "@/lib/utils/format";

const STATUS = { PENDING: ["amber", "Pending"], APPROVED: ["brand", "Approved"], HIDDEN: ["neutral", "Hidden"] };

export function ReviewModeration({ reviews }) {
  const [busy, setBusy] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { notify } = useToast();
  const router = useRouter();

  async function setStatus(review, status) {
    setBusy(review.id);
    const result = await apiRequest(`/api/admin/reviews/${review.id}`, { method: "PATCH", body: { status } });
    setBusy(null);
    notify(result.ok ? (status === "APPROVED" ? "Review approved" : status === "HIDDEN" ? "Review hidden" : "Moved back to pending") : result.message, result.ok ? "success" : "error");
    if (result.ok) router.refresh();
  }

  async function remove() {
    setBusy(deleting?.id);
    const result = await apiRequest(`/api/admin/reviews/${deleting?.id}`, { method: "DELETE" });
    setBusy(null);
    setDeleting(null);
    notify(result.ok ? "Review deleted" : result.message, result.ok ? "success" : "error");
    if (result.ok) router.refresh();
  }

  if (!reviews.length) {
    return <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center text-sm text-ink-muted">No reviews here. You&apos;re all caught up.</div>;
  }

  return (
    <>
      <ul className="space-y-3">
        {reviews.map((review) => {
          const [tone, label] = STATUS[review.status];

          return (
            <li key={review.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars value={review.rating} />
                    <span className="sr-only">{review.rating} out of 5</span>
                    <Badge tone={tone}>{label}</Badge>
                    {review.title ? <span className="font-semibold text-ink">{review.title}</span> : null}
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {review.user?.fullName} ({review.user?.email}) on{" "}
                    <Link href={`/destinations/${review.destination.slug}#reviews`} target="_blank" className="font-medium text-link hover:underline">
                      {review.destination.name}
                    </Link>{" "}
                    · {formatDate(review.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {review.status !== "APPROVED" ? (
                    <Button size="sm" onClick={() => setStatus(review, "APPROVED")} disabled={busy === review.id}>
                      Approve
                    </Button>
                  ) : null}
                  {review.status !== "HIDDEN" ? (
                    <Button size="sm" variant="secondary" onClick={() => setStatus(review, "HIDDEN")} disabled={busy === review.id}>
                      Hide
                    </Button>
                  ) : null}
                  <Button size="sm" variant="danger-ghost" onClick={() => setDeleting(review)} disabled={busy === review.id}>
                    Delete
                  </Button>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-ink-muted">{review.comment}</p>
              <PhotoStrip photos={review.photos?.map((photo) => photo.imageUrl)} label="Review photos" />
            </li>
          );
        })}
      </ul>
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        pending={Boolean(busy)}
        title="Delete this review?"
        description="It will be permanently removed and the destination's rating will be recalculated. Hiding is usually enough."
      />
    </>
  );
}
