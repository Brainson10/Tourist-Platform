import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CardGrid } from "@/components/cards/card-grid";
import { ExperienceCard } from "@/components/cards/experience-card";
import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isNotFound } from "@/lib/api/errors";
import { getExperience, getRelatedExperiences } from "@/lib/services/experience.service";
import { formatPrice, locationLabel, paragraphs, titleCase } from "@/lib/utils/format";

const loadExperience = cache(async (id) => {
  try {
    return await getExperience(id);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
});

export async function generateMetadata({ params }) {
  const experience = await loadExperience((await params).id);
  return experience ? { title: experience.title, description: experience.description.slice(0, 160) } : { title: "Experience not found" };
}

export default async function ExperiencePage({ params }) {
  const experience = await loadExperience((await params).id);

  if (!experience) notFound();

  const related = await getRelatedExperiences(experience);
  const price = formatPrice(experience.price);
  const facts = [
    ["Duration", experience.duration],
    ["Difficulty", experience.difficulty],
    ["Price", price ? (price === "Free" ? "Free" : `From ${price} per person`) : null],
    ["Type", titleCase(experience.category)],
  ].filter(([, value]) => value);

  return (
    <Container className="py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <Link href="/experiences" className="hover:text-ink">
          Experiences
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">{experience.title}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-surface-muted">
            <AppImage src={experience.image} alt={experience.title} fallbackLabel={experience.title} priority sizes="(min-width: 1024px) 800px, 100vw" />
          </div>
          <Badge tone="brand" className="mt-6">
            {titleCase(experience.category)}
          </Badge>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{experience.title}</h1>
          <p className="mt-2 text-ink-muted">
            <Link href={`/destinations/${experience.destination.slug}`} className="font-medium text-link hover:underline">
              {experience.destination.name}
            </Link>
            {" · "}
            {locationLabel(experience.destination.village)}
          </p>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-muted">
            {paragraphs(experience.description).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="font-semibold text-ink">At a glance</h2>
            <dl className="mt-3 space-y-3">
              {facts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-ink-muted">{label}</dt>
                  <dd className="text-right font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-ink-muted">Prices are indicative. Confirm timings and rates with the local operator.</p>
            <ButtonLink href={`/trips/new?destination=${experience.destination.id}`} className="mt-4 w-full">
              Add to a trip
            </ButtonLink>
            <ButtonLink href={`/destinations/${experience.destination.slug}`} variant="secondary" className="mt-2 w-full">
              About {experience.destination.name}
            </ButtonLink>
          </div>
        </aside>
      </div>

      {related.length ? (
        <section className="mt-14 border-t border-line pt-10" aria-labelledby="related-experiences">
          <h2 id="related-experiences" className="text-xl font-semibold tracking-tight text-ink">
            Similar experiences
          </h2>
          <CardGrid className="mt-5">
            {related.map((item) => (
              <ExperienceCard key={item.id} experience={item} />
            ))}
          </CardGrid>
        </section>
      ) : null}
    </Container>
  );
}
