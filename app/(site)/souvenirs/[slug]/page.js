import { AlertCircle, Luggage, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CardGrid } from "@/components/cards/card-grid";
import { SouvenirCard } from "@/components/cards/souvenir-card";
import { Gallery } from "@/components/destination/gallery";
import { MapPanel } from "@/components/maps/map";
import { SellerList } from "@/components/souvenirs/seller-list";
import { SouvenirArt } from "@/components/souvenirs/souvenir-art";
import { SouvenirIcon } from "@/components/souvenirs/souvenir-icon";
import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isNotFound } from "@/lib/api/errors";
import { AUDIENCES, AVAILABILITY, INTERESTS, QUALITIES, SELLER_KINDS, labelOf } from "@/lib/constants/souvenirs";
import { getRelatedSouvenirs, getSouvenir } from "@/lib/services/souvenir.service";
import { formatPriceRange, paragraphs } from "@/lib/utils/format";
import { withQuery } from "@/lib/utils/query-string";

const loadSouvenir = cache(async (slug) => {
  try {
    return await getSouvenir(slug);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
});

export async function generateMetadata({ params }) {
  const souvenir = await loadSouvenir((await params).slug);
  if (!souvenir) return { title: "Local treasure not found" };

  return {
    title: `${souvenir.name}${souvenir.states[0] ? ` · ${souvenir.states[0]}` : ""}`,
    description: souvenir.shortDescription,
    openGraph: souvenir.image ? { images: [souvenir.image] } : undefined,
  };
}

function StorySection({ id, title, icon, children }) {
  return (
    <section aria-labelledby={`${id}-title`} className="border-t border-line py-8 first:border-t-0 first:pt-0">
      <h2 id={`${id}-title`} className="flex items-center gap-2 font-display text-xl font-semibold text-ink sm:text-2xl">
        {icon}
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}

const prose = (text) => paragraphs(text).map((paragraph) => <p key={paragraph.slice(0, 40)}>{paragraph}</p>);

export default async function SouvenirPage({ params }) {
  const souvenir = await loadSouvenir((await params).slug);
  if (!souvenir) notFound();

  const related = await getRelatedSouvenirs(souvenir, 4).catch((error) => {
    console.error("[souvenir] related failed to load", error);
    return [];
  });
  const primary = souvenir.destinations[0];
  const state = souvenir.states[0];
  const markers = [
    ...souvenir.sellers.map((seller, index) => ({
      id: seller.id,
      lat: seller.latitude,
      lng: seller.longitude,
      label: seller.name,
      detail: [labelOf(SELLER_KINDS, seller.kind), seller.openingHours].filter(Boolean).join(" · "),
      kind: "shop",
      number: index + 1,
    })),
    ...souvenir.destinations.map((destination) => ({
      id: destination.id,
      lat: destination.latitude,
      lng: destination.longitude,
      label: destination.name,
      detail: "Destination",
      href: `/destinations/${destination.slug}`,
      kind: "destination",
    })),
  ];
  const audiences = AUDIENCES.filter((audience) => souvenir.audiences.includes(audience.value));
  const interests = INTERESTS.filter((interest) => souvenir.interests.includes(interest.value));

  return (
    <article>
      <Container className="py-8 sm:py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/souvenirs" className="hover:text-ink hover:underline">
                Souvenirs
              </Link>
            </li>
            {state ? (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={withQuery("/souvenirs", { state })} className="hover:text-ink hover:underline">
                    {state}
                  </Link>
                </li>
              </>
            ) : null}
          </ol>
        </nav>

        <header className="mt-3">
          <Link href={withQuery("/souvenirs", { category: souvenir.category.slug })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink hover:underline">
            <SouvenirIcon icon={souvenir.category.icon} className="h-4 w-4" />
            {souvenir.category.name}
          </Link>
          <h1 className="mt-1 max-w-3xl text-balance font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">{souvenir.name}</h1>
          <p className="mt-2 max-w-2xl text-lg text-ink-muted">{souvenir.shortDescription}</p>
        </header>

        <div className="mt-6">
          <Gallery
            name={souvenir.name}
            photos={souvenir.gallery}
            fallback={
              <div className="relative h-44 overflow-hidden rounded-xl sm:h-56">
                <SouvenirArt name={`${souvenir.name} — photo coming soon`} icon={souvenir.category.icon} label="Photos coming soon" />
              </div>
            }
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            {souvenir.needsVerification ? (
              <p role="note" className="mb-8 flex gap-2 rounded-xl border border-warn-line bg-warn-soft px-4 py-3 text-sm text-warn-ink">
                <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                Some details here — prices, places and hours — are still being checked by our team. Please confirm locally before you go.
              </p>
            ) : null}

            <StorySection id="about" title="About">
              {prose(souvenir.description)}
            </StorySection>
            <StorySection id="special" title="Why it's special" icon={<Sparkles aria-hidden="true" className="h-5 w-5 text-marigold-500" />}>
              {prose(souvenir.whySpecial)}
            </StorySection>
            <StorySection id="take-home" title="Why take it home?">
              {prose(souvenir.whyTakeHome)}
            </StorySection>
            {souvenir.authenticityTips ? (
              <StorySection id="authentic" title="How to spot the real thing" icon={<ShieldCheck aria-hidden="true" className="h-5 w-5 text-brand-600" />}>
                {prose(souvenir.authenticityTips)}
              </StorySection>
            ) : null}
            {souvenir.carryTips ? (
              <StorySection id="carry" title="Carrying it home" icon={<Luggage aria-hidden="true" className="h-5 w-5 text-ink-subtle" />}>
                {prose(souvenir.carryTips)}
              </StorySection>
            ) : null}

            <section id="where-to-buy" aria-labelledby="where-to-buy-title" className="scroll-mt-28 border-t border-line py-8">
              <h2 id="where-to-buy-title" className="font-display text-xl font-semibold text-ink sm:text-2xl">
                Where to buy
              </h2>
              {souvenir.sellers.length ? (
                <>
                  <p className="mt-1 text-sm text-ink-muted">Buy directly from these local places — you support the makers and see the real thing.</p>
                  <div className="mt-5 grid gap-6 xl:grid-cols-2">
                    <SellerList sellers={souvenir.sellers} />
                    <MapPanel markers={markers} label={`Map of places to buy ${souvenir.name}`} className="h-80 xl:sticky xl:top-28 xl:h-[28rem] xl:self-start" />
                  </div>
                </>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-line-strong bg-surface px-5 py-6 text-sm text-ink-muted">
                  We haven&apos;t listed specific places yet. Ask at local markets{primary ? ` around ${primary.name}` : ""} — most sellers know where to find it.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Approximate price</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">{formatPriceRange(souvenir.priceMin, souvenir.priceMax)}</p>
              <p className="mt-1 text-xs text-ink-muted">Prices are approximate — check locally. Nothing is sold on this site.</p>
              <dl className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Availability</dt>
                  <dd className="mt-0.5 text-ink">
                    {labelOf(AVAILABILITY, souvenir.availability)}
                    {souvenir.availabilityNote ? <span className="block text-ink-muted">{souvenir.availabilityNote}</span> : null}
                  </dd>
                </div>
                {souvenir.qualities.length ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">What makes it local</dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {QUALITIES.filter((quality) => souvenir.qualities.includes(quality.value)).map((quality) => (
                        <Badge key={quality.value} tone="brand">
                          {quality.label}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {audiences.length ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Good for</dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {audiences.map((audience) => (
                        <Badge key={audience.value}>{audience.label}</Badge>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {interests.length ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">If you love</dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {interests.map((interest) => (
                        <Badge key={interest.value}>{interest.label}</Badge>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {souvenir.sellers.length ? (
                <ButtonLink href="#where-to-buy" variant="secondary" className="mt-5 w-full">
                  See where to buy
                </ButtonLink>
              ) : null}
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-semibold text-ink">Where it comes from</h2>
              <ul className="mt-3 space-y-3">
                {souvenir.destinations.map((destination) => (
                  <li key={destination.id}>
                    <Link href={`/destinations/${destination.slug}`} className="group flex items-center gap-3">
                      <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                        <AppImage src={destination.coverImage} alt="" sizes="64px" />
                      </span>
                      <span>
                        <span className="block font-medium text-ink group-hover:underline">{destination.name}</span>
                        <span className="block text-xs text-ink-muted">{[destination.village?.district, destination.village?.state].filter(Boolean).join(", ")}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {primary ? (
                <ButtonLink href={`/trips/new?destination=${primary.id}`} className="mt-5 w-full">
                  Plan a trip to {primary.name}
                </ButtonLink>
              ) : null}
            </div>
          </aside>
        </div>

        {related.length ? (
          <section aria-labelledby="related-title" className="mt-6 border-t border-line pt-10">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 id="related-title" className="font-display text-2xl font-semibold text-ink">
                More to take home{state ? ` from ${state}` : ""}
              </h2>
              {state ? (
                <Link href={withQuery("/souvenirs", { state })} className="text-sm font-semibold text-link hover:underline">
                  View all local treasures <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>
            <CardGrid className="mt-5">
              {related.map((item) => (
                <SouvenirCard key={item.id} souvenir={item} />
              ))}
            </CardGrid>
          </section>
        ) : null}
      </Container>
    </article>
  );
}
