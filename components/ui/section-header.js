import Link from "next/link";
import { cn } from "@/components/ui/cn";

export function SectionHeader({ title, description, action, as: Heading = "h2", className, id }) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-2", className)}>
      <div className="max-w-2xl">
        <Heading id={id} className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          {title}
        </Heading>
        {description ? <p className="mt-1 text-sm text-ink-muted sm:text-base">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="text-sm font-semibold text-link hover:text-brand-strong">
          {action.label} <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </div>
  );
}
