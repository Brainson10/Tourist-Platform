import Link from "next/link";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/components/ui/cn";
import { pluralize } from "@/lib/utils/format";

const TINTS = [
  "bg-brand-soft text-brand-strong border-brand-soft-line",
  "bg-accent-soft text-accent-ink border-accent-soft",
  "bg-warn-soft text-warn-ink border-warn-line",
  "bg-info-soft text-info-ink border-info-soft",
];

export function MoodTiles({ categories }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category, index) => (
        <li key={category.id}>
          <Link
            href={`/destinations?category=${category.slug}`}
            className={cn("group flex items-center gap-3 rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md", TINTS[index % TINTS.length])}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface/70 transition-transform group-hover:scale-105">
              <CategoryIcon slug={category.slug} className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-base font-semibold">{category.name}</span>
              <span className="text-xs opacity-80">{pluralize(category.count, "place")}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
