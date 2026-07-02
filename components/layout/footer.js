import Link from "next/link";

export function Footer() {
  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Destinations", href: "/destinations" },
    { label: "Experiences", href: "/#experiences" },
    { label: "Festivals", href: "/#festivals" },
  ];
  const resources = [
    { label: "Travel Guides", href: "/destinations" },
    { label: "Community Stories", href: "/about" },
    { label: "Safety Tips", href: "/contact" },
    { label: "Festival Calendar", href: "/#festivals" },
  ];
  const support = [
    { label: "Help Center", href: "/contact" },
    { label: "Contact", href: "/contact" },
    { label: "Accessibility", href: "/about" },
    { label: "Emergency Info", href: "/contact" },
  ];
  const socials = ["X", "IG", "YT", "IN"];

  return (
    <footer className="border-t border-slate-200 bg-slate-950 py-14 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <h2 className="text-xl font-bold text-white">
              Smart Tourism Platform
            </h2>
            <p className="mt-4 max-w-md leading-7 text-slate-400">
              An experience intelligence platform for smarter, safer, more
              personal, and more sustainable journeys across Northeast India.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((social) => (
                <Link
                  key={social}
                  href="/"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xs font-bold text-white transition hover:border-sky-300 hover:bg-sky-300 hover:text-slate-950"
                  aria-label={`${social} social profile`}
                >
                  {social}
                </Link>
              ))}
            </div>
          </div>

          <FooterColumn title="Quick Links" items={quickLinks} />
          <FooterColumn title="Resources" items={resources} />
          <FooterColumn title="Support" items={support} />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>Copyright 2026 Smart Tourism Platform. All rights reserved.</p>
          <p>Built for intelligent tourism experiences.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h3 className="font-bold text-white">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="text-sm text-slate-400 transition hover:text-white">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
