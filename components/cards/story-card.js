import Link from "next/link";
import { AppImage } from "@/components/ui/app-image";
import { formatDate, readingMinutes } from "@/lib/utils/format";

export function StoryCard({ story }) {
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-surface-muted">
        <AppImage
          src={story.image}
          alt={story.title}
          fallbackLabel={story.destination?.name}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-link">{story.destination?.name}</p>
      <h3 className="mt-1 text-lg font-semibold leading-snug text-ink">
        <Link href={`/stories/${story.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {story.title}
        </Link>
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{story.summary}</p>
      <p className="mt-2 text-xs text-ink-muted">
        {formatDate(story.createdAt)} · {readingMinutes(story.content)} min read
      </p>
    </article>
  );
}
