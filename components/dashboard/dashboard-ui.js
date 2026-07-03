/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { DashboardCard, EmptyState, SectionHeader } from "@/components/dashboard/dashboard-card";
import { DestinationDashboardCard } from "@/components/dashboard/destination-dashboard-card";
import { MetricCard } from "@/components/dashboard/metric-card";

function formatDate(value) {
  if (!value) {
    return "Date to be confirmed";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatCurrency(value) {
  if (typeof value !== "number") {
    return "Price varies";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function LinkButton({ href, children, variant = "primary" }) {
  const classes =
    variant === "secondary"
      ? "inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      : "inline-flex rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700";

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

function DashboardHero({ data }) {
  const destination = data.spotlightDestination;
  const image = destination?.heroImage ?? destination?.coverImage ?? destination?.galleryImages?.[0];
  const location = [destination?.village?.name, destination?.district, destination?.state].filter(Boolean).join(", ");

  return (
    <section className="grid overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-sm lg:grid-cols-[1fr_440px]">
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">Traveler intelligence</span>
          {destination ? <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">{destination.name}</span> : null}
        </div>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
          Welcome back, {data.user.fullName}. Plan smarter journeys from live destination intelligence.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          Track your trips, discover destination intelligence, scan seasonal festivals, and use AI planning cues for safer, more personal travel.
        </p>
        {destination ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Spotlight village</p>
              <p className="mt-1 text-sm font-semibold text-white">{location || "Location pending"}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Best season</p>
              <p className="mt-1 text-sm font-semibold text-white">{destination.bestSeason ?? "To be added"}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Travel time</p>
              <p className="mt-1 text-sm font-semibold text-white">{destination.estimatedDuration ?? "Flexible"}</p>
            </div>
          </div>
        ) : null}
        <div className="mt-7 flex flex-wrap gap-3">
          <LinkButton href="/destinations">Explore destinations</LinkButton>
          <LinkButton href="/destinations?q=weekend%20trip" variant="secondary">Find weekend ideas</LinkButton>
        </div>
      </div>
      <div className="min-h-72 bg-slate-800">
        {image ? (
          <img src={image} alt={destination.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full min-h-72 items-center justify-center px-8 text-center text-sm leading-6 text-slate-300">
            Add featured destinations from the admin panel to power this spotlight.
          </div>
        )}
      </div>
    </section>
  );
}

function TripPanel({ data }) {
  return (
    <DashboardCard className="lg:col-span-2">
      <SectionHeader
        title="Trip Control Center"
        description="Your active travel plans and the next planning step."
        action={<LinkButton href="/destinations" variant="secondary">Start planning</LinkButton>}
      />
      {data.upcomingTrip ? (
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_260px]">
          <div className="rounded-lg bg-emerald-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">{data.upcomingTrip.status}</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">{data.upcomingTrip.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">{data.upcomingTripWindow}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-950">Next AI planning step</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Match this trip with weather, seasonal festivals, safety notes, budget, and transport options.
            </p>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No active trips yet"
          description="Saved trips will show dates, status, and planning readiness here."
          action={<LinkButton href="/destinations" variant="secondary">Choose a destination</LinkButton>}
        />
      )}
    </DashboardCard>
  );
}

function RecommendationsPanel({ recommendations, highlights }) {
  return (
    <DashboardCard>
      <SectionHeader title="AI Recommendations" description="Personalized signals from your profile, trips, and destination intelligence." />
      <div className="mt-5 space-y-3">
        {recommendations.length ? (
          recommendations.map((recommendation) => (
            <Link key={recommendation.id} href={`/destinations/${recommendation.destination.slug}`} className="block rounded-lg border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-950">{recommendation.destination.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{recommendation.reason}</p>
                </div>
                <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-sm font-semibold text-white">{recommendation.score}</span>
              </div>
            </Link>
          ))
        ) : (
          highlights.map((highlight) => (
            <div key={highlight.title} className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{highlight.accent}</p>
              <h3 className="mt-2 font-semibold text-slate-950">{highlight.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{highlight.description}</p>
            </div>
          ))
        )}
      </div>
    </DashboardCard>
  );
}

function ExperiencePanel({ experiences }) {
  return (
    <DashboardCard>
      <SectionHeader title="Experience Explorer" description="Activities connected to real destinations." />
      {experiences.length ? (
        <div className="mt-5 space-y-3">
          {experiences.slice(0, 4).map((experience) => (
            <div key={experience.id} className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{experience.category}</p>
              <h3 className="mt-1 font-semibold text-slate-950">{experience.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{experience.destination?.name} / {experience.duration} / {formatCurrency(experience.price)}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No experiences yet" description="Experiences added by the platform will appear here with destination, duration, category, and price signals." />
      )}
    </DashboardCard>
  );
}

function FestivalPanel({ festivals }) {
  return (
    <DashboardCard>
      <SectionHeader title="Festival Radar" description="Seasonal travel moments that can shape an itinerary." />
      {festivals.length ? (
        <div className="mt-5 space-y-3">
          {festivals.map((festival) => (
            <div key={festival.id} className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{formatDate(festival.startDate)}</p>
              <h3 className="mt-1 font-semibold text-slate-950">{festival.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{festival.destination?.name ?? "Destination pending"}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Festival calendar is empty" description="Featured and upcoming festivals will appear here after festival intelligence records are added." />
      )}
    </DashboardCard>
  );
}

function SafetyPanel() {
  const items = [
    ["Weather", "Check best season and live weather before committing to remote routes."],
    ["Emergency", "Use destination emergency contacts and keep offline notes for low-connectivity areas."],
    ["Responsible travel", "Prefer local guides, verified homestays, and community-positive experiences."],
  ];

  return (
    <DashboardCard>
      <SectionHeader title="Safety And Readiness" description="Travel intelligence that should sit beside every plan." />
      <div className="mt-5 grid gap-3">
        {items.map(([title, description]) => (
          <div key={title} className="rounded-lg bg-amber-50 p-4">
            <h3 className="font-semibold text-slate-950">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-700">{description}</p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

export function DashboardUI({ data }) {
  const canManageDestinations = data.user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <DashboardHero data={data} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Destinations" value={data.metrics.destinations} detail="Live records from admin destination intelligence." />
        <MetricCard label="Experiences" value={data.metrics.experiences} detail="Bookable or discoverable activities in the system." />
        <MetricCard label="Festivals" value={data.metrics.festivals} detail="Calendar signals for seasonal planning." />
        <MetricCard label="Active Trips" value={data.metrics.trips} detail="Planning or active journeys for this account." />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <TripPanel data={data} />
        <RecommendationsPanel recommendations={data.recommendations} highlights={data.recommendationHighlights} />
      </section>

      <DashboardCard className="overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-white p-5">
          <SectionHeader
            title="Destination Intelligence"
            description="Destinations added or updated in the admin panel appear here automatically with village, season, safety, and experience signals."
            action={
              <div className="flex flex-wrap gap-2">
                {canManageDestinations ? <LinkButton href="/admin" variant="secondary">Manage</LinkButton> : null}
                <LinkButton href="/destinations" variant="secondary">View all</LinkButton>
              </div>
            }
          />
        </div>
        {data.destinations.length ? (
          <div className="bg-slate-50/70 p-5">
            <div className="mb-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Latest records</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{data.destinations.length}</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Featured signals</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{data.metrics.featuredDestinations}</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search-ready</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{data.destinations.filter((destination) => destination.village?.name).length}</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {data.destinations.map((destination) => (
                <DestinationDashboardCard key={destination.id} destination={destination} />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="No destinations published yet"
              description="Published destination intelligence will populate this dashboard, search, destination guides, and recommendation surfaces."
              action={canManageDestinations ? <LinkButton href="/admin" variant="secondary">Open admin</LinkButton> : null}
            />
          </div>
        )}
      </DashboardCard>

      <section className="grid gap-6 lg:grid-cols-3">
        <ExperiencePanel experiences={data.experiences} />
        <FestivalPanel festivals={data.festivals} />
        <SafetyPanel />
      </section>
    </div>
  );
}
