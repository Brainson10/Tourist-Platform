import { CardGrid } from "@/components/cards/card-grid";
import { FestivalCard } from "@/components/cards/festival-card";
import { Container } from "@/components/ui/container";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { listFestivals } from "@/lib/services/festival.service";
import { pluralize } from "@/lib/utils/format";
import { withQuery } from "@/lib/utils/query-string";
import { parseSearchParams } from "@/lib/utils/search-params";
import { festivalQuerySchema } from "@/lib/validators/content";

export const metadata = {
  title: "Festivals & events",
  description: "Festival calendar for Northeast India — dates, places and what makes each celebration special.",
};

export default async function FestivalsPage({ searchParams }) {
  const query = parseSearchParams(festivalQuerySchema, await searchParams);
  const when = query.when === "past" ? "past" : "upcoming";
  let results = null;

  try {
    results = await listFestivals({ ...query, when, limit: 12 });
  } catch (error) {
    console.error("[festivals] failed to load", error);
  }

  return (
    <Container className="py-10">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Festivals & events</h1>
        <p className="mt-2 text-ink-muted">Time your trip around a celebration — music, dance, food and centuries-old traditions.</p>
      </header>

      <div className="mt-6">
        <FilterChips
          label="Festival dates"
          options={[
            { value: undefined, label: "Upcoming" },
            { value: "past", label: "Past festivals" },
          ]}
          active={when === "past" ? "past" : undefined}
          hrefFor={(value) => withQuery("/festivals", { when: value })}
        />
      </div>

      {!results ? (
        <ErrorState className="mt-8" title="We couldn't load festivals" description="Please refresh the page in a moment." />
      ) : (
        <>
          <p className="mt-6 text-sm text-ink-muted">{pluralize(results.meta.total, when === "past" ? "past festival" : "upcoming festival")}</p>
          <div className="mt-4">
            {results.data.length ? (
              <CardGrid columns={3}>
                {results.data.map((festival) => (
                  <FestivalCard key={festival.id} festival={festival} />
                ))}
              </CardGrid>
            ) : (
              <EmptyState
                title={when === "past" ? "No past festivals listed" : "No upcoming festivals listed yet"}
                description="New dates are added as they're announced. Check back soon."
                action={when === "past" ? { href: "/festivals", label: "See upcoming festivals" } : { href: "/festivals?when=past", label: "Browse past festivals" }}
              />
            )}
          </div>
          <Pagination className="mt-10" meta={results.meta} basePath="/festivals" params={{ when: when === "past" ? "past" : undefined }} />
        </>
      )}
    </Container>
  );
}
