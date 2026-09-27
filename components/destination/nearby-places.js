"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPanel } from "@/components/maps/map";
import { cn } from "@/components/ui/cn";
import { Skeleton } from "@/components/ui/states";
import { apiRequest } from "@/lib/utils/api-client";
import { directionsUrl, formatDistance } from "@/lib/utils/geo";

const TYPES = [
  { value: "hospital", label: "Hospitals" },
  { value: "police", label: "Police" },
  { value: "restaurant", label: "Food" },
  { value: "hotel", label: "Stays" },
  { value: "attraction", label: "Attractions" },
  { value: "transport", label: "Transport" },
  { value: "atm", label: "ATMs" },
];

export function NearbyPlaces({ destinationId, destination }) {
  const [type, setType] = useState("hospital");
  const [cache, setCache] = useState({});
  const [activeId, setActiveId] = useState(null);
  const current = cache[type];

  // The destination is always pinned; the selected tab's places are added around it.
  const markers = useMemo(() => {
    const pins = destination ? [{ id: "destination", lat: destination.latitude, lng: destination.longitude, label: destination.name, kind: "destination" }] : [];
    for (const place of current?.places ?? []) {
      pins.push({ id: place.id, lat: place.latitude, lng: place.longitude, label: place.name, detail: `${place.kind} · ${formatDistance(place.distanceKm)}`, href: directionsUrl(place), kind: type });
    }
    return pins;
  }, [current, destination, type]);

  // Fetch each category once, the first time its tab is opened.
  useEffect(() => {
    if (cache[type]) return undefined;
    let cancelled = false;

    apiRequest(`/api/destinations/${destinationId}/nearby-places?type=${type}`).then((result) => {
      if (!cancelled) setCache((previous) => ({ ...previous, [type]: result.ok ? result.data : { available: false, places: [] } }));
    });

    return () => {
      cancelled = true;
    };
  }, [type, cache, destinationId]);

  function retry() {
    setCache((previous) => {
      const next = { ...previous };
      delete next[type];
      return next;
    });
  }

  return (
    <div>
      {destination ? <MapPanel markers={markers} activeId={activeId} label={`Map of ${destination.name} and nearby places`} className="mb-5 h-72 sm:h-96" /> : null}
      <div role="tablist" aria-label="Nearby essentials" className="relative scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TYPES.map((option) => (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={type === option.value}
            onClick={() => setType(option.value)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              type === option.value ? "border-brand-700 bg-brand-700 text-white" : "border-line-strong bg-surface text-ink-muted hover:border-line-strong"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-4" aria-busy={!current}>
        {!current ? (
          <div className="space-y-2">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        ) : !current.available ? (
          <div className="rounded-lg border border-warn-line bg-warn-soft px-4 py-3 text-sm text-warn-ink">
            Nearby places are unavailable right now.{" "}
            <button type="button" onClick={retry} className="font-semibold underline">
              Try again
            </button>
          </div>
        ) : !current.places.length ? (
          <p className="rounded-lg bg-surface-muted px-4 py-3 text-sm text-ink-muted">
            No {TYPES.find((option) => option.value === type)?.label.toLowerCase()} are listed within {current.radiusKm} km on OpenStreetMap.
          </p>
        ) : (
          <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
            {current.places.map((place) => (
              <li key={place.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <button type="button" onClick={() => setActiveId(place.id)} className="block max-w-full truncate text-left font-medium text-ink hover:text-link">
                    {place.name}
                    <span className="sr-only"> — show on map</span>
                  </button>
                  <p className="truncate text-xs capitalize text-ink-muted">
                    {[place.kind, formatDistance(place.distanceKm), place.openingHours].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  {place.phone ? (
                    <a href={`tel:${place.phone.split(";")[0]}`} className="font-medium text-link hover:underline">
                      Call
                    </a>
                  ) : null}
                  <a href={directionsUrl(place)} target="_blank" rel="noopener noreferrer" className="font-medium text-link hover:underline">
                    Directions<span className="sr-only"> to {place.name} (opens in a new tab)</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-ink-muted">Listings come from OpenStreetMap and may be incomplete. In an emergency, call 112.</p>
      </div>
    </div>
  );
}
