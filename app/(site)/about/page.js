import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata = {
  title: "About",
  description: "Why we built Smart Tourism and how we pick what goes on it.",
};

const PRINCIPLES = [
  {
    title: "Experiences over checklists",
    body: "Every place comes with what to do, what to eat and who to go with — not just a pin on a map.",
  },
  {
    title: "Local and responsible",
    body: "We highlight homestays, community-led experiences and the etiquette that helps you visit respectfully.",
  },
  {
    title: "Safety you can act on",
    body: "Emergency numbers, nearby hospitals and police, and honest notes about access and weather for each destination.",
  },
  {
    title: "Real traveler reviews",
    body: "Reviews come from signed-in travelers and are checked before they're published.",
  },
];

export default function AboutPage() {
  return (
    <Container className="py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Travel Northeast India with context</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Smart Tourism helps you decide where to go, understand what makes each place special, and plan a trip that fits you — from floating
          lakes and monasteries to village festivals and local food trails.
        </p>
      </div>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2">
        {PRINCIPLES.map((principle) => (
          <li key={principle.title} className="rounded-xl border border-line bg-surface p-5">
            <h2 className="font-semibold text-ink">{principle.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{principle.body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/destinations">Start exploring</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Get in touch
        </ButtonLink>
      </div>
    </Container>
  );
}
