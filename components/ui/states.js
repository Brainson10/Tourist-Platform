import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

export function EmptyState({ title, description, action, icon = "◎", className }) {
  return (
    <div className={cn("rounded-xl border border-dashed border-line-strong bg-surface px-6 py-10 text-center", className)}>
      <div aria-hidden="true" className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
        {icon}
      </div>
      <h3 className="mt-3 text-base font-semibold text-ink">{title}</h3>
      {description ? <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">{description}</p> : null}
      {action ? (
        <ButtonLink href={action.href} variant="secondary" size="sm" className="mt-4">
          {action.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description = "We couldn't load this right now. Please try again in a moment.", action, className }) {
  return (
    <div role="alert" className={cn("rounded-xl border border-warn-line bg-warn-soft px-6 py-8 text-center", className)}>
      <h3 className="text-base font-semibold text-warn-ink">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-warn-ink">{description}</p>
      {action ? (
        <ButtonLink href={action.href} variant="secondary" size="sm" className="mt-4">
          {action.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-line/70", className)} />;
}

export function CardGridSkeleton({ count = 8 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
