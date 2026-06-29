export function SectionShell({ eyebrow, title, description, children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl ${className}`.trim()}>
      <div className="mb-6 max-w-2xl">
        {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">{eyebrow}</p> : null}
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
