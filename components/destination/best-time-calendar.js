import Link from "next/link";
import { cn } from "@/components/ui/cn";
import { MONTH_SHORT, formatMonthSpans } from "@/lib/utils/months";

const monthInIndia = new Intl.DateTimeFormat("en-IN", { month: "numeric", timeZone: "Asia/Kolkata" });

/** A 12-month strip: best months highlighted, festivals dotted, current month outlined. */
export function BestTimeCalendar({ bestMonths = [], festivals = [], bestSeasonText, title = "When to go" }) {
  const best = new Set(bestMonths);
  const current = Number(monthInIndia.format(new Date()));
  const byMonth = new Map();

  for (const festival of festivals) {
    if (!festival.startDate) continue;
    const month = Number(monthInIndia.format(new Date(festival.startDate)));
    byMonth.set(month, [...(byMonth.get(month) ?? []), festival]);
  }

  if (!best.size && !byMonth.size) return null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        {title ? <h3 className="font-semibold text-ink">{title}</h3> : <span />}
        {best.size ? <p className="text-sm text-ink-muted">Best: {formatMonthSpans(bestMonths)}</p> : null}
      </div>
      <ol className="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-12" aria-label="Months of the year">
        {MONTH_SHORT.map((label, index) => {
          const month = index + 1;
          const monthFestivals = byMonth.get(month) ?? [];

          return (
            <li
              key={label}
              className={cn(
                "relative flex flex-col items-center rounded-lg px-1 py-2 text-xs font-medium",
                best.has(month) ? "bg-brand-700 text-white" : "bg-surface-muted text-ink-muted",
                month === current && "ring-2 ring-marigold-400 ring-offset-2 ring-offset-surface"
              )}
            >
              {label}
              <span className="sr-only">
                {best.has(month) ? " — a great time to visit" : ""}
                {month === current ? " (this month)" : ""}
                {monthFestivals.length ? ` — festival: ${monthFestivals.map((festival) => festival.title).join(", ")}` : ""}
              </span>
              <span aria-hidden="true" className={cn("mt-1 h-1.5 w-1.5 rounded-full", monthFestivals.length ? "bg-accent-500" : "bg-transparent")} />
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-brand-700" /> Best time
        </span>
        {byMonth.size ? (
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent-500" /> Festival
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm ring-2 ring-marigold-400" /> This month
        </span>
      </div>
      {byMonth.size ? (
        <ul className="mt-3 space-y-1 text-sm">
          {[...byMonth.entries()]
            .sort(([first], [second]) => first - second)
            .flatMap(([month, list]) =>
              list.map((festival) => (
                <li key={festival.id}>
                  <span className="font-medium text-ink-muted">{MONTH_SHORT[month - 1]}:</span>{" "}
                  <Link href={`/festivals/${festival.slug}`} className="font-medium text-link hover:underline">
                    {festival.title}
                  </Link>
                </li>
              ))
            )}
        </ul>
      ) : null}
      {bestSeasonText ? <p className="mt-3 text-sm text-ink-muted">{bestSeasonText}</p> : null}
    </div>
  );
}
