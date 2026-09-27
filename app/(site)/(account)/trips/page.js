import { TripCard } from "@/components/trips/trip-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/states";
import { requireUserPage } from "@/lib/auth/session";
import { listTrips } from "@/lib/services/trip.service";

export const metadata = { title: "My trips" };

function TripGroup({ title, trips }) {
  if (!trips.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </section>
  );
}

export default async function TripsPage() {
  const user = await requireUserPage("/trips");
  const trips = await listTrips(user.id);
  const upcoming = trips.filter((trip) => trip.phase === "upcoming" || trip.phase === "ongoing");
  const past = trips.filter((trip) => trip.phase === "past").reverse();
  const cancelled = trips.filter((trip) => trip.phase === "cancelled");

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">My trips</h1>
          <p className="mt-1 text-ink-muted">Your plans, day by day.</p>
        </div>
        <ButtonLink href="/trips/new">Plan a new trip</ButtonLink>
      </div>

      {trips.length ? (
        <>
          <TripGroup title="Upcoming" trips={upcoming} />
          <TripGroup title="Past trips" trips={past} />
          <TripGroup title="Cancelled" trips={cancelled} />
        </>
      ) : (
        <EmptyState
          className="mt-8"
          icon="✈"
          title="No trips yet"
          description="Choose a destination and dates — we'll help you fill in the days."
          action={{ href: "/trips/new", label: "Plan your first trip" }}
        />
      )}
    </Container>
  );
}
