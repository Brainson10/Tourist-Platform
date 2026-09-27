"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";

export function SettingsForm({ settings }) {
  const [values, setValues] = useState({
    supportEmail: settings.supportEmail ?? "",
    supportPhone: settings.supportPhone ?? "",
    emergencyNumber: settings.emergencyNumber ?? "112",
    touristHelpline: settings.touristHelpline ?? "",
    autoApproveReviews: Boolean(settings.autoApproveReviews),
    defaultDailyBudget: settings.defaultDailyBudget ?? 2500,
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const { notify } = useToast();

  const update = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    const result = await apiRequest("/api/admin/settings", { method: "PUT", body: { ...values, defaultDailyBudget: Number(values.defaultDailyBudget) || 0 } });
    setPending(false);
    setErrors(result.fieldErrors);
    setFormError(result.ok || Object.keys(result.fieldErrors).length ? "" : result.message);
    if (result.ok) notify("Settings saved");
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-2xl space-y-6">
      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="font-semibold text-ink">Contact details</h2>
        <p className="mt-0.5 text-sm text-ink-muted">Shown on the Contact page and in the footer.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="s-email" label="Support email" error={errors.supportEmail}>
            {(aria) => <Input {...aria} type="email" value={values.supportEmail} onChange={(event) => update("supportEmail", event.target.value)} />}
          </Field>
          <Field id="s-phone" label="Support phone" error={errors.supportPhone}>
            {(aria) => <Input {...aria} type="tel" value={values.supportPhone} onChange={(event) => update("supportPhone", event.target.value)} />}
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="font-semibold text-ink">Emergency numbers</h2>
        <p className="mt-0.5 text-sm text-ink-muted">Used on every destination page when it has no local contacts of its own.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="s-emergency" label="Emergency number" required error={errors.emergencyNumber}>
            {(aria) => <Input {...aria} value={values.emergencyNumber} onChange={(event) => update("emergencyNumber", event.target.value)} />}
          </Field>
          <Field id="s-helpline" label="Tourist helpline" error={errors.touristHelpline}>
            {(aria) => <Input {...aria} value={values.touristHelpline} onChange={(event) => update("touristHelpline", event.target.value)} />}
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="font-semibold text-ink">Reviews</h2>
        <label className="mt-3 flex items-start gap-3 text-sm text-ink">
          <input type="checkbox" checked={values.autoApproveReviews} onChange={(event) => update("autoApproveReviews", event.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-700" />
          <span>
            Publish new reviews immediately
            <span className="block text-ink-muted">When off, reviews wait in the moderation queue until an admin approves them.</span>
          </span>
        </label>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="font-semibold text-ink">Trip budgets</h2>
        <p className="mt-0.5 text-sm text-ink-muted">Used for a trip&apos;s estimate until the traveler sets their own daily spend.</p>
        <div className="mt-4 max-w-xs">
          <Field id="s-daily" label="Typical daily spend per person (₹)" error={errors.defaultDailyBudget}>
            {(aria) => <Input {...aria} type="number" min={0} step={100} value={values.defaultDailyBudget} onChange={(event) => update("defaultDailyBudget", event.target.value)} />}
          </Field>
        </div>
      </section>

      <FormMessage>{formError}</FormMessage>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
