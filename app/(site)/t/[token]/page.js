import Link from "next/link";
import { notFound } from "next/navigation";
import { TripRouteMap } from "@/components/trips/trip-route-map";
import { AppImage } from "@/components/ui/app-image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WeaveBorder } from "@/components/ui/weave";
import { getSharedTrip } from "@/lib/services/trip.service";
import { addDays, formatDateRange, formatWeekday, locationLabel, pluralize } from "@/lib/utils/format";

// Share links are private-by-obscurity: never index them.
export const metadata = { title: "Shared trip", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SharedTripPage({ params }) {
  const { token } = await params;
  const trip = /^[A-Za-z0-9_-]{16,64}$/.test(token) ? await getSharedTrip(token) : null;

  if (!trip) notFound();

  return (
    <article>
      <header className="relative isolate overflow-hidden bg-night text-white">
        <AppImage src={trip.image} alt="" priority sizes="100vw" className="-z-10 opacity-60" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 to-black/20" />
        <Container className="py-14 sm:py-20">
          <p className="text-sm text-white/80">{trip.plannedBy} shared a trip with you</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{trip.title}</h1>
          <p className="mt-2 text-white/85">
            {formatDateRange(trip.startDate, trip.endDate)} · {pluralize(trip.days, "day")} · {pluralize(trip.travelers, "traveler")}
          </p>
        </Container>
      </header>
      <WeaveBorder height={12} />

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <ol className="space-y-5">
            {trip.itinerary.map((day) => (
              <li key={day.day} className="print-break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface">
                <h2 className="border-b border-line bg-surface-muted/60 px-4 py-2.5 font-sans text-base font-semibold text-ink">
                  Day {day.day} <span className="font-normal text-ink-muted">· {formatWeekday(addDays(trip.startDate, day.day - 1))}</span>
                </h2>
                {day.items.length ? (
                  <ul className="divide-y divide-line">
                    {day.items.map((item) => (
                      <li key={item.id} className="flex gap-3 px-4 py-3">
                        <span className="w-20 shrink-0 text-xs font-medium text-ink-muted">{item.time || "—"}</span>
                        <span className="min-w-0">
                          <span className="block font-medium text-ink">{item.title}</span>
                          {item.destination ? (
                            <Link href={`/destinations/${item.destination.slug}`} className="text-xs font-medium text-link hover:underline">
                              {item.destination.name}
                            </Link>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-4 text-sm text-ink-subtle">Free day</p>
                )}
              </li>
            ))}
          </ol>

          <aside className="space-y-4">
            <div className="no-print">
              <TripRouteMap stops={trip.stops} />
            </div>
            {trip.destination ? (
              <div className="rounded-2xl border border-line bg-surface p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Destination</p>
                <p className="mt-1 font-display text-xl font-semibold text-ink">{trip.destination.name}</p>
                <p className="text-sm text-ink-muted">{locationLabel(trip.destination.village)}</p>
                <ButtonLink href={`/destinations/${trip.destination.slug}`} variant="secondary" size="sm" className="mt-4">
                  Explore {trip.destination.name}
                </ButtonLink>
              </div>
            ) : null}
            <div className="no-print rounded-2xl bg-brand-800 p-5 text-white">
              <p className="font-display text-lg font-semibold">Plan your own trip</p>
              <p className="mt-1 text-sm text-white/80">Build a day-by-day plan with local tips, weather and permits.</p>
              <ButtonLink href="/trips/new" variant="accent" size="sm" className="mt-4">
                Start planning
              </ButtonLink>
            </div>
          </aside>
        </div>
      </Container>
    </article>
  );
}
