"use client";

import { MapPanel } from "@/components/maps/map";
import { formatRating, locationLabel } from "@/lib/utils/format";

export function DestinationsMap({ destinations }) {
  const markers = destinations.map((destination) => ({
    id: destination.id,
    lat: destination.latitude,
    lng: destination.longitude,
    label: destination.name,
    detail: [locationLabel(destination.village), destination.reviewCount ? `★ ${formatRating(destination.ratingAverage)}` : null].filter(Boolean).join(" · "),
    href: `/destinations/${destination.slug}`,
    kind: "destination",
  }));

  return <MapPanel markers={markers} label="Map of destinations" className="h-[28rem] sm:h-[34rem]" />;
}
