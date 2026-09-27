import Link from "next/link";
import { AppImage } from "@/components/ui/app-image";
import { Badge } from "@/components/ui/badge";
import { formatPrice, titleCase } from "@/lib/utils/format";

export function ExperienceCard({ experience, showDestination = true, priority = false }) {
  const price = formatPrice(experience.price);
  const facts = [experience.duration, experience.difficulty].filter(Boolean);

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-muted">
        <AppImage
          src={experience.image}
          alt={experience.title}
          fallbackLabel={experience.title}
          priority={priority}
          sizes="(min-width: 1280px) 280px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <Badge tone="overlay" className="absolute left-3 top-3">
          {titleCase(experience.category)}
        </Badge>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug text-ink">
        <Link href={`/experiences/${experience.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {experience.title}
        </Link>
      </h3>
      {showDestination && experience.destination ? <p className="text-sm text-ink-muted">{experience.destination.name}</p> : null}
      <p className="mt-1 flex flex-wrap gap-x-2 text-sm text-ink-muted">
        {facts.map((fact) => (
          <span key={fact}>{fact}</span>
        ))}
        {price ? <span className="font-semibold text-ink">{price === "Free" ? "Free" : `From ${price}`}</span> : null}
      </p>
    </article>
  );
}
