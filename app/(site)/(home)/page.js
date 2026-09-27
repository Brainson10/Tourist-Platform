import { CalendarDays } from "lucide-react";
import { CardGrid } from "@/components/cards/card-grid";
import { DestinationCard } from "@/components/cards/destination-card";
import { ExperienceCard } from "@/components/cards/experience-card";
import { FeatureDestinationCard } from "@/components/cards/feature-destination-card";
import { GuideCard } from "@/components/cards/guide-card";
import { FestivalTimeline } from "@/components/home/festival-timeline";
import { HeroSearch } from "@/components/home/hero-search";
import { MoodTiles } from "@/components/home/mood-tiles";
import { ReviewHighlights } from "@/components/home/review-highlights";
import { SearchCombobox } from "@/components/search/search-combobox";
import { StoriesBlock } from "@/components/home/stories-block";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/states";
import { WeaveBorder, WeaveDivider } from "@/components/ui/weave";
import { getHomePageData } from "@/lib/services/home.service";
import { MONTH_NAMES } from "@/lib/utils/months";

export const dynamic = "force-dynamic";

function Section({ children, tinted = false, className = "" }) {
  return <section className={`${tinted ? "bg-surface" : ""} py-14 sm:py-16 ${className}`}>{children}</section>;
}

export default async function HomePage() {
  const data = await getHomePageData();
  const [lead, ...others] = data.popular;

  return (
    <>
      <HeroSearch
        stateCounts={data.stateCounts}
        totalDestinations={data.totalDestinations}
        searchSlot={<SearchCombobox variant="hero" placeholder="Try “Loktak”, “monastery” or “Meghalaya”" />}
      />

      {data.bestNow.length ? (
        <Section>
          <Container>
            <SectionHeader
              title={`Best in ${MONTH_NAMES[data.month - 1]}`}
              description="Places at their finest right now — good weather, open trails, the right season."
              action={{ href: "/destinations?sort=rating", label: "More places" }}
            />
            <CardGrid className="mt-6">
              {data.bestNow.map((destination, index) => (
                <DestinationCard key={destination.id} destination={destination} priority={index < 4} />
              ))}
            </CardGrid>
          </Container>
        </Section>
      ) : null}

      <Section tinted={data.bestNow.length > 0}>
        <Container>
          <SectionHeader
            title="Popular destinations"
            description="Places travelers keep coming back to."
            action={data.popular.length ? { href: "/destinations", label: "See all destinations" } : null}
          />
          <div className="mt-6">
            {lead ? (
              <div className="grid gap-5 lg:grid-cols-2">
                <FeatureDestinationCard destination={lead} priority={!data.bestNow.length} />
                {others.length ? (
                  <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2">
                    {others.slice(0, 4).map((destination) => (
                      <DestinationCard key={destination.id} destination={destination} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyState title="Destinations are on their way" description="We're adding the first places to explore. Check back soon." />
            )}
          </div>
        </Container>
      </Section>

      {data.categories.length ? (
        <Section tinted={!data.bestNow.length}>
          <Container>
            <SectionHeader title="What are you in the mood for?" description="Wildlife, monasteries, food trails, misty treks…" />
            <div className="mt-6">
              <MoodTiles categories={data.categories} />
            </div>
          </Container>
        </Section>
      ) : null}

      {data.festivals.length ? (
        <Section>
          <Container>
            <SectionHeader title="Festival calendar" description="Plan your dates around a celebration." action={{ href: "/festivals", label: "All festivals" }} />
            <div className="mt-6">
              <FestivalTimeline festivals={data.festivals} />
            </div>
          </Container>
        </Section>
      ) : null}

      {data.experiences.length ? (
        <Section tinted>
          <Container>
            <SectionHeader title="Things to do" description="Walks, safaris, food tours and more, led by locals." action={{ href: "/experiences", label: "All experiences" }} />
            <CardGrid className="mt-6">
              {data.experiences.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </CardGrid>
          </Container>
        </Section>
      ) : null}

      {data.stories.length ? (
        <Section>
          <Container>
            <SectionHeader title="Stories from the hills" description="Local voices and the history behind each place." action={{ href: "/stories", label: "Read more stories" }} />
            <div className="mt-6">
              <StoriesBlock stories={data.stories} />
            </div>
          </Container>
        </Section>
      ) : null}

      {data.guides.length ? (
        <Section>
          <Container>
            <SectionHeader title="Travel with a local" description="Guides who grew up here, reviewed by our team." action={{ href: "/guides", label: "All guides" }} />
            <CardGrid columns={3} className="mt-6">
              {data.guides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </CardGrid>
          </Container>
        </Section>
      ) : null}

      {data.hiddenGems.length ? (
        <Section tinted>
          <Container>
            <SectionHeader title="Worth the detour" description="Well-loved by travelers, a little off the usual route." />
            <CardGrid className="mt-6">
              {data.hiddenGems.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </CardGrid>
          </Container>
        </Section>
      ) : null}

      {data.reviews.length ? (
        <Section>
          <Container>
            <SectionHeader title="What travelers say" />
            <div className="mt-6">
              <ReviewHighlights reviews={data.reviews} />
            </div>
          </Container>
        </Section>
      ) : null}

      <Section>
        <Container>
          <WeaveDivider className="mb-10" />
          <div className="relative overflow-hidden rounded-3xl bg-brand-800 text-white">
            <WeaveBorder variant="temple" height={12} className="opacity-90" />
            <div className="flex flex-col items-start justify-between gap-6 px-6 py-10 sm:px-10 md:flex-row md:items-center">
              <div className="max-w-xl">
                <CalendarDays aria-hidden="true" className="h-8 w-8 text-marigold-400" />
                <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Turn ideas into a day-by-day plan</h2>
                <p className="mt-2 text-white/80">Pick a destination and dates. We&apos;ll start your itinerary with the best things to do there — then make it yours.</p>
              </div>
              <ButtonLink href="/trips/new" variant="accent" size="lg">
                Plan a trip
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
