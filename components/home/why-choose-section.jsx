import FeatureCard from "./feature-card";

const features = [
  {
    icon: "AI",
    title: "AI Recommendation",
    description: "Designed to match destinations and experiences with travel intent, season, budget, and interests.",
  },
  {
    icon: "PX",
    title: "Personalized Experiences",
    description: "Moves beyond generic sightseeing into food, culture, nature, festival, and village-led discovery.",
  },
  {
    icon: "CI",
    title: "Cultural Intelligence",
    description: "Helps travelers understand history, etiquette, languages, traditions, and community context.",
  },
  {
    icon: "SI",
    title: "Smart Itinerary",
    description: "Future planning flows can connect activities, transport, weather, safety, and time constraints.",
  },
  {
    icon: "LG",
    title: "Local Guide Support",
    description: "Built to surface verified guides, homestays, stories, and local expertise as the platform grows.",
  },
  {
    icon: "ST",
    title: "Sustainable Tourism",
    description: "Encourages responsible routes that distribute benefits across villages, ecosystems, and communities.",
  },
  {
    icon: "EA",
    title: "Emergency Assistance",
    description: "Prepared for safety advisories, emergency contacts, accessibility notes, and travel readiness cues.",
  },
  {
    icon: "CS",
    title: "Community Stories",
    description: "Treats destinations as living places, with memory, craft, festivals, food, and local voices.",
  },
];

export default function WhyChooseSection() {
  return (
    <section className="py-24">
      <div className="text-center">
        <p className="font-semibold uppercase tracking-widest text-emerald-700">
          Why Smart Tourism
        </p>

        <h2 className="mt-3 text-4xl font-bold text-slate-950 md:text-5xl">
          Built for smarter, safer, richer journeys
        </h2>

        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          The landing experience introduces the platform promise while keeping
          the architecture ready for real recommendation, planning, and local
          intelligence services later.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            {...feature}
          />
        ))}
      </div>
    </section>
  );
}
