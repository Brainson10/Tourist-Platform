import { cn } from "@/components/ui/cn";
import { formatRating } from "@/lib/utils/format";

export function Stars({ value, size = "sm", className }) {
  const filled = Math.round(value);

  return (
    <span className={cn("inline-flex text-highlight", size === "lg" ? "text-lg" : "text-sm", className)} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= filled ? "" : "text-line-strong"}>
          ★
        </span>
      ))}
    </span>
  );
}

/** Compact "★ 4.6 (12)" label. Renders "New" when there are no reviews yet. */
export function RatingLabel({ average, count, className }) {
  if (!count) {
    return <span className={cn("text-xs font-medium text-ink-muted", className)}>No reviews yet</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <span aria-hidden="true" className="text-highlight">★</span>
      <span className="font-semibold text-ink">{formatRating(average)}</span>
      <span className="text-ink-muted">({count})</span>
      <span className="sr-only">
        Rated {formatRating(average)} out of 5 from {count} review{count === 1 ? "" : "s"}
      </span>
    </span>
  );
}
