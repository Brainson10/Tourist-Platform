import Link from "next/link";
import { Stars } from "@/components/ui/rating";

export function ReviewHighlights({ reviews }) {
  return (
    <ul className="grid gap-5 md:grid-cols-3">
      {reviews.map((review) => (
        <li key={review.id} className="flex flex-col rounded-xl border border-line bg-surface p-5">
          <Stars value={review.rating} />
          <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
            <p className="line-clamp-5">“{review.comment}”</p>
          </blockquote>
          <p className="mt-4 text-sm">
            <span className="font-semibold text-ink">{review.user?.fullName ?? "Traveler"}</span>
            <span className="text-ink-muted"> on </span>
            <Link href={`/destinations/${review.destination.slug}`} className="font-medium text-link hover:underline">
              {review.destination.name}
            </Link>
          </p>
        </li>
      ))}
    </ul>
  );
}
