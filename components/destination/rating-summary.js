import { Stars } from "@/components/ui/rating";
import { formatRating, pluralize } from "@/lib/utils/format";

export function RatingSummary({ summary }) {
  const counts = Object.fromEntries(summary.distribution.map((row) => [row.rating, row.count]));

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-end gap-3">
        <p className="text-4xl font-semibold text-ink">{summary.count ? formatRating(summary.average) : "–"}</p>
        <div className="pb-1">
          <Stars value={summary.average} />
          <p className="text-sm text-ink-muted">{summary.count ? pluralize(summary.count, "review") : "No reviews yet"}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-1.5">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = counts[rating] ?? 0;
          const percent = summary.count ? Math.round((count / summary.count) * 100) : 0;

          return (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <dt className="w-10 shrink-0 text-ink-muted">{rating} ★</dt>
              <dd className="flex flex-1 items-center gap-2">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <span className="block h-full rounded-full bg-highlight" style={{ width: `${percent}%` }} />
                </span>
                <span className="w-6 text-right text-xs text-ink-muted">{count}</span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
