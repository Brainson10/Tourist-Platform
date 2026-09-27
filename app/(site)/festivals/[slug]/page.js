import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isNotFound } from "@/lib/api/errors";
import { getFestivalBySlug } from "@/lib/services/festival.service";
import { daysUntil, formatDateRange, locationLabel, paragraphs, pluralize, titleCase } from "@/lib/utils/format";

const loadFestival = cache(async (slug) => {
  try {
    return await getFestivalBySlug(slug);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
});

export async function generateMetadata({ params }) {
  const festival = await loadFestival((await params).slug);
  return festival ? { title: festival.title, description: festival.description.slice(0, 160) } : { title: "Festival not found" };
}

function countdown(festival) {
  const startsIn = daysUntil(festival.startDate);
  const endsIn = daysUntil(festival.endDate ?? festival.startDate);

  if (startsIn === null) return null;
  if (startsIn > 0) return `Starts in ${pluralize(startsIn, "day")}`;
  if (endsIn !== null && endsIn >= 0) return "Happening now";
  return "This festival has ended for the year";
}

export default async function FestivalPage({ params }) {
  const festival = await loadFestival((await params).slug);

  if (!festival) notFound();

  const status = countdown(festival);

  return (
    <article>
      <div className="relative isolate h-72 overflow-hidden bg-brand-900 sm:h-96">
        <AppImage src={festival.image} alt={festival.title} fallbackLabel={festival.title} priority sizes="100vw" className="-z-10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <Container className="flex h-full flex-col justify-end pb-8">
          <Badge tone="overlay" className="w-fit">
            {titleCase(festival.category)}
          </Badge>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-5xl">{festival.title}</h1>
        </Container>
      </div>

      <Container className="py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <div className="space-y-4 text-[15px] leading-relaxed text-ink-muted">
              {paragraphs(festival.description).map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
            {festival.significance ? (
              <section aria-labelledby="significance">
                <h2 id="significance" className="text-xl font-semibold text-ink">
                  Why it matters
                </h2>
                <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-muted">
                  {paragraphs(festival.significance).map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="font-semibold text-ink">When & where</h2>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-ink-muted">Dates</dt>
                  <dd className="font-medium text-ink">{formatDateRange(festival.startDate, festival.endDate)}</dd>
                  {status ? <dd className="mt-0.5 text-link">{status}</dd> : null}
                </div>
                <div>
                  <dt className="text-ink-muted">Place</dt>
                  <dd className="font-medium text-ink">
                    <Link href={`/destinations/${festival.destination.slug}`} className="text-link hover:underline">
                      {festival.destination.name}
                    </Link>
                  </dd>
                  <dd className="text-ink-muted">{locationLabel(festival.destination.village)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-ink-muted">Dates for traditional festivals can shift with the lunar calendar. Confirm locally before you book travel.</p>
              <ButtonLink href={`/trips/new?destination=${festival.destination.id}`} className="mt-4 w-full">
                Plan a trip for this
              </ButtonLink>
            </div>
          </aside>
        </div>
      </Container>
    </article>
  );
}
