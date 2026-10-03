import { MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { SouvenirImage } from "@/components/souvenirs/souvenir-image";
import { SouvenirIcon } from "@/components/souvenirs/souvenir-icon";
import { Badge } from "@/components/ui/badge";
import { AUDIENCES, QUALITIES, labelOf } from "@/lib/constants/souvenirs";
import { formatPriceRange } from "@/lib/utils/format";
import { formatDistance } from "@/lib/utils/geo";

// Badge order: the qualities that say the most about a craft first.
const BADGE_ORDER = ["TRADITIONAL", "HANDMADE", "REGIONAL_SPECIALTY", "ARTISAN_MADE", "LOCALLY_MADE"];
const NEARBY_KM = 40;

function whereLabel(souvenir) {
  const nearest = souvenir.nearestSeller;
  if (nearest) return nearest.distanceKm <= NEARBY_KM ? `Available locally · ${formatDistance(nearest.distanceKm)}` : `Nearest place to buy · ${formatDistance(nearest.distanceKm)}`;
  const origin = souvenir.destinations[0];
  if (!origin) return null;
  return `From ${origin.name}${origin.state ? `, ${origin.state}` : ""}`;
}

/**
 * Story-first card: what it is and why it matters, then who it suits, price and where to find it.
 * `reasons` (from Help me choose) replace the audience line with why it was suggested.
 */
export function SouvenirCard({ souvenir, audience, reasons, priority = false }) {
  const badges = BADGE_ORDER.filter((quality) => souvenir.qualities.includes(quality)).slice(0, 2);
  const audienceValue = audience && souvenir.audiences.includes(audience) ? audience : souvenir.audiences[0];
  const audienceTag = audienceValue ? AUDIENCES.find((entry) => entry.value === audienceValue)?.tag : null;
  const where = whereLabel(souvenir);

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-muted">
        <SouvenirImage
          src={souvenir.image}
          alt={souvenir.name}
          icon={souvenir.category.icon}
          fallbackLabel={souvenir.category.name}
          priority={priority}
          sizes="(min-width: 1280px) 280px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {souvenir.image ? (
          <Badge tone="overlay" className="absolute left-3 top-3">
            <SouvenirIcon icon={souvenir.category.icon} className="h-3.5 w-3.5" />
            {souvenir.category.name}
          </Badge>
        ) : null}
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-ink">
        <Link href={`/souvenirs/${souvenir.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {souvenir.name}
        </Link>
      </h3>
      <p className="mt-0.5 line-clamp-2 text-sm text-ink-muted">{souvenir.shortDescription}</p>

      {badges.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {badges.map((quality) => (
            <Badge key={quality} tone="brand">
              {labelOf(QUALITIES, quality)}
            </Badge>
          ))}
        </div>
      ) : null}

      {reasons?.length ? (
        <p className="mt-2 flex items-start gap-1.5 text-sm font-medium text-link">
          <Sparkles aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{reasons.slice(0, 3).join(" · ")}</span>
        </p>
      ) : audienceTag ? (
        <p className="mt-2 text-sm font-medium text-accent-ink">{audienceTag}</p>
      ) : null}

      <p className="mt-1 text-sm font-semibold text-ink">{formatPriceRange(souvenir.priceMin, souvenir.priceMax)}</p>
      {where ? (
        <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-muted">
          <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          {where}
        </p>
      ) : null}
      <p aria-hidden="true" className="mt-2 text-sm font-semibold text-link group-hover:underline">
        Discover this local treasure →
      </p>
    </article>
  );
}
