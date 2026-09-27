"use client";

import { MapPanel } from "@/components/maps/map";

/**
 * One numbered pin per place on the itinerary, in the order it first appears.
 * `stops`: [{ id, name, slug, latitude, longitude, days: [1, 2] }]
 */
export function TripRouteMap({ stops }) {
  if (!stops.length) return null;

  const markers = stops.map((stop, index) => ({
    id: stop.id,
    lat: stop.latitude,
    lng: stop.longitude,
    number: index + 1,
    label: stop.name,
    detail: stop.days.length ? `Day ${stop.days.length > 1 ? `${stop.days[0]}–${stop.days.at(-1)}` : stop.days[0]}` : "Trip destination",
    href: `/destinations/${stop.slug}`,
    kind: index === 0 ? "destination" : "stop",
  }));

  return <MapPanel markers={markers} label="Trip route map" className="h-64" />;
}
