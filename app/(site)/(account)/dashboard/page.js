import Link from "next/link";
import { CardGrid } from "@/components/cards/card-grid";
import { DestinationCard } from "@/components/cards/destination-card";
import { ExperienceCard } from "@/components/cards/experience-card";
import { FestivalCard } from "@/components/cards/festival-card";
import { RequestList } from "@/components/guides/request-list";
import { TripCard, tripCountdown } from "@/components/trips/trip-card";
import { AppImage } from "@/components/ui/app-image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/states";
import { requireUserPage } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/dashboard.service";
import { formatDateRange, pluralize } from "@/lib/utils/format";

export const metadata = { title: "Your dashboard" };

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function NextTrip({ trip }) {
  return (
    <article className="relative grid overflow-hidden rounded-xl border border-line bg-surface md:grid-cols-[2fr_3fr]">
      <div className="relative aspect-[16/9] bg-surface-muted md:aspect-auto">
        <AppImage src={trip.image} alt={trip.destination?.name ?? trip.title} fallbackLabel={trip.destination?.name ?? "Your trip"} priority sizes="(min-width: 768px) 40vw, 100vw" />
      </div>
      <div className="flex flex-col p-5 sm:p-6">
        <p className="text-sm font-semibold text-link">{tripCountdown(trip)}</p>
        <h2 className="mt-1 text-xl font-semibold text-ink sm:text-2xl">{trip.title}</h2>
        <p className="mt-1 text-ink-muted">
          {formatDateRange(trip.startDate, trip.endDate)} · {pluralize(trip.days, "day")}
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          {trip.itemCount ? `${pluralize(trip.itemCount, "activity", "activities")} planned so far.` : "Your itinerary is empty — add a few things to do."}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <ButtonLink href={`/trips/${trip.id}`}>Open itinerary</ButtonLink>
          {trip.destination ? (
            <ButtonLink href={`/destinations/${trip.destination.slug}#safety`} variant="secondary">
              Safety & essentials
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default async function DashboardPage() {
  const user = await requireUserPage("/dashboard");
  const data = await getDashboardData(user);

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {greeting()}, {user.fullName.split(" ")[0]}
          </h1>
          <p className="mt-1 text-ink-muted">{data.nextTrip ? "Here's what's coming up." : "Where to next?"}</p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/destinations" variant="secondary">
            Browse destinations
          </ButtonLink>
          <ButtonLink href="/trips/new">Plan a trip</ButtonLink>
        </div>
      </div>

      <section className="mt-8" aria-label="Your next trip">
        {data.nextTrip ? (
          <>
            <NextTrip trip={data.nextTrip} />
            {data.otherTrips.length ? (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {data.otherTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            ) : null}
            <Link href="/trips" className="mt-3 inline-block text-sm font-semibold text-link hover:underline">
              All trips ({data.tripCount}) →
            </Link>
          </>
        ) : (
          <EmptyState
            icon="✈"
            title={data.tripCount ? "No upcoming trips" : "Plan your first trip"}
            description="Pick a destination and dates — we'll start your day-by-day plan with its best things to do."
            action={{ href: "/trips/new", label: "Plan a trip" }}
          />
        )}
      </section>

      {data.guideRequests.length ? (
        <section id="guide-requests" className="mt-12 scroll-mt-24">
          <SectionHeader title="Your guide requests" action={{ href: "/guides", label: "Find guides" }} />
          <div className="mt-5">
            <RequestList requests={data.guideRequests} role="tourist" />
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <SectionHeader title="Saved places" action={data.saved.length ? { href: "/saved", label: "See all" } : null} />
        <div className="mt-5">
          {data.saved.length ? (
            <CardGrid>
              {data.saved.slice(0, 4).map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </CardGrid>
          ) : (
            <EmptyState icon="♡" title="Nothing saved yet" description="Tap Save on any destination to keep it here for later." action={{ href: "/destinations", label: "Find places" }} />
          )}
        </div>
      </section>

      {data.recommendations.length ? (
        <section className="mt-12">
          <SectionHeader
            title={data.personalized ? "Recommended for you" : "Popular places to start with"}
            description={data.personalized ? "Based on the places you've saved, planned and reviewed." : "Save a few places you like and we'll tailor these suggestions."}
          />
          <CardGrid className="mt-5">
            {data.recommendations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} reason={destination.reason} />
            ))}
          </CardGrid>
        </section>
      ) : null}

      {data.festivals.length ? (
        <section className="mt-12">
          <SectionHeader title="Upcoming festivals" action={{ href: "/festivals", label: "Festival calendar" }} />
          <CardGrid columns={3} className="mt-5">
            {data.festivals.map((festival) => (
              <FestivalCard key={festival.id} festival={festival} />
            ))}
          </CardGrid>
        </section>
      ) : null}

      {data.experiences.length ? (
        <section className="mt-12">
          <SectionHeader title="Experiences to try" action={{ href: "/experiences", label: "All experiences" }} />
          <CardGrid className="mt-5">
            {data.experiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </CardGrid>
        </section>
      ) : null}
    </Container>
  );
}
