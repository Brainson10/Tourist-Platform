import { cn } from "@/components/ui/cn";

export const inputClasses =
  "block w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-subtle transition-colors focus:border-link focus:outline-none focus:ring-2 focus:ring-link/20 disabled:bg-surface-muted aria-[invalid=true]:border-danger";

/**
 * Label + control + hint + error, wired together for screen readers.
 * Pass the control as a render function receiving the aria props.
 */
export function Field({ id, label, hint, error, required, className, children }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-danger-ink" aria-hidden="true"> *</span> : null}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, required })}
      {hint && !error ? (
        <p id={hintId} className="mt-1 text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 text-xs font-medium text-danger-ink">
          {Array.isArray(error) ? error[0] : error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }) {
  return <input className={cn(inputClasses, className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }) {
  return <textarea rows={rows} className={cn(inputClasses, "leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(inputClasses, "pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function FormMessage({ tone = "error", children }) {
  if (!children) return null;

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-lg px-3 py-2 text-sm", tone === "error" ? "bg-danger-soft text-danger-ink" : "bg-brand-soft text-brand-strong")}
    >
      {children}
    </p>
  );
}
