import { cn } from "@/utils/helpers";

export function DashboardCard({ children, className = "" }) {
  return (
    <section className={cn("rounded-lg border border-slate-200 bg-white p-5 shadow-sm", className)}>
      {children}
    </section>
  );
}

export function SectionHeader({ title, description, action = null }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, description, action = null }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
