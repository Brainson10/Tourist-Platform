import Link from "next/link";
import { TripForm } from "@/components/trips/trip-form";
import { Container } from "@/components/ui/container";
import { requireUserPage } from "@/lib/auth/session";
import { listDestinationOptions } from "@/lib/services/destination.service";

export const metadata = { title: "Plan a trip" };

export default async function NewTripPage({ searchParams }) {
  const params = await searchParams;
  const destinationId = typeof params?.destination === "string" ? params.destination : undefined;
  await requireUserPage(destinationId ? `/trips/new?destination=${encodeURIComponent(destinationId)}` : "/trips/new");
  const destinations = await listDestinationOptions();

  return (
    <Container size="narrow" className="py-10">
      <Link href="/trips" className="text-sm font-medium text-link hover:underline">
        ← My trips
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Plan a trip</h1>
      <p className="mt-1 text-ink-muted">Start with the basics. You&apos;ll build the day-by-day plan next.</p>
      <div className="mt-6 rounded-xl border border-line bg-surface p-5 sm:p-6">
        <TripForm destinations={destinations} initialDestinationId={destinationId} />
      </div>
    </Container>
  );
}
