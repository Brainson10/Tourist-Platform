"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";
import { toDateInput } from "@/lib/utils/format";

const STATUS_OPTIONS = [
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Confirmed / on the road" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function TripForm({ destinations, trip, initialDestinationId, onSaved }) {
  const isEdit = Boolean(trip);
  const initialDestination = destinations.find((destination) => destination.id === (trip?.destinationId ?? initialDestinationId));
  const [values, setValues] = useState({
    title: trip?.title ?? (initialDestination ? `Trip to ${initialDestination.name}` : ""),
    destinationId: trip?.destinationId ?? initialDestination?.id ?? "",
    startDate: toDateInput(trip?.startDate),
    endDate: toDateInput(trip?.endDate),
    notes: trip?.notes ?? "",
    status: trip?.status ?? "PLANNING",
    travelers: trip?.travelers ?? 1,
    dailyBudget: trip?.dailyBudget ?? "",
    suggestItinerary: true,
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const { notify } = useToast();
  const router = useRouter();
  const today = toDateInput(new Date());

  function update(field, value) {
    setValues((current) => {
      const next = { ...current, [field]: value };

      if (field === "destinationId" && !isEdit) {
        const previous = destinations.find((destination) => destination.id === current.destinationId);
        const selected = destinations.find((destination) => destination.id === value);
        // Keep the suggested title in sync until the traveler types their own.
        if (!current.title || (previous && current.title === `Trip to ${previous.name}`)) next.title = selected ? `Trip to ${selected.name}` : "";
      }

      if (field === "startDate" && (!current.endDate || current.endDate < value)) next.endDate = value;
      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setFormError("");

    const body = {
      title: values.title,
      destinationId: values.destinationId || null,
      startDate: values.startDate,
      endDate: values.endDate,
      notes: values.notes,
      travelers: Number(values.travelers) || 1,
      dailyBudget: values.dailyBudget === "" ? null : Number(values.dailyBudget),
      ...(isEdit ? { status: values.status } : { suggestItinerary: Boolean(values.destinationId) && values.suggestItinerary }),
    };
    const result = await apiRequest(isEdit ? `/api/trips/${trip.id}` : "/api/trips", { method: isEdit ? "PATCH" : "POST", body });
    setPending(false);

    if (!result.ok) {
      setErrors(result.fieldErrors);
      setFormError(Object.keys(result.fieldErrors).length ? "Please fix the highlighted fields." : result.message);
      return;
    }

    notify(isEdit ? "Trip updated" : "Trip created — now shape your itinerary");

    if (isEdit) {
      onSaved?.();
      router.refresh();
    } else {
      router.push(`/trips/${result.data.id}`);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field id="trip-destination" label="Destination" hint="Optional — you can plan a multi-stop trip without one." error={errors.destinationId}>
        {(aria) => (
          <Select {...aria} value={values.destinationId} onChange={(event) => update("destinationId", event.target.value)}>
            <option value="">No single destination</option>
            {destinations.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field id="trip-title" label="Trip name" required error={errors.title}>
        {(aria) => <Input {...aria} value={values.title} maxLength={120} placeholder="e.g. Long weekend in Shillong" onChange={(event) => update("title", event.target.value)} />}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="trip-start" label="Start date" required error={errors.startDate}>
          {(aria) => <Input {...aria} type="date" min={isEdit ? undefined : today} value={values.startDate} onChange={(event) => update("startDate", event.target.value)} />}
        </Field>
        <Field id="trip-end" label="End date" required error={errors.endDate}>
          {(aria) => <Input {...aria} type="date" min={values.startDate || today} value={values.endDate} onChange={(event) => update("endDate", event.target.value)} />}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="trip-travelers" label="Travelers" error={errors.travelers}>
          {(aria) => <Input {...aria} type="number" min={1} max={50} value={values.travelers} onChange={(event) => update("travelers", event.target.value)} />}
        </Field>
        <Field id="trip-daily-budget" label="Daily spend per person (₹)" hint="Stay, food and local travel. Optional." error={errors.dailyBudget}>
          {(aria) => <Input {...aria} type="number" min={0} step={100} inputMode="numeric" placeholder="e.g. 2500" value={values.dailyBudget} onChange={(event) => update("dailyBudget", event.target.value)} />}
        </Field>
      </div>

      {isEdit ? (
        <Field id="trip-status" label="Status" error={errors.status}>
          {(aria) => (
            <Select {...aria} value={values.status} onChange={(event) => update("status", event.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      ) : null}

      <Field id="trip-notes" label="Notes" hint="Who's coming, budget, bookings to make — anything you want to remember." error={errors.notes}>
        {(aria) => <Textarea {...aria} rows={3} value={values.notes} maxLength={4000} onChange={(event) => update("notes", event.target.value)} />}
      </Field>

      {!isEdit && values.destinationId ? (
        <label className="flex items-start gap-3 rounded-lg bg-brand-soft p-3 text-sm text-brand-strong">
          <input
            type="checkbox"
            checked={values.suggestItinerary}
            onChange={(event) => update("suggestItinerary", event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand-700"
          />
          <span>
            <span className="font-semibold">Start with a suggested itinerary</span>
            <span className="block text-brand-strong/80">We&apos;ll spread the destination&apos;s top things to do across your days. You can change everything later.</span>
          </span>
        </label>
      ) : null}

      <FormMessage>{formError}</FormMessage>
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : isEdit ? "Save changes" : "Create trip"}
      </Button>
    </form>
  );
}
