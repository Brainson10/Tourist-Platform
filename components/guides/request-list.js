"use client";

import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";
import { formatDateRange, pluralize } from "@/lib/utils/format";

const STATUS = {
  NEW: ["amber", "Waiting for reply"],
  ACCEPTED: ["brand", "Accepted"],
  DECLINED: ["neutral", "Declined"],
  CANCELLED: ["neutral", "Cancelled"],
};

function Contact({ phone, email }) {
  if (!phone && !email) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-brand-soft px-3 py-2 text-sm text-brand-strong">
      {phone ? (
        <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 font-medium hover:underline">
          <Phone aria-hidden="true" className="h-3.5 w-3.5" /> {phone}
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 font-medium hover:underline">
          <Mail aria-hidden="true" className="h-3.5 w-3.5" /> {email}
        </a>
      ) : null}
    </div>
  );
}

/** `role` is "guide" (inbox) or "tourist" (my requests). */
export function RequestList({ requests, role }) {
  const [pending, setPending] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const { notify } = useToast();
  const router = useRouter();

  async function respond(request, status) {
    setPending(request.id);
    const result = await apiRequest(`/api/guide-requests/${request.id}`, { method: "PATCH", body: { status } });
    setPending(null);
    setCancelling(null);
    notify(result.message, result.ok ? "success" : "error");
    if (result.ok) router.refresh();
  }

  if (!requests.length) {
    return (
      <p className="rounded-2xl border border-dashed border-line-strong px-4 py-8 text-center text-sm text-ink-subtle">
        {role === "guide" ? "No requests yet. Travelers will find you on the destinations you cover." : "You haven't contacted a guide yet."}
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {requests.map((request) => {
          const [tone, label] = STATUS[request.status];
          const other = role === "guide" ? request.tourist : request.guide;

          return (
            <li key={request.id} className="rounded-2xl border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">
                    {role === "guide" ? other.fullName : <Link href={`/guides/${other.id}`} className="hover:underline">{other.name}</Link>}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {formatDateRange(request.startDate, request.endDate)} · {pluralize(request.groupSize, "person", "people")}
                    {request.destination ? ` · ${request.destination.name}` : ""}
                  </p>
                </div>
                <Badge tone={tone}>{label}</Badge>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-ink-muted">{request.message}</p>
              {request.status === "ACCEPTED" ? <Contact phone={other.phone} email={other.email} /> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {role === "guide" && request.status === "NEW" ? (
                  <>
                    <Button size="sm" disabled={pending === request.id} onClick={() => respond(request, "ACCEPTED")}>
                      Accept
                    </Button>
                    <Button size="sm" variant="secondary" disabled={pending === request.id} onClick={() => respond(request, "DECLINED")}>
                      Decline
                    </Button>
                  </>
                ) : null}
                {role === "tourist" && ["NEW", "ACCEPTED"].includes(request.status) ? (
                  <Button size="sm" variant="danger-ghost" disabled={pending === request.id} onClick={() => setCancelling(request)}>
                    Cancel request
                  </Button>
                ) : null}
              </div>
              {request.status === "NEW" && role === "guide" ? <p className="mt-2 text-xs text-ink-subtle">Accepting shares your phone number and email with this traveler, and theirs with you.</p> : null}
            </li>
          );
        })}
      </ul>
      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={() => respond(cancelling, "CANCELLED")}
        pending={Boolean(pending)}
        title="Cancel this request?"
        description="The guide will see that you've cancelled."
        confirmLabel="Cancel request"
      />
    </>
  );
}
