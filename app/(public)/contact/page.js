import { PageShell } from "@/components/shared/page-shell";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Contact",
  description: "Placeholder contact page for the Smart Tourism Platform foundation.",
};

export default function ContactPage() {
  return (
    <PageShell title="Contact us" description="This placeholder page is ready for future support and inquiry flows.">
      <Card title="Get in touch" description="The contact experience can be expanded later without changing the shared layout.">
        <p className="text-sm text-slate-600">No contact form or backend integration has been added.</p>
      </Card>
    </PageShell>
  );
}
