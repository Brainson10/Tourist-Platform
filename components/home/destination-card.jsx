import Image from "next/image";
import Link from "next/link";

export default function DestinationCard({
  image,
  title,
  location,
  rating,
  description,
  href,
}) {
  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-slate-900 shadow">
          {rating}
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm font-semibold text-sky-700">
          {location}
        </p>

        <h3 className="mt-2 text-2xl font-bold text-slate-950">
          {title}
        </h3>

        <p className="mt-4 leading-7 text-slate-600">
          {description}
        </p>

        <Link
          href={href}
          className="mt-6 inline-flex rounded-lg bg-sky-700 px-5 py-3 font-semibold text-white transition hover:bg-sky-800"
        >
          Explore
        </Link>
      </div>
    </article>
  );
}
