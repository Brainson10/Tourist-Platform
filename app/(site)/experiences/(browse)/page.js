import { CardGrid } from "@/components/cards/card-grid";
import { ExperienceCard } from "@/components/cards/experience-card";
import { Container } from "@/components/ui/container";
import { inputClasses } from "@/components/ui/field";
import { FilterChips } from "@/components/ui/filter-chips";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { listExperiences } from "@/lib/services/experience.service";
import { pluralize, titleCase } from "@/lib/utils/format";
import { withQuery } from "@/lib/utils/query-string";
import { parseSearchParams } from "@/lib/utils/search-params";
import { EXPERIENCE_CATEGORIES } from "@/lib/validators/common";
import { experienceQuerySchema } from "@/lib/validators/content";

export const metadata = {
  title: "Experiences",
  description: "Safaris, heritage walks, food tours and nature trails led by local guides.",
};

export default async function ExperiencesPage({ searchParams }) {
  const query = parseSearchParams(experienceQuerySchema, await searchParams);
  let results = null;

  try {
    results = await listExperiences({ ...query, limit: 12 });
  } catch (error) {
    console.error("[experiences] failed to load", error);
  }

  const categories = [{ value: undefined, label: "All" }, ...EXPERIENCE_CATEGORIES.filter((value) => value !== "FESTIVAL").map((value) => ({ value, label: titleCase(value) }))];

  return (
    <Container className="py-10">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Experiences</h1>
        <p className="mt-2 text-ink-muted">Guided walks, safaris, food trails and more — the best way to really get to know a place.</p>
      </header>

      <form action="/experiences" role="search" className="mt-6 flex max-w-xl gap-2">
        {query.category ? <input type="hidden" name="category" value={query.category} /> : null}
        <label htmlFor="experience-search" className="sr-only">
          Search experiences
        </label>
        <input id="experience-search" name="search" type="search" defaultValue={query.search ?? ""} placeholder="Search by activity or place…" className={inputClasses} />
        <button type="submit" className="rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800">
          Search
        </button>
      </form>

      <div className="mt-4">
        <FilterChips label="Filter by type" options={categories} active={query.category} hrefFor={(value) => withQuery("/experiences", { category: value, search: query.search })} />
      </div>

      {!results ? (
        <ErrorState className="mt-8" title="We couldn't load experiences" description="Please refresh the page in a moment." />
      ) : (
        <>
          <p className="mt-6 text-sm text-ink-muted" aria-live="polite">
            {pluralize(results.meta.total, "experience")}
          </p>
          <div className="mt-4">
            {results.data.length ? (
              <CardGrid>
                {results.data.map((experience, index) => (
                  <ExperienceCard key={experience.id} experience={experience} priority={index < 4} />
                ))}
              </CardGrid>
            ) : (
              <EmptyState
                title="No experiences found"
                description={query.search || query.category ? "Try another type or search term." : "Experiences will appear here once they're added."}
                action={query.search || query.category ? { href: "/experiences", label: "Show all experiences" } : null}
              />
            )}
          </div>
          <Pagination className="mt-10" meta={results.meta} basePath="/experiences" params={{ category: query.category, search: query.search }} />
        </>
      )}
    </Container>
  );
}
