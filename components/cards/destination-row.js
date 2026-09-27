import Link from "next/link";
import { AppImage } from "@/components/ui/app-image";
import { RatingLabel } from "@/components/ui/rating";
import { locationLabel } from "@/lib/utils/format";

/** Compact horizontal card, used next to maps. */
export function DestinationRow({ destination }) {
  return (
    <article className="group relative flex gap-3 rounded-2xl border border-line bg-surface p-2.5 transition-colors hover:border-line-strong">
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
        <AppImage src={destination.image} alt="" fallbackLabel={destination.name} sizes="96px" />
      </div>
      <div className="min-w-0 py-0.5">
        <h3 className="truncate font-semibold text-ink">
          <Link href={`/destinations/${destination.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {destination.name}
          </Link>
        </h3>
        <p className="truncate text-sm text-ink-muted">{locationLabel(destination.village)}</p>
        {destination.reviewCount ? <RatingLabel average={destination.ratingAverage} count={destination.reviewCount} className="mt-1" /> : <p className="mt-1 line-clamp-1 text-xs text-ink-subtle">{destination.shortDescription}</p>}
      </div>
    </article>
  );
}
