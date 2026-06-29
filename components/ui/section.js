import { cn } from "@/utils/helpers";

export function Section({ children, className = "", title, description }) {
  return (
    <section className={cn("py-10 sm:py-14", className)}>
      {(title || description) && (
        <div className="mb-8 max-w-2xl">
          {title ? <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2> : null}
          {description ? <p className="mt-3 text-base leading-7 text-slate-600">{description}</p> : null}
        </div>
      )}
      {children}
    </section>
  );
}
