import { CardGrid } from "@/components/cards/card-grid";
import { GuideCard } from "@/components/cards/guide-card";
import { AutoSubmitForm } from "@/components/ui/auto-submit-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Select } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { listDestinationOptions } from "@/lib/services/destination.service";
import { listGuideLanguages, listGuides } from "@/lib/services/guide.service";
import { pluralize } from "@/lib/utils/format";
import { parseSearchParams } from "@/lib/utils/search-params";
import { guideQuerySchema } from "@/lib/validators/guide";

export const metadata = {
  title: "Local guides",
  description: "Travel with people who grew up there — local guides across Northeast India.",
};

export default async function GuidesPage({ searchParams }) {
  const query = parseSearchParams(guideQuerySchema, await searchParams);
  let results = null;
  let destinations = [];
  let languages = [];

  try {
    [results, destinations, languages] = await Promise.all([listGuides({ ...query, limit: 12 }), listDestinationOptions(), listGuideLanguages()]);
  } catch (error) {
    console.error("[guides] failed to load", error);
  }

  const filtered = Boolean(query.destination || query.language);

  return (
    <Container className="py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Local guides</h1>
          <p className="mt-2 text-ink-muted">Travel with people who grew up there. Send a request — contact details are shared once they accept.</p>
        </div>
        <ButtonLink href="/guide/apply" variant="secondary">
          Become a guide
        </ButtonLink>
      </header>

      <AutoSubmitForm action="/guides" className="mt-6 flex flex-wrap gap-3 rounded-2xl border border-line bg-surface p-3">
        <label htmlFor="guide-destination" className="sr-only">
          Destination
        </label>
        <Select id="guide-destination" name="destination" defaultValue={query.destination ?? ""} className="w-auto min-w-48">
          <option value="">Any destination</option>
          {destinations.map((destination) => (
            <option key={destination.id} value={destination.slug}>
              {destination.name}
            </option>
          ))}
        </Select>
        <label htmlFor="guide-language" className="sr-only">
          Language
        </label>
        <Select id="guide-language" name="language" defaultValue={query.language ?? ""} className="w-auto min-w-40">
          <option value="">Any language</option>
          {languages.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </AutoSubmitForm>

      {!results ? (
        <ErrorState className="mt-8" title="We couldn't load guides" description="Please refresh the page in a moment." />
      ) : (
        <>
          <p className="mt-6 text-sm text-ink-muted">{pluralize(results.meta.total, "guide")}</p>
          <div className="mt-4">
            {results.data.length ? (
              <CardGrid columns={3}>
                {results.data.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </CardGrid>
            ) : (
              <EmptyState
                title={filtered ? "No guides match" : "No guides yet"}
                description={filtered ? "Try another destination or language." : "Local guides are joining soon. Know the area well? Apply to be one."}
                action={filtered ? { href: "/guides", label: "Show all guides" } : { href: "/guide/apply", label: "Become a guide" }}
              />
            )}
          </div>
          <Pagination className="mt-10" meta={results.meta} basePath="/guides" params={{ destination: query.destination, language: query.language }} />
        </>
      )}
    </Container>
  );
}
