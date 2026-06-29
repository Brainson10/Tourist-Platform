import { cn } from "@/utils/helpers";

export function Card({ children, className = "", title, description }) {
  return (
    <div className={cn("rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur", className)}>
      {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : null}
      {description ? <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
