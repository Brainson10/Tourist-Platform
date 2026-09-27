"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ReviewForm } from "@/components/destination/review-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { PhotoStrip } from "@/components/ui/photo-strip";
import { Stars } from "@/components/ui/rating";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";
import { formatDate } from "@/lib/utils/format";

const STATUS_COPY = {
  PENDING: { tone: "amber", label: "Awaiting approval", detail: "Your review will be visible to others once it's approved." },
  APPROVED: { tone: "brand", label: "Published", detail: "Thanks for helping other travelers." },
  HIDDEN: { tone: "red", label: "Not published", detail: "This review didn't meet our guidelines. You can edit it and resubmit." },
};

function ReviewItem({ review }) {
  return (
    <li className="py-5 first:pt-0">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-ink-muted">
          {review.author.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">{review.author.name}</p>
          <p className="text-xs text-ink-muted">{formatDate(review.createdAt)}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Stars value={review.rating} />
        <span className="sr-only">{review.rating} out of 5</span>
        {review.title ? <h4 className="text-sm font-semibold text-ink">{review.title}</h4> : null}
      </div>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-muted">{review.comment}</p>
      <PhotoStrip photos={review.photos} label={`Photos from ${review.author.name}`} />
    </li>
  );
}

export function ReviewsPanel({ destinationId, initial, signedIn, returnTo }) {
  const [reviews, setReviews] = useState(initial.reviews);
  const [meta, setMeta] = useState(initial.meta);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { notify } = useToast();
  const router = useRouter();
  const userReview = initial.userReview;
  const status = userReview ? STATUS_COPY[userReview.status] : null;

  async function loadMore() {
    setLoadingMore(true);
    const result = await apiRequest(`/api/destinations/${destinationId}/reviews?page=${meta.page + 1}&limit=${meta.limit}`);
    setLoadingMore(false);

    if (!result.ok) {
      notify(result.message, "error");
      return;
    }

    setReviews((current) => [...current, ...result.data.reviews]);
    setMeta(result.data.meta);
  }

  async function deleteReview() {
    setDeleting(true);
    const result = await apiRequest(`/api/destinations/${destinationId}/reviews`, { method: "DELETE" });
    setDeleting(false);
    setConfirmDelete(false);
    notify(result.message, result.ok ? "success" : "error");
    if (result.ok) router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-surface p-5">
        {!signedIn ? (
          <p className="text-sm text-ink-muted">
            Been here?{" "}
            <Link href={`/login?redirectTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-link hover:underline">
              Sign in to write a review
            </Link>
            .
          </p>
        ) : userReview && !editing ? (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-ink">Your review</h3>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            <p className="mt-1 text-sm text-ink-muted">{status.detail}</p>
            <div className="mt-3 flex items-center gap-2">
              <Stars value={userReview.rating} />
              {userReview.title ? <span className="text-sm font-semibold">{userReview.title}</span> : null}
            </div>
            <p className="mt-1 whitespace-pre-line text-sm text-ink-muted">{userReview.comment}</p>
            <PhotoStrip photos={userReview.photos} label="Your photos" />
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button size="sm" variant="danger-ghost" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="mb-4 font-semibold text-ink">{userReview ? "Edit your review" : "Share your experience"}</h3>
            <ReviewForm destinationId={destinationId} existingReview={userReview} onDone={userReview ? () => setEditing(false) : undefined} />
          </div>
        )}
      </div>

      {reviews.length ? (
        <div>
          <ul className="divide-y divide-line">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </ul>
          {meta.page < meta.totalPages ? (
            <Button variant="secondary" onClick={loadMore} disabled={loadingMore} className="mt-2">
              {loadingMore ? "Loading…" : "Show more reviews"}
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">No reviews yet. Be the first to share what it&apos;s like.</p>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteReview}
        pending={deleting}
        title="Delete your review?"
        description="This removes your rating and review for this destination."
      />
    </div>
  );
}
