export default function ExperienceCard({
  icon,
  title,
  description,
}) {
  return (
    <article className="group rounded-lg border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sm font-black text-sky-800 transition group-hover:bg-sky-700 group-hover:text-white">
        {icon}
      </div>

      <h3 className="mt-5 text-2xl font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>
    </article>
  );
}
