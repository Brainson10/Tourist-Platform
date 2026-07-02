import Image from "next/image";

export default function TestimonialCard({
  image,
  name,
  country,
  review,
  rating,
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 overflow-hidden rounded-full">
          <Image
            src={image}
            alt={name}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>

        <div>
          <h3 className="font-bold text-slate-950">{name}</h3>
          <p className="text-sm text-slate-500">{country}</p>
        </div>
      </div>

      <p className="mt-5 leading-7 text-slate-600">
        {review}
      </p>

      <p className="mt-5 text-sm font-bold text-amber-700">
        {rating}
      </p>
    </article>
  );
}
