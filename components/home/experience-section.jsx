import ExperienceCard from "./experience-card";

const experiences = [
  {
    icon: "AD",
    title: "Adventure",
    description: "Trekking, camping, ridge walks, river trails, and active journeys guided by terrain and season.",
  },
  {
    icon: "NT",
    title: "Nature",
    description: "Lakes, forests, waterfalls, valleys, and quiet landscapes for slow, restorative travel.",
  },
  {
    icon: "CL",
    title: "Culture",
    description: "Heritage spaces, living traditions, music, crafts, and meaningful local encounters.",
  },
  {
    icon: "FD",
    title: "Food",
    description: "Regional kitchens, market walks, community meals, tea stops, and seasonal flavors.",
  },
  {
    icon: "FS",
    title: "Festivals",
    description: "Plan journeys around celebrations, rituals, sport, dance, and community gatherings.",
  },
  {
    icon: "WL",
    title: "Wildlife",
    description: "Protected parks, wetlands, birding trails, and responsible encounters with biodiversity.",
  },
  {
    icon: "SP",
    title: "Spiritual",
    description: "Temples, monasteries, sacred groves, and reflective routes rooted in local belief systems.",
  },
];

export default function ExperienceSection() {
  return (
    <section className="py-24" id="experiences">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="font-semibold uppercase tracking-wider text-sky-700">
            Experience first
          </p>

          <h2 className="mt-3 text-4xl font-bold text-slate-950 md:text-5xl">
            Choose Your Experience
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-600">
            Start with the feeling, pace, and purpose of your trip. The
            platform can later map those interests to destinations, festivals,
            stories, and safe travel plans.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {experiences.map((item) => (
            <ExperienceCard
              key={item.title}
              {...item}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
