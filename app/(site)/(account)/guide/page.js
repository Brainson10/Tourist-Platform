import { Clock3, ShieldCheck, ShieldX } from "lucide-react";
import Link from "next/link";
import { RequestList } from "@/components/guides/request-list";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/states";
import { requireUserPage } from "@/lib/auth/session";
import { listGuideInbox } from "@/lib/services/guide.service";

export const metadata = { title: "Guide dashboard" };

const STATUS = {
  PENDING: { Icon: Clock3, tone: "border-warn-line bg-warn-soft text-warn-ink", title: "Your application is being reviewed", body: "We check every guide before they appear to travelers. You can keep editing your profile meanwhile." },
  APPROVED: { Icon: ShieldCheck, tone: "border-brand-soft-line bg-brand-soft text-brand-strong", title: "You're listed as a guide", body: "Travelers can find you on the destinations you cover." },
  REJECTED: { Icon: ShieldX, tone: "border-danger-line bg-danger-soft text-danger-ink", title: "Your application wasn't approved", body: "Update your profile with more detail and send it again." },
};

export default async function GuideDashboardPage() {
  const user = await requireUserPage("/guide");
  const { profile, requests } = await listGuideInbox(user);

  if (!profile) {
    return (
      <Container className="py-10">
        <EmptyState
          icon="✦"
          title="Share the places you know"
          description="Local guides help travelers see the real Northeast. Apply with a short profile — we'll review it and list you on the destinations you cover."
          action={{ href: "/guide/apply", label: "Apply to be a guide" }}
        />
      </Container>
    );
  }

  const status = STATUS[profile.status];
  const open = requests.filter((request) => request.status === "NEW").length;

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Guide dashboard</h1>
          <p className="mt-1 text-ink-muted">{open ? `${open} request${open === 1 ? "" : "s"} waiting for your reply.` : "You're all caught up."}</p>
        </div>
        <div className="flex gap-2">
          {profile.status === "APPROVED" ? (
            <ButtonLink href={`/guides/${profile.id}`} variant="secondary">
              View public profile
            </ButtonLink>
          ) : null}
          <ButtonLink href="/guide/apply">Edit profile</ButtonLink>
        </div>
      </div>

      <div className={`mt-6 flex gap-3 rounded-2xl border p-4 ${status.tone}`}>
        <status.Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
        <div className="text-sm">
          <p className="font-semibold">{status.title}</p>
          <p className="mt-0.5">{status.body}</p>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="inbox-title">
        <h2 id="inbox-title" className="mb-4 text-lg font-semibold text-ink">
          Requests
        </h2>
        <RequestList requests={requests} role="guide" />
      </section>

      <p className="mt-8 text-sm text-ink-subtle">
        Traveling yourself? Your own trips and requests are on your{" "}
        <Link href="/dashboard" className="font-medium text-link hover:underline">
          dashboard
        </Link>
        .
      </p>
    </Container>
  );
}
