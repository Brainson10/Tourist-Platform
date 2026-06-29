import { PageShell } from "@/components/shared/page-shell";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "About",
  description: "Placeholder about page for the Smart Tourism Platform foundation.",
};

export default function AboutPage() {
  return (
    <PageShell title="About the platform" description="The project foundation is organized around reusable UI, route groups, and modular structure.">
      <Card title="Architecture overview" description="This scaffold follows the requested constitution and prepares the app for future tourism modules.">
        <p className="text-sm text-slate-600">The design is intentionally clean, modular, and easy to expand.</p>
      </Card>
    </PageShell>
  );
}
