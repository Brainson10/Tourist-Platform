import { notFoundError } from "@/lib/api/errors";
import { findDestinationSummary } from "@/lib/repositories/destination.repository";
import { distanceKm } from "@/lib/utils/geo";

/**
 * Nearby essentials from OpenStreetMap (Overpass API). No API key needed.
 * Results are cached for a day per destination and type; failures return a
 * friendly "unavailable" state instead of breaking the page.
 */
export const PLACE_TYPES = {
  hospital: { label: "Hospitals & clinics", filters: ['nwr["amenity"~"^(hospital|clinic|doctors)$"]'], radiusKm: 10 },
  police: { label: "Police", filters: ['nwr["amenity"="police"]'], radiusKm: 15 },
  restaurant: { label: "Restaurants & cafés", filters: ['nwr["amenity"~"^(restaurant|cafe|fast_food)$"]'], radiusKm: 5 },
  hotel: { label: "Hotels & stays", filters: ['nwr["tourism"~"^(hotel|guest_house|hostel|motel|chalet)$"]'], radiusKm: 10 },
  attraction: { label: "Attractions", filters: ['nwr["tourism"~"^(attraction|viewpoint|museum|gallery)$"]', 'nwr["historic"]["name"]'], radiusKm: 10 },
  transport: { label: "Transport", filters: ['nwr["amenity"~"^(bus_station|taxi)$"]', 'nwr["railway"="station"]', 'nwr["aeroway"="aerodrome"]["iata"]'], radiusKm: 25 },
  atm: { label: "ATMs & banks", filters: ['nwr["amenity"~"^(atm|bank)$"]'], radiusKm: 10 },
};

const OVERPASS_URL = process.env.OVERPASS_API_URL || "https://overpass-api.de/api/interpreter";

function buildQuery(type, { latitude, longitude }, radiusKm) {
  const radius = Math.round(radiusKm * 1000);
  const parts = PLACE_TYPES[type].filters.map((filter) => `${filter}(around:${radius},${latitude},${longitude});`).join("");
  return `[out:json][timeout:15];(${parts});out center tags 60;`;
}

function describe(tags) {
  const kind = tags.amenity || tags.tourism || tags.railway || tags.aeroway || tags.historic || "";
  return kind.replace(/_/g, " ");
}

function toPlace(element, origin) {
  const tags = element.tags ?? {};
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  const name = tags["name:en"] || tags.name;

  if (!name || latitude === undefined || longitude === undefined) return null;

  return {
    id: `${element.type}/${element.id}`,
    name,
    kind: describe(tags),
    latitude,
    longitude,
    distanceKm: distanceKm(origin, { latitude, longitude }),
    phone: tags.phone || tags["contact:phone"] || null,
    openingHours: tags.opening_hours || null,
    address: [tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", ") || null,
    emergency: tags.emergency === "yes",
  };
}

export async function findNearbyPlaces({ type, latitude, longitude, radiusKm }) {
  const config = PLACE_TYPES[type];
  const radius = radiusKm ?? config.radiusKm;
  const origin = { latitude, longitude };
  const url = `${OVERPASS_URL}?data=${encodeURIComponent(buildQuery(type, origin, radius))}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "SmartTourismPlatform/1.0 (nearby essentials)", Accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 },
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      throw new Error(`Overpass responded ${response.status}`);
    }

    const payload = await response.json();
    const seen = new Set();
    const places = (payload.elements ?? [])
      .map((element) => toPlace(element, origin))
      .filter((place) => {
        if (!place) return false;
        const key = `${place.name.toLowerCase()}-${place.latitude.toFixed(3)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((first, second) => first.distanceKm - second.distanceKm)
      .slice(0, 12);

    return { type, label: config.label, radiusKm: radius, places, available: true };
  } catch (error) {
    console.warn("[nearby-places] lookup failed:", error?.message ?? error);
    return { type, label: config.label, radiusKm: radius, places: [], available: false };
  }
}

export async function findNearbyPlacesForDestination(destinationId, { type, radiusKm }) {
  const destination = await findDestinationSummary(destinationId);

  if (!destination) {
    throw notFoundError("We couldn't find that destination");
  }

  return findNearbyPlaces({ type, radiusKm, latitude: destination.latitude, longitude: destination.longitude });
}
