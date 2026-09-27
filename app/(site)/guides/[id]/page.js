import { Languages, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { GuideRequestForm } from "@/components/guides/guide-request-form";
import { initials } from "@/lib/utils/initials";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isNotFound } from "@/lib/api/errors";
import { getCurrentUser } from "@/lib/auth/session";
import { getGuide } from "@/lib/services/guide.service";
import { paragraphs, pluralize } from "@/lib/utils/format";

const loadGuide = cache(async (id) => {
  try {
    return await getGuide(id);
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
});

export async function generateMetadata({ params }) {
  const guide = await loadGuide((await params).id);
  return guide ? { title: `${guide.name} · Local guide`, description: guide.headline } : { title: "Guide not found" };
}

export default async function GuidePage({ params }) {
  const { id } = await params;
  const guide = await loadGuide(id);
  if (!guide) notFound();

  const user = await getCurrentUser();

  return (
    <Container className="py-10">
      <Link href="/guides" className="text-sm font-medium text-link hover:underline">
        ← All guides
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-brand-700 text-3xl font-semibold text-white">
              {guide.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- guide photos come from uploads or links
                <img src={guide.photoUrl} alt={guide.name} className="h-full w-full object-cover" />
              ) : (
                <span aria-hidden="true" className="flex h-full w-full items-center justify-center">
                  {initials(guide.name)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{guide.name}</h1>
              <p className="mt-1 text-ink-muted">{guide.headline}</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-link">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" /> Reviewed by our team
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-surface p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Experience</dt>
              <dd className="mt-1 font-semibold text-ink">{guide.yearsExperience ? pluralize(guide.yearsExperience, "year") : "New guide"}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-4">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-subtle">
                <Languages aria-hidden="true" className="h-3.5 w-3.5" /> Languages
              </dt>
              <dd className="mt-1 font-semibold text-ink">{guide.languages.join(", ")}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-4">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-subtle">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5" /> Guides in
              </dt>
              <dd className="mt-1 space-x-1 font-semibold text-ink">
                {guide.areas.map((area, index) => (
                  <span key={area.id}>
                    <Link href={`/destinations/${area.slug}`} className="text-link hover:underline">
                      {area.name}
                    </Link>
                    {index < guide.areas.length - 1 ? "," : ""}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <section className="mt-8" aria-labelledby="about-guide">
            <h2 id="about-guide" className="text-xl font-semibold text-ink">
              About {guide.name.split(" ")[0]}
            </h2>
            <div className="mt-3 space-y-3 font-serif text-lg leading-relaxed text-ink-muted">
              {paragraphs(guide.bio).map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-lg font-semibold text-ink">Request {guide.name.split(" ")[0]}</h2>
            <div className="mt-4">
              {!user ? (
                <div className="text-sm text-ink-muted">
                  <p>Sign in to send a request. Contact details are shared once the guide accepts.</p>
                  <ButtonLink href={`/login?redirectTo=${encodeURIComponent(`/guides/${guide.id}`)}`} className="mt-4">
                    Sign in to request
                  </ButtonLink>
                </div>
              ) : user.id === guide.userId ? (
                <p className="text-sm text-ink-muted">
                  This is your public profile. Manage requests on your{" "}
                  <Link href="/guide" className="font-medium text-link hover:underline">
                    guide dashboard
                  </Link>
                  .
                </p>
              ) : (
                <GuideRequestForm guide={guide} />
              )}
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
