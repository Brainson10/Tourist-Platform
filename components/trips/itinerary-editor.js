"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCorners, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";
import { addDays, formatWeekday } from "@/lib/utils/format";

function ItemForm({ tripId, days, item, defaultDay, experiences, destinationId, onDone }) {
  const [values, setValues] = useState({
    day: item?.day ?? defaultDay ?? 1,
    title: item?.title ?? "",
    time: item?.time ?? "",
    notes: item?.notes ?? "",
    experienceId: item?.experienceId ?? "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const { notify } = useToast();
  const router = useRouter();

  function update(field, value) {
    setValues((current) => {
      const next = { ...current, [field]: value };
      if (field === "experienceId" && value && !current.title) {
        next.title = experiences.find((experience) => experience.id === value)?.title ?? "";
      }
      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    const body = { ...values, day: Number(values.day), destinationId: item?.destinationId ?? destinationId ?? null };
    const result = await apiRequest(item ? `/api/trips/${tripId}/items/${item?.id}` : `/api/trips/${tripId}/items`, { method: item ? "PATCH" : "POST", body });
    setPending(false);

    if (!result.ok) {
      setErrors(result.fieldErrors);
      setFormError(Object.keys(result.fieldErrors).length ? "" : result.message);
      return;
    }

    notify(result.message);
    onDone();
    router.refresh();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="item-day" label="Day" required error={errors.day}>
          {(aria) => (
            <Select {...aria} value={values.day} onChange={(event) => update("day", event.target.value)}>
              {days.map((day) => (
                <option key={day.day} value={day.day}>
                  Day {day.day} · {day.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="item-time" label="Time" hint="Optional, e.g. 7:00 AM or Morning" error={errors.time}>
          {(aria) => <Input {...aria} value={values.time} maxLength={40} onChange={(event) => update("time", event.target.value)} />}
        </Field>
      </div>
      {experiences.length ? (
        <Field id="item-experience" label="Link an experience" hint="Optional" error={errors.experienceId}>
          {(aria) => (
            <Select {...aria} value={values.experienceId} onChange={(event) => update("experienceId", event.target.value)}>
              <option value="">None</option>
              {experiences.map((experience) => (
                <option key={experience.id} value={experience.id}>
                  {experience.title}
                </option>
              ))}
            </Select>
          )}
        </Field>
      ) : null}
      <Field id="item-title" label="What are you doing?" required error={errors.title}>
        {(aria) => <Input {...aria} value={values.title} maxLength={160} placeholder="e.g. Sunrise boat ride" onChange={(event) => update("title", event.target.value)} />}
      </Field>
      <Field id="item-notes" label="Notes" error={errors.notes}>
        {(aria) => <Textarea {...aria} rows={3} value={values.notes} maxLength={1000} placeholder="Bookings, meeting points, what to carry…" onChange={(event) => update("notes", event.target.value)} />}
      </Field>
      <FormMessage>{formError}</FormMessage>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : item ? "Save" : "Add to plan"}
        </Button>
      </div>
    </form>
  );
}

const dayKey = (day) => `day-${day}`;
const toColumns = (itinerary) => Object.fromEntries(itinerary.map((entry) => [dayKey(entry.day), entry.items]));
const signature = (itinerary) => JSON.stringify(itinerary.map((entry) => [entry.day, entry.items.map((item) => `${item.id}:${item.updatedAt}`)]));

function DayDropZone({ id, isEmpty, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <ul ref={setNodeRef} className={cn("min-h-[3.25rem] divide-y divide-line transition-colors", isOver && isEmpty && "bg-brand-soft")}>
      {children}
    </ul>
  );
}

function SortableItem({ item, index, count, busy, onMove, onEdit, onRemove }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("print-break-inside-avoid flex gap-2 bg-surface px-2 py-3 sm:gap-3 sm:px-3", isDragging && "relative z-10 rounded-xl shadow-lg ring-1 ring-line-strong")}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="no-print flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-ink-subtle hover:text-ink active:cursor-grabbing"
        aria-label={`Drag to reorder ${item.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden="true" className="h-4 w-4" />
      </button>
      <div className="w-12 shrink-0 pt-1 text-xs font-medium text-ink-muted sm:w-20">{item.time || "—"}</div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="font-medium text-ink">{item.title}</p>
        {item.experience ? (
          <Link href={`/experiences/${item.experience.id}`} className="text-xs font-medium text-link hover:underline">
            Experience details{item.experience.duration ? ` · ${item.experience.duration}` : ""}
          </Link>
        ) : null}
        {item.notes ? <p className="mt-0.5 whitespace-pre-line text-sm text-ink-muted">{item.notes}</p> : null}
      </div>
      <div className="no-print flex shrink-0 items-start gap-0.5">
        <Button size="icon" variant="ghost" className="hidden h-8 w-8 sm:inline-flex" disabled={index === 0 || busy} onClick={() => onMove(item, "up")} aria-label={`Move ${item.title} earlier`}>
          ↑
        </Button>
        <Button size="icon" variant="ghost" className="hidden h-8 w-8 sm:inline-flex" disabled={index === count - 1 || busy} onClick={() => onMove(item, "down")} aria-label={`Move ${item.title} later`}>
          ↓
        </Button>
        <Button size="sm" variant="ghost" className="px-2 sm:px-3.5" onClick={() => onEdit(item)}>
          <Pencil aria-hidden="true" className="h-3.5 w-3.5 sm:hidden" />
          <span className="sr-only sm:not-sr-only">Edit</span>
          <span className="sr-only"> {item.title}</span>
        </Button>
        <Button size="sm" variant="danger-ghost" className="px-2 sm:px-3.5" onClick={() => onRemove(item)}>
          <Trash2 aria-hidden="true" className="h-3.5 w-3.5 sm:hidden" />
          <span className="sr-only sm:not-sr-only">Remove</span>
          <span className="sr-only"> {item.title}</span>
        </Button>
      </div>
    </li>
  );
}

export function ItineraryEditor({ trip, suggestions, experiences }) {
  const [dialog, setDialog] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(null);
  const { notify } = useToast();
  const router = useRouter();
  const dndId = useId();

  // Local copy of the itinerary so drags feel instant; re-synced whenever the server data changes.
  const serverSignature = signature(trip.itinerary);
  const [columns, setColumns] = useState(() => toColumns(trip.itinerary));
  const [syncedSignature, setSyncedSignature] = useState(serverSignature);
  const [dragStart, setDragStart] = useState(null);

  if (serverSignature !== syncedSignature) {
    setSyncedSignature(serverSignature);
    setColumns(toColumns(trip.itinerary));
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const days = trip.itinerary.map((entry) => ({ day: entry.day, label: formatWeekday(addDays(trip.startDate, entry.day - 1)), items: columns[dayKey(entry.day)] ?? [] }));
  const planned = new Set(trip.itinerary.flatMap((entry) => entry.items.map((item) => item.title.toLowerCase())));
  const openSuggestions = suggestions.filter((suggestion) => !planned.has(suggestion.title.toLowerCase())).slice(0, 8);

  const findContainer = (id) => (id in columns ? id : Object.keys(columns).find((key) => columns[key].some((item) => item.id === id)));

  async function run(key, request, successMessage) {
    setBusy(key);
    const result = await request();
    setBusy(null);
    if (!result.ok) return notify(result.message, "error");
    if (successMessage) notify(successMessage);
    router.refresh();
  }

  function onDragOver({ active, over }) {
    const from = findContainer(active.id);
    const to = over ? findContainer(over.id) : null;
    if (!from || !to || from === to) return;

    setColumns((previous) => {
      const moving = previous[from].find((item) => item.id === active.id);
      const target = previous[to];
      const overIndex = target.findIndex((item) => item.id === over.id);
      const insertAt = overIndex >= 0 ? overIndex : target.length;
      return {
        ...previous,
        [from]: previous[from].filter((item) => item.id !== active.id),
        [to]: [...target.slice(0, insertAt), moving, ...target.slice(insertAt)],
      };
    });
  }

  async function onDragEnd({ active, over }) {
    let next = columns;
    const container = findContainer(active.id);

    if (over && container && container === findContainer(over.id)) {
      const items = columns[container];
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      if (newIndex >= 0 && oldIndex !== newIndex) next = { ...columns, [container]: arrayMove(items, oldIndex, newIndex) };
    }

    setColumns(next);
    const changed = JSON.stringify(Object.values(next).map((items) => items.map((item) => item.id))) !== dragStart;
    setDragStart(null);
    if (!changed) return;

    const result = await apiRequest(`/api/trips/${trip.id}/items/order`, {
      method: "PUT",
      body: { days: Object.entries(next).map(([key, items]) => ({ day: Number(key.slice(4)), itemIds: items.map((item) => item.id) })) },
    });

    if (!result.ok) {
      notify(result.message, "error");
      setColumns(toColumns(trip.itinerary));
      return;
    }

    router.refresh();
  }

  async function quickAdd(suggestion) {
    const lightestDay = days.reduce((best, day) => (day.items.length < best.items.length ? day : best), days[0]);
    await run(
      `suggest-${suggestion.title}`,
      () => apiRequest(`/api/trips/${trip.id}/items`, { method: "POST", body: { day: lightestDay.day, title: suggestion.title, experienceId: suggestion.experienceId ?? null, destinationId: trip.destinationId } }),
      `Added to day ${lightestDay.day}`
    );
  }

  async function confirmDelete() {
    await run(`delete-${toDelete?.id}`, () => apiRequest(`/api/trips/${trip.id}/items/${toDelete?.id}`, { method: "DELETE" }), "Removed from your plan");
    setToDelete(null);
  }

  const move = (item, direction) => run(`move-${item.id}`, () => apiRequest(`/api/trips/${trip.id}/items/${item.id}/move`, { method: "POST", body: { direction } }));

  return (
    <div>
      {openSuggestions.length ? (
        <div className="no-print mb-8 rounded-2xl border border-brand-soft-line bg-brand-soft p-4">
          <h3 className="text-sm font-semibold text-brand-strong">Ideas from {trip.destination?.name}</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {openSuggestions.map((suggestion) => (
              <li key={suggestion.title}>
                <button
                  type="button"
                  disabled={busy === `suggest-${suggestion.title}`}
                  onClick={() => quickAdd(suggestion)}
                  className="rounded-full border border-brand-soft-line bg-surface px-3 py-1.5 text-sm text-brand-strong hover:border-brand-400 disabled:opacity-60"
                >
                  <span aria-hidden="true">＋ </span>
                  {suggestion.title}
                  <span className="sr-only"> — add to itinerary</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="no-print mb-3 text-xs text-ink-subtle">Drag the ⠿ handle to reorder or move activities between days. With a keyboard: focus the handle, press Space, use the arrow keys, then Space again.</p>

      <DndContext
        id={dndId}
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={() => setDragStart(JSON.stringify(Object.values(columns).map((items) => items.map((item) => item.id))))}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setColumns(toColumns(trip.itinerary));
          setDragStart(null);
        }}
      >
        <ol className="space-y-5">
          {days.map((day) => (
            <li key={day.day} className="print-break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-muted/60 px-4 py-2.5">
                <h3 className="font-semibold text-ink">
                  Day {day.day} <span className="font-normal text-ink-muted">· {day.label}</span>
                </h3>
                <Button size="sm" variant="ghost" className="no-print" onClick={() => setDialog({ day: day.day })}>
                  ＋ Add
                </Button>
              </div>
              <SortableContext id={dayKey(day.day)} items={day.items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <DayDropZone id={dayKey(day.day)} isEmpty={!day.items.length}>
                  {day.items.length ? (
                    day.items.map((item, index) => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        index={index}
                        count={day.items.length}
                        busy={Boolean(busy)}
                        onMove={move}
                        onEdit={(entry) => setDialog({ item: entry })}
                        onRemove={setToDelete}
                      />
                    ))
                  ) : (
                    <li className="px-4 py-4 text-sm text-ink-subtle">Nothing planned yet — drop an activity here, or enjoy a free day.</li>
                  )}
                </DayDropZone>
              </SortableContext>
            </li>
          ))}
        </ol>
      </DndContext>

      <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} title={dialog?.item ? "Edit activity" : "Add to your plan"}>
        {dialog ? (
          <ItemForm
            tripId={trip.id}
            days={days}
            item={dialog.item}
            defaultDay={dialog.day}
            experiences={experiences}
            destinationId={trip.destinationId}
            onDone={() => setDialog(null)}
          />
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        pending={Boolean(busy)}
        title="Remove this activity?"
        description={toDelete ? `“${toDelete.title}” will be removed from day ${toDelete.day}.` : ""}
        confirmLabel="Remove"
      />
    </div>
  );
}
