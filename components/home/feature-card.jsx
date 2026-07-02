export default function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-sm font-black text-emerald-800">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>
    </article>
  );
}
