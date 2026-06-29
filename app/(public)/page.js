import { PageShell } from "@/components/shared/page-shell";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";

export const metadata = {
  title: "Home",
  description: "Public landing page for the Smart Tourism Platform foundation.",
};

export default function PublicHomePage() {
  return (
    <PageShell title="Welcome to the Smart Tourism Platform" description="A modular foundation for tourism experiences across Northeast India.">
      <Section title="Platform foundation" description="This scaffold organizes the app into reusable UI layers, public routes, and shared layout primitives.">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card title="Public experience" description="Landing pages, auth entry points, and informational experiences are grouped under the public route segment.">
            <p className="text-sm text-slate-600">Reusable and easy to extend.</p>
          </Card>
          <Card title="Protected surfaces" description="Dashboard and admin routes are ready for future feature expansion without disrupting the shared shell.">
            <p className="text-sm text-slate-600">Scaffolded for future growth.</p>
          </Card>
          <Card title="Reusable UI" description="Buttons, cards, sections, and containers are separated into a modular UI layer for consistency.">
            <p className="text-sm text-slate-600">Built for scale and maintainability.</p>
          </Card>
        </div>
      </Section>
    </PageShell>
  );
}
