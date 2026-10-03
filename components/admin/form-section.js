/** A titled card of form fields in a two-column grid, used by the long CMS forms. */
export function FormSection({ title, description, children }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {description ? <p className="mt-0.5 text-sm text-ink-muted">{description}</p> : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
