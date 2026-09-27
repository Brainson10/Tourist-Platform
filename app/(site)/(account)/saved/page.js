import { CardGrid } from "@/components/cards/card-grid";
import { DestinationCard } from "@/components/cards/destination-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/states";
import { requireUserPage } from "@/lib/auth/session";
import { listSaved } from "@/lib/services/saved.service";
import { pluralize } from "@/lib/utils/format";

export const metadata = { title: "Saved places" };

export default async function SavedPage() {
  const user = await requireUserPage("/saved");
  const saved = await listSaved(user.id, 100);

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Saved places</h1>
      <p className="mt-1 text-ink-muted">{saved.length ? pluralize(saved.length, "place") : "Places you save will show up here."}</p>
      <div className="mt-8">
        {saved.length ? (
          <CardGrid>
            {saved.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </CardGrid>
        ) : (
          <EmptyState icon="♡" title="Nothing saved yet" description="Tap Save on any destination to build your wishlist." action={{ href: "/destinations", label: "Browse destinations" }} />
        )}
      </div>
    </Container>
  );
}
