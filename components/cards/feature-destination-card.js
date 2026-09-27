import Link from "next/link";
import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { RatingLabel } from "@/components/ui/rating";
import { locationLabel } from "@/lib/utils/format";
import { formatMonthSpans } from "@/lib/utils/months";

/** A large editorial card with the text laid over the photo. */
export function FeatureDestinationCard({ destination, priority = false }) {
  return (
    <article className="group relative isolate flex min-h-[22rem] overflow-hidden rounded-3xl bg-night lg:h-full">
      <AppImage
        src={destination.image}
        alt={destination.name}
        fallbackLabel={destination.name}
        priority={priority}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="-z-10 transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="mt-auto p-6 text-white sm:p-8">
        <div className="flex flex-wrap gap-2">
          {destination.categories.slice(0, 2).map((category) => (
            <Badge key={category.id} tone="overlay">
              {category.name}
            </Badge>
          ))}
          {destination.bestMonths?.length ? <Badge tone="overlay">Best {formatMonthSpans(destination.bestMonths)}</Badge> : null}
        </div>
        <h3 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
          <Link href={`/destinations/${destination.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {destination.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-white/80">{locationLabel(destination.village)}</p>
        <p className="mt-3 line-clamp-2 max-w-lg text-white/90">{destination.shortDescription}</p>
        {destination.reviewCount ? <RatingLabel average={destination.ratingAverage} count={destination.reviewCount} className="mt-3 text-white [&_span]:text-white" /> : null}
      </div>
    </article>
  );
}
