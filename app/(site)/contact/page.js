import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getSettings } from "@/lib/services/settings.service";

export const metadata = {
  title: "Contact & help",
  description: "Get help with your trip, report a problem, or suggest a place we should add.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <Container className="py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Contact & help</h1>
        <p className="mt-3 text-lg text-ink-muted">Questions about a trip, a problem with your account, or a place we should add? We&apos;d love to hear from you.</p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <section className="rounded-xl border border-danger-line bg-danger-soft p-5" aria-labelledby="emergency-title">
          <h2 id="emergency-title" className="font-semibold text-danger-ink">
            In an emergency
          </h2>
          <p className="mt-1 text-sm text-danger-ink/80">For police, fire or ambulance anywhere in India, call:</p>
          <a href={`tel:${settings.emergencyNumber}`} className="mt-3 block text-3xl font-semibold text-danger-ink">
            {settings.emergencyNumber}
          </a>
          {settings.touristHelpline ? (
            <p className="mt-3 text-sm text-danger-ink/80">
              24×7 tourist helpline:{" "}
              <a href={`tel:${settings.touristHelpline}`} className="font-semibold text-danger-ink underline">
                {settings.touristHelpline}
              </a>
            </p>
          ) : null}
          <p className="mt-3 text-sm text-danger-ink/80">Each destination page also lists local contacts and the nearest hospitals.</p>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="support-title">
          <h2 id="support-title" className="font-semibold text-ink">
            Traveler support
          </h2>
          <p className="mt-1 text-sm text-ink-muted">Help with your account, trips, reviews or anything on the site.</p>
          {settings.supportEmail || settings.supportPhone ? (
            <ul className="mt-3 space-y-1 text-sm">
              {settings.supportEmail ? (
                <li>
                  <a href={`mailto:${settings.supportEmail}`} className="font-semibold text-link hover:underline">
                    {settings.supportEmail}
                  </a>
                </li>
              ) : null}
              {settings.supportPhone ? (
                <li>
                  <a href={`tel:${settings.supportPhone}`} className="font-semibold text-link hover:underline">
                    {settings.supportPhone}
                  </a>
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">Our support inbox is being set up. In the meantime, check the destination pages for local contacts.</p>
          )}
        </section>

        <section className="rounded-xl border border-line bg-surface p-5" aria-labelledby="suggest-title">
          <h2 id="suggest-title" className="font-semibold text-ink">
            Suggest a place or story
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Know a hidden gem, a community-run homestay or a festival we&apos;re missing? Write to us
            {settings.supportEmail ? "" : " once our inbox is live"} — or share it in a review on a nearby{" "}
            <Link href="/destinations" className="font-medium text-link hover:underline">
              destination
            </Link>
            .
          </p>
        </section>
      </div>
    </Container>
  );
}
