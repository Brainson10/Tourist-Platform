import { Languages, MapPin } from "lucide-react";
import Link from "next/link";
import { initials } from "@/lib/utils/initials";
import { pluralize } from "@/lib/utils/format";

export function GuideCard({ guide }) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-brand-700 text-lg font-semibold text-white">
          {guide.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- guide photos come from uploads or links
            <img src={guide.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden="true" className="flex h-full w-full items-center justify-center">
              {initials(guide.name)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold text-ink">
            <Link href={`/guides/${guide.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {guide.name}
            </Link>
          </h3>
          <p className="text-xs text-ink-subtle">{guide.yearsExperience ? `${pluralize(guide.yearsExperience, "year")} guiding` : "New guide"}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{guide.headline}</p>
      <dl className="mt-auto space-y-1.5 pt-4 text-xs text-ink-muted">
        <div className="flex items-start gap-1.5">
          <dt>
            <Languages aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="sr-only">Languages</span>
          </dt>
          <dd>{guide.languages.join(", ")}</dd>
        </div>
        <div className="flex items-start gap-1.5">
          <dt>
            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="sr-only">Guides in</span>
          </dt>
          <dd className="line-clamp-1">{guide.areas.map((area) => area.name).join(", ")}</dd>
        </div>
      </dl>
    </article>
  );
}
