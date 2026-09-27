import Link from "next/link";
import { cn } from "@/components/ui/cn";

/** Link-based single-select chips, e.g. category filters. */
export function FilterChips({ label, options, active, hrefFor }) {
  return (
    <nav aria-label={label} className="relative scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {options.map((option) => {
        const isActive = (active ?? "") === (option.value ?? "");

        return (
          <Link
            key={option.value ?? "all"}
            href={hrefFor(option.value)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive ? "border-brand-700 bg-brand-700 text-white" : "border-line-strong bg-surface text-ink-muted hover:border-line-strong"
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
