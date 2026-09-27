import Link from "next/link";
import { Brand } from "@/components/layout/brand";
import { WeaveBorder } from "@/components/ui/weave";
import { getSettings } from "@/lib/services/settings.service";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/destinations", label: "Destinations" },
      { href: "/experiences", label: "Experiences" },
      { href: "/festivals", label: "Festivals" },
      { href: "/stories", label: "Travel stories" },
      { href: "/guides", label: "Local guides" },
    ],
  },
  {
    title: "Plan",
    links: [
      { href: "/trips/new", label: "Plan a trip" },
      { href: "/saved", label: "Saved places" },
      { href: "/dashboard", label: "Your dashboard" },
      { href: "/guide/apply", label: "Become a guide" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact & help" },
    ],
  },
];

export async function SiteFooter() {
  const settings = await getSettings();

  return (
    <footer className="mt-16 bg-surface">
      <WeaveBorder variant="shawl" height={16} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Brand />
          <p className="mt-3 max-w-xs text-sm text-ink-muted">
            Journeys through the eight states of Northeast India — places, festivals, food and the people who keep their traditions alive.
          </p>
          <p className="mt-4 text-sm text-ink-muted">
            Emergency: <a href={`tel:${settings.emergencyNumber}`} className="font-semibold text-ink underline-offset-2 hover:underline">{settings.emergencyNumber}</a>
            {settings.touristHelpline ? (
              <>
                {" "}· Tourist helpline:{" "}
                <a href={`tel:${settings.touristHelpline}`} className="font-semibold text-ink underline-offset-2 hover:underline">
                  {settings.touristHelpline}
                </a>
              </>
            ) : null}
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold text-ink">{column.title}</h2>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-muted hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-ink-muted sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Smart Tourism. Map data © OpenStreetMap contributors.
        </p>
      </div>
    </footer>
  );
}
