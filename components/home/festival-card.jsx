import Image from "next/image";
import Link from "next/link";

export default function FestivalCard({
  image,
  title,
  month,
  description,
}) {
  return (
    <article className="group overflow-hidden rounded-lg border border-amber-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-60 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900 shadow">
          {month}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-bold text-slate-950">
          {title}
        </h3>

        <p className="mt-3 leading-7 text-slate-600">
          {description}
        </p>

        <Link href="/destinations" className="mt-6 inline-flex rounded-lg border border-amber-200 px-5 py-3 font-semibold text-amber-900 transition hover:border-amber-700 hover:bg-amber-700 hover:text-white">
          Learn More
        </Link>
      </div>
    </article>
  );
}
