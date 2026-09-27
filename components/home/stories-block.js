import Link from "next/link";
import { AppImage } from "@/components/ui/app-image";
import { formatDate, readingMinutes } from "@/lib/utils/format";

/** Magazine layout: one lead story, the rest as a compact list. */
export function StoriesBlock({ stories }) {
  const [lead, ...rest] = stories;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <article className="group relative">
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-surface-muted">
          <AppImage src={lead.image} alt={lead.title} fallbackLabel={lead.destination?.name} sizes="(min-width: 1024px) 55vw, 100vw" className="transition-transform duration-700 group-hover:scale-[1.03]" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">{lead.destination?.name}</p>
        <h3 className="mt-1 font-display text-2xl font-semibold leading-snug text-ink sm:text-3xl">
          <Link href={`/stories/${lead.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {lead.title}
          </Link>
        </h3>
        <p className="mt-2 max-w-2xl font-serif text-lg leading-relaxed text-ink-muted">{lead.summary}</p>
        <p className="mt-2 text-xs text-ink-subtle">
          {formatDate(lead.createdAt)} · {readingMinutes(lead.content)} min read
        </p>
      </article>
      {rest.length ? (
        <ul className="divide-y divide-line self-start border-y border-line">
          {rest.map((story) => (
            <li key={story.id} className="group relative flex gap-4 py-4">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                <AppImage src={story.image} alt="" sizes="96px" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">{story.destination?.name}</p>
                <h4 className="font-display text-lg font-semibold leading-snug text-ink">
                  <Link href={`/stories/${story.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                    {story.title}
                  </Link>
                </h4>
                <p className="line-clamp-1 text-sm text-ink-muted">{story.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
