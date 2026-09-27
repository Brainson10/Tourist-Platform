import { CardGrid } from "@/components/cards/card-grid";
import { StoryCard } from "@/components/cards/story-card";
import { Container } from "@/components/ui/container";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { listStories } from "@/lib/services/story.service";
import { parseSearchParams } from "@/lib/utils/search-params";
import { storyQuerySchema } from "@/lib/validators/content";

export const metadata = {
  title: "Travel stories",
  description: "Local voices, history and culture from the places you'll visit.",
};

export default async function StoriesPage({ searchParams }) {
  const query = parseSearchParams(storyQuerySchema, await searchParams);
  let results = null;

  try {
    results = await listStories({ ...query, limit: 9 });
  } catch (error) {
    console.error("[stories] failed to load", error);
  }

  return (
    <Container className="py-10">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Travel stories</h1>
        <p className="mt-2 text-ink-muted">The people, history and traditions behind the places — worth a read before you go.</p>
      </header>
      {!results ? (
        <ErrorState className="mt-8" title="We couldn't load stories" description="Please refresh the page in a moment." />
      ) : results.data.length ? (
        <>
          <CardGrid columns={3} className="mt-8">
            {results.data.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </CardGrid>
          <Pagination className="mt-10" meta={results.meta} basePath="/stories" params={{}} />
        </>
      ) : (
        <EmptyState className="mt-8" title="No stories yet" description="Stories from local writers and guides are coming soon." />
      )}
    </Container>
  );
}
