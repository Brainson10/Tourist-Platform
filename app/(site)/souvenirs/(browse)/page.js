import { X } from "lucide-react";
import Link from "next/link";
import { CardGrid } from "@/components/cards/card-grid";
import { SouvenirCard } from "@/components/cards/souvenir-card";
import { FilterSheet } from "@/components/souvenirs/filter-sheet";
import { HelpMeChoose } from "@/components/souvenirs/help-me-choose";
import { SouvenirFilterFields } from "@/components/souvenirs/souvenir-filter-fields";
import { AutoSubmitForm } from "@/components/ui/auto-submit-form";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { inputClasses } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { WeaveBorder } from "@/components/ui/weave";
import { AUDIENCES, BUDGET_BANDS, FEATURE_NAME, INTERESTS, QUALITIES, labelOf, toParam } from "@/lib/constants/souvenirs";
import { getSouvenirFilterOptions, listSouvenirs } from "@/lib/services/souvenir.service";
import { pluralize } from "@/lib/utils/format";
import { withQuery } from "@/lib/utils/query-string";
import { parseSearchParams } from "@/lib/utils/search-params";
import { souvenirQuerySchema } from "@/lib/validators/souvenir";

export const metadata = {
  title: `${FEATURE_NAME} · Local souvenirs`,
  description: "Handmade crafts, textiles and local flavours from Northeast India — the story behind each one, what it costs, and where to find it locally.",
};

/** The query as readable URL params (enum values back to kebab-case). */
function toUrlParams(query) {
  return {
    q: query.q,
    state: query.state,
    destination: query.destination,
    category: query.category,
    budget: query.budget,
    for: query.for ? toParam(query.for) : undefined,
    quality: query.quality ? toParam(query.quality) : undefined,
    interest: query.interest ? toParam(query.interest) : undefined,
  };
}

function activeFilters(query, filterOptions) {
  const destinations = filterOptions.destinationGroups.flatMap((group) => group.destinations);
  const chips = [
    query.q && ["q", `“${query.q}”`],
    query.state && ["state", query.state],
    query.destination && ["destination", destinations.find((item) => item.slug === query.destination)?.name ?? query.destination],
    query.category && ["category", filterOptions.categories.find((item) => item.slug === query.category)?.name ?? query.category],
    query.budget && ["budget", labelOf(BUDGET_BANDS, query.budget)],
    query.for && ["for", `For ${labelOf(AUDIENCES, query.for).toLowerCase()}`],
    query.quality && ["quality", labelOf(QUALITIES, query.quality)],
    query.interest && ["interest", labelOf(INTERESTS, query.interest)],
  ];
  return chips.filter(Boolean).map(([key, label]) => ({ key, label }));
}

function resultsHeading(query, filterOptions) {
  const destination = filterOptions.destinationGroups.flatMap((group) => group.destinations).find((item) => item.slug === query.destination);
  if (destination) return `Local treasures from ${destination.name}`;
  if (query.state) return `Local treasures from ${query.state}`;
  return "All local treasures";
}

export default async function SouvenirsPage({ searchParams }) {
  const query = parseSearchParams(souvenirQuerySchema, await searchParams);
  const params = toUrlParams(query);

  let results = null;
  let filterOptions = { categories: [], destinationGroups: [] };

  try {
    [results, filterOptions] = await Promise.all([listSouvenirs({ ...query, limit: 12 }), getSouvenirFilterOptions()]);
  } catch (error) {
    console.error("[souvenirs] failed to load", error);
  }

  const chips = activeFilters(query, filterOptions);
  const filterCount = chips.filter((chip) => chip.key !== "q").length;
  const showChooser = !chips.length && (query.page ?? 1) === 1;

  return (
    <>
      <header className="border-b border-line bg-surface">
        <Container className="py-10 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent-ink">Souvenirs</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{FEATURE_NAME}</h1>
          <p className="mt-3 max-w-2xl text-ink-muted sm:text-lg">
            Handmade crafts, woven textiles and local flavours — the story behind each one, what it costs, and where to find it locally.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-ink-subtle">Nothing is sold here. Buy directly from the makers and markets we point you to.</p>
        </Container>
        <WeaveBorder height={10} />
      </header>

      <Container className="py-10">
        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="hidden lg:block" aria-label="Filters">
            <AutoSubmitForm action="/souvenirs" className="sticky top-24 rounded-2xl border border-line bg-surface p-5">
              <h2 className="mb-4 text-base font-semibold text-ink">Filter</h2>
              <SouvenirFilterFields idPrefix="side" query={query} filterOptions={filterOptions} />
              <Button type="submit" variant="secondary" className="mt-5 w-full">
                Apply filters
              </Button>
            </AutoSubmitForm>
          </aside>

          <div className="min-w-0">
            <div className="flex gap-2">
              <form action="/souvenirs" role="search" className="flex min-w-0 flex-1 gap-2">
                {Object.entries(params).map(([name, value]) => (value && name !== "q" ? <input key={name} type="hidden" name={name} value={value} /> : null))}
                <label htmlFor="souvenir-search" className="sr-only">
                  Search local treasures
                </label>
                <input id="souvenir-search" name="q" type="search" defaultValue={query.q ?? ""} placeholder="Search pottery, tea, shawls, a market…" className={`${inputClasses} min-w-0 flex-1`} />
                {/* Enter submits on phones; the button only shows from sm up. */}
                <div className="hidden sm:block">
                  <Button type="submit">Search</Button>
                </div>
              </form>
              <div className="lg:hidden">
                <FilterSheet action="/souvenirs" activeCount={filterCount}>
                  <SouvenirFilterFields idPrefix="sheet" query={query} filterOptions={filterOptions} />
                </FilterSheet>
              </div>
            </div>

            {chips.length ? (
              <ul aria-label="Active filters" className="mt-4 flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <li key={chip.key}>
                    <Link
                      href={withQuery("/souvenirs", { ...params, [chip.key]: undefined })}
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-soft-line bg-brand-soft px-3 py-1 text-sm font-medium text-brand-strong hover:border-brand-700"
                    >
                      {chip.label}
                      <X aria-hidden="true" className="h-3.5 w-3.5" />
                      <span className="sr-only">(remove filter)</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/souvenirs" className="inline-flex items-center px-2 py-1 text-sm font-medium text-link hover:underline">
                    Clear all
                  </Link>
                </li>
              </ul>
            ) : null}

            {showChooser && results?.data.length ? (
              <div className="mt-6">
                <HelpMeChoose />
              </div>
            ) : null}

            {!results ? (
              <ErrorState className="mt-8" title="We couldn't load local treasures" description="Please refresh the page in a moment." />
            ) : (
              <section aria-labelledby="results-title" className="mt-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id="results-title" className="font-display text-2xl font-semibold text-ink">
                    {resultsHeading(query, filterOptions)}
                  </h2>
                  <p className="text-sm text-ink-muted" aria-live="polite">
                    {pluralize(results.meta.total, "treasure")}
                  </p>
                </div>

                <div className="mt-5">
                  {results.data.length ? (
                    <CardGrid columns={3}>
                      {results.data.map((souvenir, index) => (
                        <SouvenirCard key={souvenir.id} souvenir={souvenir} audience={query.for} priority={index < 3} />
                      ))}
                    </CardGrid>
                  ) : (
                    <EmptyState
                      icon="🎁"
                      title={chips.length ? "No local treasures match" : "Local treasures are on their way"}
                      description={
                        chips.length
                          ? "Try a wider budget, another category, or remove a filter."
                          : "We're working on discovering special things you can take home from Northeast India. Check back soon."
                      }
                      action={chips.length ? { href: "/souvenirs", label: "Show all local treasures" } : { href: "/destinations", label: "Explore destinations" }}
                    />
                  )}
                </div>

                <Pagination className="mt-10" meta={results.meta} basePath="/souvenirs" params={params} />
              </section>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
