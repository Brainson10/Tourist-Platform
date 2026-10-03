import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, ShieldAlert, ShieldCheck, Sun, Ticket } from "lucide-react";
import { cache, Suspense } from "react";
import { CardGrid } from "@/components/cards/card-grid";
import { DestinationCard } from "@/components/cards/destination-card";
import { ExperienceCard } from "@/components/cards/experience-card";
import { FestivalCard } from "@/components/cards/festival-card";
import { GuideCard } from "@/components/cards/guide-card";
import { StoryCard } from "@/components/cards/story-card";
import { BestTimeCalendar } from "@/components/destination/best-time-calendar";
import { Gallery } from "@/components/destination/gallery";
import { NearbyPlaces } from "@/components/destination/nearby-places";
import { PermitCallout } from "@/components/destination/permit-callout";
import { RatingSummary } from "@/components/destination/rating-summary";
import { ReviewsPanel } from "@/components/destination/reviews-panel";
import { SaveButton } from "@/components/destination/save-button";
import { ShareButton } from "@/components/destination/share-button";
import { WeatherCard, WeatherCardSkeleton, WeatherNow } from "@/components/destination/weather-card";
import { DestinationSouvenirs } from "@/components/souvenirs/destination-souvenirs";
import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { RatingLabel } from "@/components/ui/rating";
import { WeaveBorder } from "@/components/ui/weave";
import { isNotFound } from "@/lib/api/errors";
import { getCurrentUser } from "@/lib/auth/session";
import { getDestinationBySlug, getNearbyDestinations, getRelatedDestinations } from "@/lib/services/destination.service";
import { listGuidesForDestination } from "@/lib/services/guide.service";
import { getPermitForState } from "@/lib/services/permit.service";
import { getReviewSection } from "@/lib/services/review.service";
import { isSaved } from "@/lib/services/saved.service";
import { getSettings } from "@/lib/services/settings.service";
import { getDestinationSouvenirs } from "@/lib/services/souvenir.service";
import { locationLabel, paragraphs } from "@/lib/utils/format";
import { directionsUrl, largerMapUrl } from "@/lib/utils/geo";
import { formatMonthSpans } from "@/lib/utils/months";

const loadDestination = cache(async (slug) => {
  try {
    return await getDestinationBySlug(slug);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
});

export async function generateMetadata({ params }) {
  const destination = await loadDestination((await params).slug);

  if (!destination) return { title: "Destination not found" };

  return {
    title: `${destination.name}, ${destination.village.state}`,
    description: destination.shortDescription,
    openGraph: destination.image ? { images: [destination.image] } : undefined,
  };
}

function Section({ id, title, children, description }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-40 border-t border-line py-10 first:border-t-0 first:pt-0">
      <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {title}
      </h2>
      {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Prose({ text }) {
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-ink-muted">
      {paragraphs(text).map((paragraph) => (
        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
      ))}
    </div>
  );
}

function Expandable({ title, text, defaultOpen = false }) {
  return (
    <details open={defaultOpen} className="group border-b border-line py-4 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
        {title}
        <span aria-hidden="true" className="text-ink-subtle transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="mt-3">
        <Prose text={text} />
      </div>
    </details>
  );
}

function StayList({ title, stays }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">{title}</h3>
      <ul className="mt-3 space-y-3">
        {stays.map((stay) => (
          <li key={stay.name} className="rounded-lg border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-ink">{stay.name}</p>
              {stay.type ? <Badge>{stay.type}</Badge> : null}
            </div>
            {stay.address ? <p className="mt-1 text-sm text-ink-muted">{stay.address}</p> : null}
            {stay.note ? <p className="mt-1 text-sm text-ink-muted">{stay.note}</p> : null}
            {stay.contact ? <p className="mt-1 text-sm font-medium text-ink">{stay.contact}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BulletList({ items, columns = false }) {
  return (
    <ul className={columns ? "grid gap-x-8 gap-y-2 sm:grid-cols-2" : "space-y-2"}>
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-[15px] text-ink-muted">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function DestinationPage({ params }) {
  const { slug } = await params;
  const destination = await loadDestination(slug);

  if (!destination) notFound();

  const user = await getCurrentUser();
  const [reviewSection, related, nearbyDestinations, saved, settings, permit, guides, souvenirs] = await Promise.all([
    getReviewSection(destination.id, user?.id),
    getRelatedDestinations(destination, 7),
    getNearbyDestinations({ latitude: destination.latitude, longitude: destination.longitude, radiusKm: 60, limit: 4, excludeId: destination.id }),
    isSaved(user?.id, destination.id),
    getSettings(),
    getPermitForState(destination.village.state),
    listGuidesForDestination(destination.id, 3).catch(() => []),
    getDestinationSouvenirs(destination, 6).catch((error) => {
      console.error("[destination] souvenirs failed to load", error);
      return null;
    }),
  ]);

  const returnTo = `/destinations/${destination.slug}`;
  const nearbyShown = nearbyDestinations.slice(0, 3);
  const nearbyIds = new Set(nearbyShown.map((item) => item.id));
  const alsoLike = related.filter((item) => !nearbyIds.has(item.id));
  const cultureTopics = [
    ["History", destination.history],
    ["Culture", destination.culture],
    ["Religion & beliefs", destination.religion],
    ["Traditions & etiquette", destination.traditions],
    ["Language", destination.language],
  ].filter(([, text]) => text);
  const hasThingsToDo = destination.thingsToDo.length || destination.experiences.length;
  const hasFoodOrStay = destination.food || destination.hotels.length || destination.homestays.length;
  const bestTime = formatMonthSpans(destination.bestMonths) || destination.bestSeason;
  const hasWhenToGo = destination.bestMonths.length || destination.festivals.some((festival) => festival.startDate);
  const quickFacts = [
    ["Time needed", destination.estimatedDuration],
    ["Opening hours", destination.openingHours],
    ["Entry fee", destination.entryFee],
  ].filter(([, value]) => value);
  const emergencyContacts = destination.emergencyContacts.length
    ? destination.emergencyContacts
    : [{ label: "Emergency (police, fire, ambulance)", value: settings.emergencyNumber }];

  const nav = [
    ["overview", "Overview"],
    ["when", "When to go"],
    hasThingsToDo && ["things-to-do", "Things to do"],
    hasFoodOrStay && ["food-stay", "Food & stay"],
    cultureTopics.length && ["culture", "Culture"],
    destination.festivals.length && ["festivals", "Festivals"],
    ["souvenirs", "Souvenirs"],
    guides.length && ["guides", "Guides"],
    ["safety", "Safety"],
    ["nearby", "Nearby & map"],
    ["reviews", "Reviews"],
  ].filter(Boolean);

  return (
    <article>
      <header className="relative isolate flex min-h-[26rem] items-end overflow-hidden bg-night sm:min-h-[32rem]">
        <AppImage src={destination.image} alt={destination.name} fallbackLabel={destination.name} priority sizes="100vw" className="-z-10" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <Container className="pb-16 pt-24 text-white sm:pb-20">
          <nav aria-label="Breadcrumb" className="text-sm text-white/75">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/destinations" className="hover:text-white">
                  Destinations
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/destinations?state=${encodeURIComponent(destination.village.state)}`} className="hover:text-white">
                  {destination.village.state}
                </Link>
              </li>
            </ol>
          </nav>
          <h1 className="mt-3 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] sm:text-6xl">{destination.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/85">
            <span>{locationLabel(destination.village, { includeVillage: true })}</span>
            {destination.reviewCount ? (
              <a href="#reviews" className="hover:underline [&_span]:text-white">
                <RatingLabel average={destination.ratingAverage} count={destination.reviewCount} />
              </a>
            ) : null}
            {destination.categories.map((category) => (
              <Link key={category.id} href={`/destinations?category=${category.slug}`}>
                <Badge tone="overlay">{category.name}</Badge>
              </Link>
            ))}
          </div>
        </Container>
      </header>
      <WeaveBorder height={12} />

      <Container className="relative z-10 -mt-12">
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-lg shadow-black/5 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4 lg:flex lg:flex-wrap lg:gap-x-8">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-subtle">
                  <Sun aria-hidden="true" className="h-3.5 w-3.5" /> Right now
                </dt>
                <dd className="mt-0.5 font-medium text-ink">
                  <Suspense fallback={<span className="text-ink-subtle">Loading…</span>}>
                    <WeatherNow latitude={destination.latitude} longitude={destination.longitude} />
                  </Suspense>
                </dd>
              </div>
              {bestTime ? (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-subtle">
                    <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" /> Best time
                  </dt>
                  <dd className="mt-0.5 font-medium text-ink">
                    <a href="#when" className="hover:underline">
                      {bestTime}
                    </a>
                  </dd>
                </div>
              ) : null}
              {destination.estimatedDuration ? (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-subtle">
                    <Clock aria-hidden="true" className="h-3.5 w-3.5" /> Time needed
                  </dt>
                  <dd className="mt-0.5 font-medium text-ink">{destination.estimatedDuration}</dd>
                </div>
              ) : null}
              {permit ? (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-subtle">
                    {permit.required ? <ShieldAlert aria-hidden="true" className="h-3.5 w-3.5" /> : <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />} Entry permit
                  </dt>
                  <dd className="mt-0.5 font-medium">
                    <a href="#safety" className={permit.required ? "text-accent-ink hover:underline" : "text-ink hover:underline"}>
                      {permit.required ? `${permit.permitName?.replace(/\s*\(.*\)/, "") ?? "Permit"} required` : "Not needed"}
                    </a>
                  </dd>
                </div>
              ) : destination.entryFee ? (
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-subtle">
                    <Ticket aria-hidden="true" className="h-3.5 w-3.5" /> Entry
                  </dt>
                  <dd className="mt-0.5 line-clamp-1 font-medium text-ink">{destination.entryFee}</dd>
                </div>
              ) : null}
            </dl>
            <div className="flex flex-wrap gap-2">
              <SaveButton destinationId={destination.id} initialSaved={saved} signedIn={Boolean(user)} returnTo={returnTo} />
              <ShareButton title={destination.name} text={destination.shortDescription} />
              <ButtonLink href={`/trips/new?destination=${destination.id}`}>Plan a trip</ButtonLink>
            </div>
          </div>
        </div>
      </Container>

      <nav aria-label="On this page" className="sticky top-[71px] z-30 mt-8 border-y border-line bg-surface/95 backdrop-blur">
        <Container>
          <ul className="relative scrollbar-none -mx-1 flex gap-1 overflow-x-auto py-2">
            {nav.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="block whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      <Container className="py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <Section id="overview" title="Overview">
              <p className="text-lg leading-relaxed text-ink">{destination.shortDescription}</p>
              {destination.description && destination.description !== destination.shortDescription ? (
                <div className="mt-4">
                  <Prose text={destination.description} />
                </div>
              ) : null}
              {destination.gallery.length > 1 ? (
                <div className="mt-8">
                  <Gallery name={destination.name} photos={destination.gallery} />
                </div>
              ) : null}
              {destination.hiddenGems.length ? (
                <div className="mt-6 rounded-xl bg-brand-soft p-5">
                  <h3 className="font-semibold text-brand-strong">Hidden gems locals recommend</h3>
                  <div className="mt-3">
                    <BulletList items={destination.hiddenGems} />
                  </div>
                </div>
              ) : null}
            </Section>

            <Section id="when" title="When to go" description="Best months, festivals and the forecast for the week ahead.">
              <div className="space-y-4">
                {hasWhenToGo ? (
                  <BestTimeCalendar title={null} bestMonths={destination.bestMonths} festivals={destination.festivals} bestSeasonText={destination.bestSeason} />
                ) : destination.bestSeason ? (
                  <p className="text-[15px] text-ink-muted">Best time to visit: {destination.bestSeason}</p>
                ) : null}
                <Suspense fallback={<WeatherCardSkeleton />}>
                  <WeatherCard latitude={destination.latitude} longitude={destination.longitude} name={destination.name} />
                </Suspense>
              </div>
            </Section>

            {hasThingsToDo ? (
              <Section id="things-to-do" title="Things to do">
                {destination.thingsToDo.length ? <BulletList items={destination.thingsToDo} columns /> : null}
                {destination.experiences.length ? (
                  <div className={destination.thingsToDo.length ? "mt-8" : ""}>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Guided experiences</h3>
                    <CardGrid columns={3} className="mt-4">
                      {destination.experiences.slice(0, 6).map((experience) => (
                        <ExperienceCard key={experience.id} experience={{ ...experience, image: experience.imageUrl ?? destination.image }} showDestination={false} />
                      ))}
                    </CardGrid>
                  </div>
                ) : null}
              </Section>
            ) : null}

            {hasFoodOrStay ? (
              <Section id="food-stay" title="Food & where to stay">
                {destination.food ? (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">What to eat</h3>
                    <div className="mt-3">
                      <Prose text={destination.food} />
                    </div>
                  </div>
                ) : null}
                {destination.hotels.length || destination.homestays.length ? (
                  <div className={`grid gap-6 md:grid-cols-2 ${destination.food ? "mt-8" : ""}`}>
                    {destination.hotels.length ? <StayList title="Hotels" stays={destination.hotels} /> : null}
                    {destination.homestays.length ? <StayList title="Homestays" stays={destination.homestays} /> : null}
                  </div>
                ) : null}
              </Section>
            ) : null}

            {cultureTopics.length ? (
              <Section id="culture" title="Culture & history">
                <div className="rounded-xl border border-line bg-surface px-5">
                  {cultureTopics.map(([title, text], index) => (
                    <Expandable key={title} title={title} text={text} defaultOpen={index === 0} />
                  ))}
                </div>
              </Section>
            ) : null}

            {destination.festivals.length ? (
              <Section id="festivals" title="Festivals & events">
                <CardGrid columns={3}>
                  {destination.festivals.map((festival) => (
                    <FestivalCard key={festival.id} festival={{ ...festival, image: festival.imageUrl ?? destination.image }} />
                  ))}
                </CardGrid>
              </Section>
            ) : null}

            <Section id="souvenirs" title="Take Home a Memory" description={`Take something special home from ${destination.village.state}.`}>
              <DestinationSouvenirs destination={destination} souvenirs={souvenirs} />
            </Section>

            {guides.length ? (
              <Section id="guides" title="Local guides" description="People who grew up here and can show you around.">
                <CardGrid columns={3}>
                  {guides.map((guide) => (
                    <GuideCard key={guide.id} guide={guide} />
                  ))}
                </CardGrid>
              </Section>
            ) : null}

            <Section id="safety" title="Permits, getting there & staying safe">
              <div className="space-y-6">
                <PermitCallout permit={permit} state={destination.village.state} />
                {destination.transportation ? (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Getting there</h3>
                    <div className="mt-2">
                      <Prose text={destination.transportation} />
                    </div>
                  </div>
                ) : null}
                {destination.accessibility ? (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Accessibility</h3>
                    <div className="mt-2">
                      <Prose text={destination.accessibility} />
                    </div>
                  </div>
                ) : null}
                <div className="rounded-xl border border-warn-line bg-warn-soft p-5">
                  <h3 className="font-semibold text-warn-ink">Before you go</h3>
                  <div className="mt-2 text-warn-ink">
                    {destination.safetyInfo ? (
                      <Prose text={destination.safetyInfo} />
                    ) : (
                      <p className="text-[15px] leading-relaxed">Check the weather and road conditions before setting out, share your plans with someone, and keep your phone charged.</p>
                    )}
                  </div>
                </div>
              </div>
            </Section>

            <Section id="nearby" title="Nearby & map" description="Hospitals, food, stays, transport and cash points around this destination.">
              <NearbyPlaces
                destinationId={destination.id}
                destination={{ name: destination.name, latitude: destination.latitude, longitude: destination.longitude }}
              />
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <a href={directionsUrl(destination)} target="_blank" rel="noopener noreferrer" className="font-medium text-link hover:underline">
                  Get directions<span className="sr-only"> (opens in a new tab)</span>
                </a>
                <a href={largerMapUrl(destination)} target="_blank" rel="noopener noreferrer" className="font-medium text-link hover:underline">
                  Open in OpenStreetMap<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>

              {destination.nearbyAttractions.length ? (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Worth combining with your visit</h3>
                  <div className="mt-3">
                    <BulletList items={destination.nearbyAttractions} columns />
                  </div>
                </div>
              ) : null}

              {nearbyShown.length ? (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Other destinations close by</h3>
                  <CardGrid columns={3} className="mt-4">
                    {nearbyShown.map((item) => (
                      <DestinationCard key={item.id} destination={item} />
                    ))}
                  </CardGrid>
                </div>
              ) : null}
            </Section>

            <Section id="reviews" title="Traveler reviews">
              <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
                <RatingSummary summary={reviewSection.summary} />
                <ReviewsPanel
                  key={`${reviewSection.userReview?.updatedAt ?? "none"}-${reviewSection.summary.count}`}
                  destinationId={destination.id}
                  initial={reviewSection}
                  signedIn={Boolean(user)}
                  returnTo={`${returnTo}#reviews`}
                />
              </div>
            </Section>

            {destination.stories.length ? (
              <Section id="stories" title="Stories from here">
                <CardGrid columns={3}>
                  {destination.stories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={{ ...story, destination: { name: destination.name }, image: story.coverImage ?? destination.image, summary: story.excerpt ?? story.content.slice(0, 160) }}
                    />
                  ))}
                </CardGrid>
              </Section>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
            {quickFacts.length ? (
              <div className="rounded-xl border border-line bg-surface p-5">
                <h2 className="font-semibold text-ink">Good to know</h2>
                <dl className="mt-3 space-y-3">
                  {quickFacts.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</dt>
                      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="font-semibold text-ink">Emergency contacts</h2>
              <ul className="mt-3 space-y-2">
                {emergencyContacts.map((contact) => (
                  <li key={`${contact.label}-${contact.value}`} className="text-sm">
                    <span className="text-ink-muted">{contact.label}: </span>
                    {/^[+\d\s()-]{3,}$/.test(contact.value) ? (
                      <a href={`tel:${contact.value.replace(/[^\d+]/g, "")}`} className="font-semibold text-ink hover:underline">
                        {contact.value}
                      </a>
                    ) : (
                      <span className="font-semibold text-ink">{contact.value}</span>
                    )}
                    {contact.note ? <span className="block text-xs text-ink-muted">{contact.note}</span> : null}
                  </li>
                ))}
                {settings.touristHelpline ? (
                  <li className="text-sm">
                    <span className="text-ink-muted">Tourist helpline: </span>
                    <a href={`tel:${settings.touristHelpline}`} className="font-semibold text-ink hover:underline">
                      {settings.touristHelpline}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>

            <div className="rounded-xl bg-brand-800 p-5 text-white">
              <h2 className="font-semibold">Planning a visit?</h2>
              <p className="mt-1 text-sm text-white/80">Start a trip with {destination.name}&apos;s top things to do already in your itinerary.</p>
              <ButtonLink href={`/trips/new?destination=${destination.id}`} variant="inverse" className="mt-4 w-full">
                Plan a trip here
              </ButtonLink>
            </div>
          </aside>
        </div>

        {alsoLike.length ? (
          <section aria-labelledby="related-title" className="mt-6 border-t border-line pt-10">
            <h2 id="related-title" className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              You might also like
            </h2>
            <CardGrid className="mt-5">
              {alsoLike.slice(0, 4).map((item) => (
                <DestinationCard key={item.id} destination={item} reason={item.reason} />
              ))}
            </CardGrid>
          </section>
        ) : null}
      </Container>
    </article>
  );
}
