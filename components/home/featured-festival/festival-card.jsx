import Image from "next/image";
import FestivalBadge from "./festival-badge";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatFestivalDate(startDate, endDate) {
  const start = dateFormatter.format(new Date(startDate));
  const end = dateFormatter.format(new Date(endDate));

  return start === end ? start : `${start} - ${end}`;
}

export default function FestivalCard({ festival }) {
  const location = [
    festival.destination?.district,
    festival.destination?.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={festival.imageUrl}
          alt={festival.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4">
          <FestivalBadge category={festival.category} />
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm font-semibold text-sky-700">
          {formatFestivalDate(festival.startDate, festival.endDate)}
        </p>

        <h3 className="mt-2 text-2xl font-bold text-slate-950">
          {festival.title}
        </h3>

        {location ? (
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {location}
          </p>
        ) : null}

        <p className="mt-4 line-clamp-3 leading-7 text-slate-600">
          {festival.description}
        </p>
      </div>
    </article>
  );
}
