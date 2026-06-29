export function HeroCard({ title, description, badge }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-left shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">{badge}</p>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
