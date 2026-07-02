import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/shared/page-shell";
import { ApiError } from "@/lib/api/errors";
import { getDestinationPageData } from "@/services/destination";

function TextSection({ title, children }) {
  if (!children) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <div className="mt-3 leading-7 text-slate-600">{children}</div>
    </section>
  );
}

function ListSection({ title, items, emptyText }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      {items?.length ? (
        <ul className="mt-4 grid gap-3 text-slate-700 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="rounded-lg bg-slate-50 px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 leading-7 text-slate-600">{emptyText}</p>
      )}
    </section>
  );
}

function StaySection({ title, stays }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      {Array.isArray(stays) && stays.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {stays.map((stay) => (
            <div key={stay.name} className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-950">{stay.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{stay.type}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 leading-7 text-slate-600">
          Verified stay recommendations are being curated.
        </p>
      )}
    </section>
  );
}

function EmptyFeature({ title, description }) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white/80 p-6">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
    </section>
  );
}

export async function generateMetadata({ params }) {
  try {
    const { destination } = await getDestinationPageData((await params).slug);

    return {
      title: destination.name,
      description: destination.shortDescription,
    };
  } catch {
    return {
      title: "Destination Not Found",
    };
  }
}

export default async function DestinationDetailPage({ params }) {
  let pageData;
  const { slug } = await params;

  try {
    pageData = await getDestinationPageData(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    return (
      <PageShell
        title="Destination Temporarily Unavailable"
        description="The destination intelligence layer could not load this guide right now."
      >
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-bold text-slate-950">
            Check the database connection.
          </h2>
          <p className="mt-3 leading-7 text-slate-700">
            PostgreSQL must be running and the Prisma migrations must be applied
            before destination guides can load.
          </p>
          <Link
            href="/destinations"
            className="mt-6 inline-flex rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            Back to Destinations
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!pageData?.destination) {
    notFound();
  }

  const { destination, relatedDestinations, nearbyDestinations } = pageData;
  const emergencyContacts = Array.isArray(destination.emergencyContacts)
    ? destination.emergencyContacts
    : [];

  return (
    <PageShell>
      <article>
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="font-semibold uppercase tracking-wider text-sky-700">
              {[destination.district, destination.state].filter(Boolean).join(", ")}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-slate-950 md:text-6xl">
              {destination.name}
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              {destination.fullDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {destination.categories.map((category) => (
                <span key={category} className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800">
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div className="relative min-h-96 overflow-hidden rounded-lg">
            <Image
              src={destination.heroImage}
              alt={destination.name}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            ["Best Time", destination.bestSeason],
            ["Duration", destination.estimatedDuration],
            ["Entry", destination.entryFee],
            ["Hours", destination.openingHours],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{label}</p>
              <p className="mt-2 font-semibold text-slate-950">{value ?? "To be confirmed"}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-950">Gallery</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {destination.galleryImages.map((image) => (
              <div key={image} className="relative h-64 overflow-hidden rounded-lg">
                <Image src={image} alt={`${destination.name} gallery`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <TextSection title="Overview">{destination.description}</TextSection>
          <TextSection title="History">{destination.history}</TextSection>
          <TextSection title="Culture">{destination.culture}</TextSection>
          <TextSection title="Religion">{destination.religion}</TextSection>
          <TextSection title="Language">{destination.language}</TextSection>
          <TextSection title="Food">{destination.food}</TextSection>
          <TextSection title="Transportation">{destination.transportation}</TextSection>
          <TextSection title="Accessibility">{destination.accessibility}</TextSection>
          <TextSection title="Safety">{destination.safetyInfo}</TextSection>
          <ListSection title="Things To Do" items={destination.thingsToDo} emptyText="Experience recommendations are being curated." />
          <ListSection title="Nearby Attractions" items={destination.nearbyAttractions} emptyText="Nearby attractions are being verified." />
          <ListSection title="Hidden Gems" items={destination.hiddenGems} emptyText="Hidden gems will appear after local validation." />
          <StaySection title="Hotels" stays={destination.hotels} />
          <StaySection title="Homestays" stays={destination.homestays} />
          <ListSection title="Emergency" items={emergencyContacts.map((contact) => `${contact.label}: ${contact.value}`)} emptyText="Emergency contacts are being verified." />
          <EmptyFeature title="Weather" description="Live weather integration is planned for the destination intelligence layer." />
          <EmptyFeature title="Reviews" description="Traveler reviews will appear once the review module is connected." />
          <EmptyFeature title="AI Recommendation" description="Personalized recommendations will consider budget, season, companions, interests, safety, and festivals." />
          <EmptyFeature title="Photo Spots" description="Photo spot intelligence is reserved for locally verified viewpoints and responsible travel guidance." />
          <EmptyFeature title="Offline Guide" description="Offline destination packs are planned for low-connectivity travel support." />
        </div>

        {destination.experiences?.length ? (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-950">Experiences</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {destination.experiences.map((experience) => (
                <article key={experience.id} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold text-sky-700">{experience.category}</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-950">{experience.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{experience.description}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {relatedDestinations.length || nearbyDestinations.length ? (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-slate-950">Related Destinations</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[...relatedDestinations, ...nearbyDestinations].slice(0, 3).map((item) => (
                <Link key={item.id} href={`/destinations/${item.slug}`} className="rounded-lg border border-slate-200 bg-white p-5 font-semibold text-slate-950 shadow-sm transition hover:border-sky-300">
                  {item.name}
                  <span className="mt-1 block text-sm font-normal text-slate-600">
                    {[item.district, item.state].filter(Boolean).join(", ")}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </PageShell>
  );
}
