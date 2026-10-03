import Link from "next/link";
import { CardGrid } from "@/components/cards/card-grid";
import { SouvenirCard } from "@/components/cards/souvenir-card";
import { HelpMeChooseDialog } from "@/components/souvenirs/help-me-choose-dialog";
import { withQuery } from "@/lib/utils/query-string";

/** Body of the destination page's "Take Home a Memory" section. `souvenirs` is null when loading failed. */
export function DestinationSouvenirs({ destination, souvenirs }) {
  if (!souvenirs) {
    return <p className="rounded-xl border border-warn-line bg-warn-soft px-5 py-4 text-sm text-warn-ink">We couldn&apos;t load local treasures right now. Please refresh the page in a moment.</p>;
  }

  if (!souvenirs.items.length) {
    return (
      <p className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-8 text-center text-sm text-ink-muted">
        No local treasures have been added yet. We&apos;re working on discovering more special things you can take home from this destination.
      </p>
    );
  }

  return (
    <>
      <CardGrid columns={3}>
        {souvenirs.items.map((souvenir) => (
          <SouvenirCard key={souvenir.id} souvenir={souvenir} />
        ))}
      </CardGrid>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-accent-soft/60 px-5 py-4">
        <HelpMeChooseDialog destination={{ slug: destination.slug, name: destination.name, state: souvenirs.state }} />
        <Link href={withQuery("/souvenirs", { state: souvenirs.state })} className="text-sm font-semibold text-link hover:underline">
          View all local treasures <span aria-hidden="true">→</span>
        </Link>
      </div>
    </>
  );
}
