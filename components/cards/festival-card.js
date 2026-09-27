import Link from "next/link";
import { AppImage } from "@/components/ui/app-image";
import { dateBadge, formatDateRange, locationLabel } from "@/lib/utils/format";

export function FestivalCard({ festival }) {
  const badge = dateBadge(festival.startDate);

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface-muted">
        <AppImage
          src={festival.image}
          alt={festival.title}
          fallbackLabel={festival.title}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {badge ? (
          <div className="absolute left-3 top-3 rounded-lg bg-surface px-2.5 py-1 text-center leading-none shadow-sm">
            <span className="block text-lg font-bold text-ink">{badge.day}</span>
            <span className="block text-[11px] font-semibold uppercase text-link">{badge.month}</span>
          </div>
        ) : null}
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug text-ink">
        <Link href={`/festivals/${festival.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {festival.title}
        </Link>
      </h3>
      <p className="text-sm text-ink-muted">
        {formatDateRange(festival.startDate, festival.endDate)}
        {festival.destination ? ` · ${festival.destination.name}, ${locationLabel({ state: festival.destination.village?.state })}` : ""}
      </p>
      <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{festival.description}</p>
    </article>
  );
}
