import Link from "next/link";
import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { daysUntil, formatDateRange, pluralize } from "@/lib/utils/format";

const PHASE_BADGE = {
  upcoming: { tone: "brand", label: "Upcoming" },
  ongoing: { tone: "amber", label: "On the road" },
  past: { tone: "neutral", label: "Completed" },
  cancelled: { tone: "red", label: "Cancelled" },
};

export function tripCountdown(trip) {
  if (trip.phase === "ongoing") return "Happening now";
  if (trip.phase !== "upcoming") return null;
  const days = daysUntil(trip.startDate);
  return days === 0 ? "Starts today" : days === 1 ? "Starts tomorrow" : `Starts in ${days} days`;
}

export function TripCard({ trip }) {
  const badge = PHASE_BADGE[trip.phase];

  return (
    <article className="group relative flex overflow-hidden rounded-xl border border-line bg-surface">
      <div className="relative w-28 shrink-0 bg-surface-muted sm:w-36">
        <AppImage src={trip.image} alt="" fallbackLabel={trip.destination?.name ?? "Trip"} sizes="144px" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold text-ink">
            <Link href={`/trips/${trip.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {trip.title}
            </Link>
          </h3>
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </div>
        <p className="mt-0.5 text-sm text-ink-muted">{formatDateRange(trip.startDate, trip.endDate)}</p>
        <p className="mt-auto pt-2 text-xs text-ink-muted">
          {[trip.destination?.name, pluralize(trip.days, "day"), pluralize(trip.itemCount, "plan item"), tripCountdown(trip)].filter(Boolean).join(" · ")}
        </p>
      </div>
    </article>
  );
}
