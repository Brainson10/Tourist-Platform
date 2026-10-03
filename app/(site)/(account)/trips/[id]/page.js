import Link from "next/link";
import { notFound } from "next/navigation";
import { PermitCallout } from "@/components/destination/permit-callout";
import { BudgetCard } from "@/components/trips/budget-card";
import { Checklist } from "@/components/trips/checklist";
import { ItineraryEditor } from "@/components/trips/itinerary-editor";
import { TripActions } from "@/components/trips/trip-actions";
import { TripRouteMap } from "@/components/trips/trip-route-map";
import { tripCountdown } from "@/components/trips/trip-card";
import { AppImage } from "@/components/ui/app-image";
import { Container } from "@/components/ui/container";
import { isNotFound } from "@/lib/api/errors";
import { requireUserPage } from "@/lib/auth/session";
import { getDestinationBySlugOrId, listDestinationOptions } from "@/lib/services/destination.service";
import { getPermitForState } from "@/lib/services/permit.service";
import { getTrip } from "@/lib/services/trip.service";
import { formatDateRange, locationLabel, pluralize } from "@/lib/utils/format";

export const metadata = { title: "Trip" };

export default async function TripPage({ params }) {
  const { id } = await params;
  const user = await requireUserPage(`/trips/${id}`);

  let trip;
  try {
    trip = await getTrip(id, user.id);
  } catch (error) {
    if (isNotFound(error)) notFound();
    throw error;
  }

  const [destination, destinations] = await Promise.all([
    trip.destinationId ? getDestinationBySlugOrId(trip.destinationId).catch(() => null) : null,
    listDestinationOptions(),
  ]);
  const permit = destination ? await getPermitForState(destination.village.state) : null;

  const experiences = destination?.experiences.map(({ id: experienceId, title }) => ({ id: experienceId, title })) ?? [];
  const suggestions = destination
    ? [...destination.experiences.map((experience) => ({ title: experience.title, experienceId: experience.id })), ...destination.thingsToDo.map((title) => ({ title }))]
    : [];

  return (
    <Container className="py-8">
      <Link href="/trips" className="no-print text-sm font-medium text-link hover:underline">
        ← My trips
      </Link>

      <header className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
        {trip.image ? (
          <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:h-24 sm:w-36">
            <AppImage src={trip.image} alt="" priority sizes="144px" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{trip.title}</h1>
          <p className="mt-1 text-ink-muted">
            {formatDateRange(trip.startDate, trip.endDate)} · {pluralize(trip.days, "day")}
            {tripCountdown(trip) ? ` · ${tripCountdown(trip)}` : ""}
          </p>
          {trip.destination ? (
            <p className="mt-1 text-sm">
              <Link href={`/destinations/${trip.destination.slug}`} className="font-medium text-link hover:underline">
                {trip.destination.name}
              </Link>
              <span className="text-ink-muted"> · {locationLabel(trip.destination.village)}</span>
            </p>
          ) : null}
        </div>
        <TripActions trip={trip} destinations={destinations} />
      </header>

      {trip.notes ? <p className="mt-6 whitespace-pre-line rounded-xl bg-surface-muted p-4 text-sm text-ink-muted">{trip.notes}</p> : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-labelledby="itinerary-title" className="min-w-0">
          <h2 id="itinerary-title" className="mb-4 text-lg font-semibold text-ink">
            Itinerary
          </h2>
          <ItineraryEditor trip={trip} suggestions={suggestions} experiences={experiences} />
          <div className="mt-8">
            <Checklist tripId={trip.id} items={trip.checklist} />
          </div>
        </section>

        {destination || trip.stops.length || trip.budget ? (
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="no-print">
              <TripRouteMap stops={trip.stops} />
            </div>
            <BudgetCard budget={trip.budget} />
            {permit?.required ? <PermitCallout permit={permit} state={destination.village.state} compact /> : null}
            {destination ? (
            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="font-semibold text-ink">Before you go</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {destination.bestSeason ? (
                  <li>
                    <span className="text-ink-muted">Best time: </span>
                    {destination.bestSeason}
                  </li>
                ) : null}
                {destination.openingHours ? (
                  <li>
                    <span className="text-ink-muted">Hours: </span>
                    {destination.openingHours}
                  </li>
                ) : null}
                {destination.entryFee ? (
                  <li>
                    <span className="text-ink-muted">Entry: </span>
                    {destination.entryFee}
                  </li>
                ) : null}
              </ul>
              <div className="mt-4 flex flex-col gap-1 text-sm font-medium">
                <Link href={`/destinations/${destination.slug}#safety`} className="text-link hover:underline">
                  Getting there & safety notes
                </Link>
                <Link href={`/destinations/${destination.slug}#nearby`} className="text-link hover:underline">
                  Hospitals, ATMs & transport nearby
                </Link>
                <Link href={`/destinations/${destination.slug}#food-stay`} className="text-link hover:underline">
                  Food & places to stay
                </Link>
                <Link href={`/destinations/${destination.slug}#souvenirs`} className="text-link hover:underline">
                  Souvenir ideas for this trip
                </Link>
              </div>
            </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </Container>
  );
}
