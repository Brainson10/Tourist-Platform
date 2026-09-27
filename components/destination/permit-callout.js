import { ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

/** Entry-permit rules for the destination's state (e.g. Inner Line Permit). */
export function PermitCallout({ permit, state, compact = false }) {
  if (!permit) return null;

  if (!permit.required) {
    return (
      <div className="flex gap-3 rounded-2xl border border-brand-soft-line bg-brand-soft p-4 text-sm text-brand-strong">
        <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0" />
        <p>
          <span className="font-semibold">No entry permit needed for {state}.</span> {permit.whoNeedsIt && !compact ? permit.whoNeedsIt : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-warn-line bg-warn-soft p-5 text-warn-ink">
      <div className="flex items-start gap-3">
        <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <h3 className="font-semibold">{permit.permitName ?? "Entry permit"} required for {state}</h3>
          {permit.whoNeedsIt ? <p className="mt-1 text-sm leading-relaxed">{permit.whoNeedsIt}</p> : null}
          {!compact ? (
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              {permit.howToApply ? (
                <div className="sm:col-span-2">
                  <dt className="font-medium">How to apply</dt>
                  <dd className="mt-0.5 leading-relaxed">{permit.howToApply}</dd>
                </div>
              ) : null}
              {permit.fee ? (
                <div>
                  <dt className="font-medium">Fee</dt>
                  <dd>{permit.fee}</dd>
                </div>
              ) : null}
              {permit.processingTime ? (
                <div>
                  <dt className="font-medium">Processing time</dt>
                  <dd>{permit.processingTime}</dd>
                </div>
              ) : null}
              {permit.foreignersNote ? (
                <div className="sm:col-span-2">
                  <dt className="font-medium">Foreign nationals</dt>
                  <dd>{permit.foreignersNote}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {permit.applyUrl ? (
              <a href={permit.applyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold underline underline-offset-2">
                Official permit portal <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : null}
            <span className="text-xs opacity-80">
              {permit.lastVerifiedAt ? `Last checked ${formatDate(permit.lastVerifiedAt)}. ` : ""}Rules change — confirm with the state government before you travel.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
