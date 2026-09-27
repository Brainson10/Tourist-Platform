import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CardGrid } from "@/components/cards/card-grid";
import { StoryCard } from "@/components/cards/story-card";
import { AppImage } from "@/components/ui/app-image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isNotFound } from "@/lib/api/errors";
import { getMoreStories, getStoryBySlug } from "@/lib/services/story.service";
import { formatDate, locationLabel, paragraphs, readingMinutes } from "@/lib/utils/format";

const loadStory = cache(async (slug) => {
  try {
    return await getStoryBySlug(slug);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
});

export async function generateMetadata({ params }) {
  const story = await loadStory((await params).slug);
  return story ? { title: story.title, description: story.summary } : { title: "Story not found" };
}

export default async function StoryPage({ params }) {
  const story = await loadStory((await params).slug);

  if (!story) notFound();

  const more = await getMoreStories(story);

  return (
    <article>
      <Container size="narrow" className="pt-10">
        <Link href="/stories" className="text-sm font-medium text-link hover:underline">
          ← All stories
        </Link>
        <p className="mt-6 text-sm font-medium uppercase tracking-wide text-link">{story.destination.name}</p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-5xl">{story.title}</h1>
        {story.excerpt ? <p className="mt-4 font-serif text-xl leading-relaxed text-ink-muted">{story.excerpt}</p> : null}
        <p className="mt-4 text-sm text-ink-muted">
          {[story.authorName ? `By ${story.authorName}` : null, formatDate(story.createdAt), `${readingMinutes(story.content)} min read`].filter(Boolean).join(" · ")}
        </p>
      </Container>

      <Container className="mt-8">
        <div className="relative aspect-[21/9] overflow-hidden rounded-xl bg-surface-muted">
          <AppImage src={story.image} alt={story.title} fallbackLabel={story.destination.name} priority sizes="(min-width: 1152px) 1100px, 100vw" />
        </div>
      </Container>

      <Container size="narrow" className="py-10">
        <div className="space-y-5 font-serif text-lg leading-8 text-ink">
          {paragraphs(story.content).map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>

        <aside className="mt-12 flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 sm:flex-row sm:items-center">
          <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:w-28">
            <AppImage src={story.destination.coverImage} alt={story.destination.name} fallbackLabel={story.destination.name} sizes="112px" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Visit the place</p>
            <p className="font-semibold text-ink">{story.destination.name}</p>
            <p className="text-sm text-ink-muted">{locationLabel(story.destination.village)}</p>
          </div>
          <ButtonLink href={`/destinations/${story.destination.slug}`} variant="secondary">
            Explore destination
          </ButtonLink>
        </aside>
      </Container>

      {more.length ? (
        <Container className="border-t border-line py-10">
          <h2 className="text-xl font-semibold tracking-tight text-ink">More stories</h2>
          <CardGrid columns={3} className="mt-5">
            {more.map((item) => (
              <StoryCard key={item.id} story={item} />
            ))}
          </CardGrid>
        </Container>
      ) : null}
    </article>
  );
}
