import { List, Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { CardGrid } from "@/components/cards/card-grid";
import { DestinationCard } from "@/components/cards/destination-card";
import { DestinationRow } from "@/components/cards/destination-row";
import { DestinationsMap } from "@/components/destinations/destinations-map";
import { NearMeButton } from "@/components/destinations/near-me-button";
import { AutoSubmitForm } from "@/components/ui/auto-submit-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/container";
import { Select, inputClasses } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { getDestinationFilterOptions, getNearbyDestinations, listDestinationPoints, listDestinations } from "@/lib/services/destination.service";
import { pluralize } from "@/lib/utils/format";
import { withQuery } from "@/lib/utils/query-string";
import { parseSearchParams } from "@/lib/utils/search-params";
import { destinationQuerySchema } from "@/lib/validators/destination";

export const metadata = {
  title: "Destinations",
  description: "Search lakes, hills, wildlife parks, monasteries and villages across Northeast India.",
};

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Top rated" },
  { value: "name", label: "Name (A–Z)" },
  { value: "newest", label: "Recently added" },
];

const NEAR_RADIUS_KM = 400;

async function loadResults(query, search) {
  if (query.near) {
    const [latitude, longitude] = query.near;
    const data = await getNearbyDestinations({ latitude, longitude, radiusKm: NEAR_RADIUS_KM, limit: 48 });
    return { data, meta: { page: 1, limit: data.length, total: data.length, totalPages: 1 } };
  }

  if (query.view === "map") {
    const data = await listDestinationPoints({ ...query, search });
    return { data, meta: { page: 1, limit: data.length, total: data.length, totalPages: 1 } };
  }

  return listDestinations({ ...query, search, limit: 12 });
}

export default async function DestinationsPage({ searchParams }) {
  const query = parseSearchParams(destinationQuerySchema, await searchParams);
  const search = query.q ?? query.search;
  const view = query.view === "map" ? "map" : "list";
  const filters = { q: search, category: query.category, state: query.state, sort: query.sort };

  let results = null;
  let options = { categories: [], locations: [] };

  try {
    [results, options] = await Promise.all([loadResults(query, search), getDestinationFilterOptions()]);
  } catch (error) {
    console.error("[destinations] failed to load", error);
  }

  const activeCategory = options.categories.find((category) => category.slug === query.category);
  const hasFilters = Boolean(search || query.category || query.state);
  const viewLink = (target) => withQuery("/destinations", { ...filters, view: target === "map" ? "map" : undefined });

  return (
    <Container className="py-10">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {query.near ? "Places near you" : activeCategory ? `${activeCategory.name} destinations` : query.state ? `Destinations in ${query.state}` : "Find your next destination"}
        </h1>
        <p className="mt-2 text-ink-muted">
          {query.near ? `Closest first, within ${NEAR_RADIUS_KM} km of your location.` : "Search by place, district, state or what you want to do."}
        </p>
      </header>

      {!query.near ? (
        <AutoSubmitForm action="/destinations" role="search" className="mt-6 grid gap-3 rounded-2xl border border-line bg-surface p-3 md:grid-cols-[1fr_180px_180px_170px_auto]">
          {view === "map" ? <input type="hidden" name="view" value="map" /> : null}
          <label htmlFor="destination-search" className="sr-only">
            Search
          </label>
          <input id="destination-search" name="q" type="search" defaultValue={search ?? ""} placeholder="Search destinations…" className={inputClasses} />

          <label htmlFor="destination-category" className="sr-only">
            Interest
          </label>
          <Select id="destination-category" name="category" defaultValue={query.category ?? ""}>
            <option value="">All interests</option>
            {options.categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>

          <label htmlFor="destination-state" className="sr-only">
            State
          </label>
          <Select id="destination-state" name="state" defaultValue={query.state ?? ""}>
            <option value="">All states</option>
            {options.locations.map((location) => (
              <option key={location.state} value={location.state}>
                {location.state}
              </option>
            ))}
          </Select>

          <label htmlFor="destination-sort" className="sr-only">
            Sort by
          </label>
          <Select id="destination-sort" name="sort" defaultValue={query.sort ?? "recommended"}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Button type="submit">Search</Button>
        </AutoSubmitForm>
      ) : null}

      {!results ? (
        <ErrorState className="mt-8" title="We couldn't load destinations" description="Please refresh the page in a moment." />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted" aria-live="polite">
              {pluralize(results.meta.total, "destination")}
              {search ? ` for “${search}”` : ""}
              {hasFilters && !query.near ? (
                <>
                  {" · "}
                  <Link href={view === "map" ? "/destinations?view=map" : "/destinations"} className="font-medium text-link hover:underline">
                    Clear filters
                  </Link>
                </>
              ) : null}
            </p>
            <div className="flex items-center gap-2">
              <NearMeButton active={Boolean(query.near)} />
              {!query.near ? (
                <div role="group" aria-label="View" className="inline-flex rounded-full border border-line bg-surface p-0.5">
                  {[
                    ["list", "List", List],
                    ["map", "Map", MapIcon],
                  ].map(([value, label, Icon]) => (
                    <Link
                      key={value}
                      href={viewLink(value)}
                      aria-current={view === value ? "page" : undefined}
                      className={cn(
                        "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-sm font-medium",
                        view === value ? "bg-brand-700 text-white" : "text-ink-muted hover:text-ink"
                      )}
                    >
                      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                      {label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            {!results.data.length ? (
              <EmptyState
                title={query.near ? "Nothing close by yet" : "No destinations found"}
                description={query.near ? `We don't have destinations within ${NEAR_RADIUS_KM} km of you yet.` : hasFilters ? "Try a different search or remove a filter." : "Destinations will appear here once they're added."}
                action={query.near || hasFilters ? { href: "/destinations", label: "Show all destinations" } : null}
              />
            ) : view === "map" && !query.near ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <DestinationsMap destinations={results.data} />
                <ul className="max-h-[34rem] space-y-2.5 overflow-y-auto pr-1">
                  {results.data.map((destination) => (
                    <li key={destination.id}>
                      <DestinationRow destination={destination} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <CardGrid>
                {results.data.map((destination, index) => (
                  <DestinationCard key={destination.id} destination={destination} priority={index < 4} />
                ))}
              </CardGrid>
            )}
          </div>

          {view === "list" && !query.near ? <Pagination className="mt-10" meta={results.meta} basePath="/destinations" params={filters} /> : null}
        </>
      )}
    </Container>
  );
}
