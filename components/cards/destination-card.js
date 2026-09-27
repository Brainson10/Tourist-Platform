import Link from "next/link";
import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { RatingLabel } from "@/components/ui/rating";
import { locationLabel } from "@/lib/utils/format";
import { formatDistance } from "@/lib/utils/geo";

export function DestinationCard({ destination, reason, priority = false }) {
  const primaryCategory = destination.categories?.[0];

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-muted">
        <AppImage
          src={destination.image}
          alt={destination.name}
          fallbackLabel={destination.name}
          priority={priority}
          sizes="(min-width: 1280px) 280px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {primaryCategory ? (
          <Badge tone="overlay" className="absolute left-3 top-3">
            {primaryCategory.name}
          </Badge>
        ) : null}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-ink">
          <Link href={`/destinations/${destination.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {destination.name}
          </Link>
        </h3>
        {destination.reviewCount ? <RatingLabel average={destination.ratingAverage} count={destination.reviewCount} className="shrink-0" /> : null}
      </div>
      <p className="text-sm text-ink-muted">
        {locationLabel(destination.village)}
        {destination.distanceKm !== undefined ? ` · ${formatDistance(destination.distanceKm)}` : ""}
      </p>
      {reason ? (
        <p className="mt-1 text-sm font-medium text-link">{reason}</p>
      ) : (
        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{destination.shortDescription}</p>
      )}
    </article>
  );
}
