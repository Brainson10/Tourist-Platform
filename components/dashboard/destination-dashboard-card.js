/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

function categoryLabel(destination) {
  return destination.categories?.length ? destination.categories.slice(0, 2).join(" / ") : "Destination intelligence";
}

export function DestinationDashboardCard({ destination }) {
  const image = destination.heroImage ?? destination.coverImage ?? destination.galleryImages?.[0];
  const location = [destination.village?.name, destination.district, destination.state].filter(Boolean).join(", ");
  const highlights = [
    destination.bestSeason ? `Best: ${destination.bestSeason}` : null,
    destination.estimatedDuration,
    destination.thingsToDo?.[0],
  ].filter(Boolean);

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <div className="relative aspect-[16/10] bg-slate-100">
        {image ? <img src={image} alt={destination.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : null}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-3">
          <p className="text-xs font-medium text-white">{location || "Location intelligence pending"}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{categoryLabel(destination)}</p>
          {destination.isFeatured ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900">Featured</span> : null}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">{destination.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{destination.shortDescription ?? destination.description}</p>
        {highlights.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {highlights.slice(0, 3).map((highlight) => (
              <span key={highlight} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {highlight}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-xs font-medium text-slate-500">{destination.hiddenGems?.length ?? 0} hidden gems</span>
          <Link href={`/destinations/${destination.slug}`} className="text-sm font-semibold text-emerald-800 hover:text-emerald-900">
            View guide
          </Link>
        </div>
      </div>
    </article>
  );
}
