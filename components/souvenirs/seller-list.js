import { BadgeCheck, Clock, Globe, MapPin, Navigation, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SELLER_KINDS, labelOf } from "@/lib/constants/souvenirs";
import { directionsUrl, formatDistance } from "@/lib/utils/geo";

/** "Where to buy" places: what they are, how to find them, and a directions link. */
export function SellerList({ sellers }) {
  return (
    <ol className="space-y-3">
      {sellers.map((seller, index) => (
        <li key={seller.id} className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-shop text-xs font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold text-ink">{seller.name}</h3>
                <p className="text-sm text-ink-muted">
                  {labelOf(SELLER_KINDS, seller.kind)}
                  {seller.distanceKm !== null && seller.from ? ` · ${formatDistance(seller.distanceKm)} from ${seller.from}` : ""}
                </p>
              </div>
            </div>
            {seller.isVerified ? (
              <Badge tone="brand" className="shrink-0">
                <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
                Verified
              </Badge>
            ) : null}
          </div>

          {seller.note ? <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent-ink">Tip: {seller.note}</p> : null}
          {seller.description ? <p className="mt-3 text-sm text-ink-muted">{seller.description}</p> : null}

          <ul className="mt-3 space-y-1.5 text-sm text-ink-muted">
            {seller.address || seller.village ? (
              <li className="flex gap-2">
                <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                {[seller.address, seller.village && `${seller.village.name}, ${seller.village.state}`].filter(Boolean).join(" · ")}
              </li>
            ) : null}
            {seller.openingHours ? (
              <li className="flex gap-2">
                <Clock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                {seller.openingHours}
              </li>
            ) : null}
            {seller.phone ? (
              <li className="flex gap-2">
                <Phone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`tel:${seller.phone.replace(/[^\d+]/g, "")}`} className="font-medium text-ink hover:underline">
                  {seller.phone}
                </a>
              </li>
            ) : null}
            {seller.website ? (
              <li className="flex gap-2">
                <Globe aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={seller.website} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-link hover:underline">
                  {seller.website.replace(/^https:\/\//, "")}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ) : null}
          </ul>

          <a href={directionsUrl(seller)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline">
            <Navigation aria-hidden="true" className="h-4 w-4" />
            Get directions<span className="sr-only"> to {seller.name} (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ol>
  );
}
