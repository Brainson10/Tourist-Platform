"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";
import { toDateInput } from "@/lib/utils/format";

export function GuideRequestForm({ guide }) {
  const [values, setValues] = useState({ startDate: "", endDate: "", groupSize: 2, destinationId: guide.areas[0]?.id ?? "", message: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const { notify } = useToast();
  const router = useRouter();
  const today = toDateInput(new Date());
  const update = (name, value) => setValues((current) => ({ ...current, [name]: value, ...(name === "startDate" && (!current.endDate || current.endDate < value) ? { endDate: value } : {}) }));

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    const result = await apiRequest(`/api/guides/${guide.id}/requests`, { method: "POST", body: values });
    setPending(false);

    if (!result.ok) {
      setErrors(result.fieldErrors);
      setFormError(Object.keys(result.fieldErrors).length ? "" : result.message);
      return;
    }

    notify(result.message);
    setSent(true);
    router.refresh();
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-brand-soft p-4 text-sm text-brand-strong">
        <p className="font-semibold">Request sent to {guide.name}.</p>
        <p className="mt-1">You&apos;ll see their reply on your dashboard. Contact details are shared once they accept.</p>
        <Button size="sm" variant="secondary" className="mt-3" onClick={() => router.push("/dashboard#guide-requests")}>
          Go to my dashboard
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="request-start" label="From" required error={errors.startDate}>
          {(aria) => <Input {...aria} type="date" min={today} value={values.startDate} onChange={(event) => update("startDate", event.target.value)} />}
        </Field>
        <Field id="request-end" label="To" required error={errors.endDate}>
          {(aria) => <Input {...aria} type="date" min={values.startDate || today} value={values.endDate} onChange={(event) => update("endDate", event.target.value)} />}
        </Field>
        <Field id="request-group" label="Group size" required error={errors.groupSize}>
          {(aria) => <Input {...aria} type="number" min={1} max={50} value={values.groupSize} onChange={(event) => update("groupSize", event.target.value)} />}
        </Field>
        <Field id="request-destination" label="Where" error={errors.destinationId}>
          {(aria) => (
            <Select {...aria} value={values.destinationId} onChange={(event) => update("destinationId", event.target.value)}>
              {guide.areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <Field id="request-message" label="Message" required hint="What would you like to do? Any pace, food or accessibility needs?" error={errors.message}>
        {(aria) => <Textarea {...aria} rows={4} maxLength={2000} value={values.message} onChange={(event) => update("message", event.target.value)} />}
      </Field>
      <FormMessage>{formError}</FormMessage>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Sending…" : "Send request"}
      </Button>
      <p className="text-xs text-ink-subtle">No payment is taken here. Agree prices and plans directly with the guide.</p>
    </form>
  );
}
