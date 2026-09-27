import Link from "next/link";
import { cn } from "@/components/ui/cn";

const monthKey = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: "Asia/Kolkata" });
const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", timeZone: "Asia/Kolkata" });
const dayLabel = new Intl.DateTimeFormat("en-IN", { day: "numeric", timeZone: "Asia/Kolkata" });

/** The next six months as columns, each listing the festivals that start in it. */
export function FestivalTimeline({ festivals }) {
  const months = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + offset);
    return { key: monthKey.format(date), label: monthLabel.format(date), items: [] };
  });
  const byKey = new Map(months.map((month) => [month.key, month]));
  const undated = [];

  for (const festival of festivals) {
    if (!festival.startDate) {
      undated.push(festival);
      continue;
    }
    byKey.get(monthKey.format(new Date(festival.startDate)))?.items.push(festival);
  }

  return (
    <div>
      <ol className="relative scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
        {months.map((month, index) => (
          <li key={month.key} className={cn("w-44 shrink-0 snap-start rounded-2xl border p-4 sm:w-auto", index === 0 ? "border-accent-500/40 bg-accent-soft" : "border-line bg-surface")}>
            <p className={cn("font-display text-lg font-semibold", index === 0 ? "text-accent-ink" : "text-ink")}>{month.label}</p>
            {month.items.length ? (
              <ul className="mt-2 space-y-2">
                {month.items.map((festival) => (
                  <li key={festival.id}>
                    <Link href={`/festivals/${festival.slug}`} className="group block">
                      <span className="text-xs font-medium text-ink-subtle">{dayLabel.format(new Date(festival.startDate))}</span>
                      <span className="block text-sm font-semibold leading-snug text-ink group-hover:text-link">{festival.title}</span>
                      <span className="block text-xs text-ink-muted">{festival.destination?.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-subtle">Nothing listed yet</p>
            )}
          </li>
        ))}
      </ol>
      {undated.length ? (
        <p className="mt-3 text-sm text-ink-muted">
          Dates to be announced:{" "}
          {undated.map((festival, index) => (
            <span key={festival.id}>
              {index ? ", " : ""}
              <Link href={`/festivals/${festival.slug}`} className="font-medium text-link hover:underline">
                {festival.title}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
