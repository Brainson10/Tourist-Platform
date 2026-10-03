"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckboxChips } from "@/components/admin/checkbox-chips";
import { FormSection } from "@/components/admin/form-section";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { RecordListEditor } from "@/components/admin/record-list-editor";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";
import { MONTH_SHORT, parseBestMonths } from "@/lib/utils/months";
import { slugify } from "@/lib/utils/slugify";

const LIST_FIELDS = ["thingsToDo", "hiddenGems", "nearbyAttractions", "tags"];
const STAY_FIELDS = [
  { name: "name", label: "Name", required: true },
  { name: "type", label: "Type", placeholder: "Hotel, homestay, eco-lodge…" },
  { name: "contact", label: "Phone or website" },
  { name: "address", label: "Address or area" },
  { name: "note", label: "Note" },
];
const EMERGENCY_FIELDS = [
  { name: "label", label: "Label", required: true, placeholder: "District hospital" },
  { name: "value", label: "Number or detail", required: true, placeholder: "+91 …" },
  { name: "note", label: "Note" },
];

function toFormValues(destination) {
  const values = {
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    villageId: "",
    latitude: "",
    longitude: "",
    coverImage: "",
    photos: [],
    bestMonths: [],
    categoryIds: [],
    bestSeason: "",
    openingHours: "",
    estimatedDuration: "",
    entryFee: "",
    accessibility: "",
    safetyInfo: "",
    transportation: "",
    history: "",
    culture: "",
    religion: "",
    traditions: "",
    language: "",
    food: "",
    hotels: [],
    homestays: [],
    emergencyContacts: [],
    isFeatured: false,
    ...LIST_FIELDS.reduce((all, field) => ({ ...all, [field]: "" }), {}),
  };

  if (!destination) return values;

  for (const key of Object.keys(values)) {
    if (destination[key] !== undefined && destination[key] !== null) values[key] = destination[key];
  }

  for (const field of LIST_FIELDS) values[field] = (destination[field] ?? []).join("\n");
  values.photos = destination.photos.map((photo) => ({ url: photo.imageUrl, caption: photo.caption ?? "" }));
  values.categoryIds = destination.categories.map((category) => category.id);
  return values;
}

function toPayload(values) {
  const lines = (text) => text.split("\n").map((line) => line.trim()).filter(Boolean);
  const records = (list) => list.filter((record) => Object.values(record).some((value) => String(value ?? "").trim()));

  return {
    ...values,
    latitude: values.latitude === "" ? undefined : Number(values.latitude),
    longitude: values.longitude === "" ? undefined : Number(values.longitude),
    ...Object.fromEntries(LIST_FIELDS.map((field) => [field, lines(values[field])])),
    hotels: records(values.hotels),
    homestays: records(values.homestays),
    emergencyContacts: records(values.emergencyContacts),
  };
}

export function DestinationForm({ destination, villages, categories }) {
  const [values, setValues] = useState(() => toFormValues(destination));
  const [slugTouched, setSlugTouched] = useState(Boolean(destination));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { notify } = useToast();
  const router = useRouter();
  const village = villages.find((item) => item.id === values.villageId);

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value, ...(name === "name" && !slugTouched ? { slug: slugify(value) } : {}) }));
  }

  function selectVillage(villageId) {
    const selected = villages.find((item) => item.id === villageId);
    setValues((current) => ({
      ...current,
      villageId,
      // Pre-fill coordinates from the village the first time; admins can refine them.
      ...(selected && current.latitude === "" && current.longitude === "" ? { latitude: selected.latitude, longitude: selected.longitude } : {}),
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setFormError("");
    const result = await apiRequest(destination ? `/api/admin/destinations/${destination?.id}` : "/api/admin/destinations", {
      method: destination ? "PUT" : "POST",
      body: toPayload(values),
    });
    setPending(false);

    if (!result.ok) {
      setErrors(result.fieldErrors);
      setFormError(Object.keys(result.fieldErrors).length ? "Some fields need attention — see the highlighted messages below." : result.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrors({});
    notify(destination ? "Destination saved" : "Destination created");

    if (destination) {
      router.refresh();
    } else {
      router.push(`/admin/destinations/${result.data.id}`);
    }
  }

  async function remove() {
    setPending(true);
    const result = await apiRequest(`/api/admin/destinations/${destination?.id}`, { method: "DELETE" });
    setPending(false);
    setConfirmDelete(false);

    if (!result.ok) {
      notify(result.message, "error");
      return;
    }

    notify("Destination deleted");
    router.push("/admin/destinations");
    router.refresh();
  }

  const text = (name, label, props = {}) => (
    <Field id={`d-${name}`} label={label} error={errors[name]} required={props.required} hint={props.hint} className={props.half ? "" : "sm:col-span-2"}>
      {(aria) =>
        props.rows ? (
          <Textarea {...aria} rows={props.rows} value={values[name] ?? ""} onChange={(event) => update(name, event.target.value)} placeholder={props.placeholder} />
        ) : (
          <Input {...aria} type={props.type ?? "text"} step={props.step} value={values[name] ?? ""} onChange={(event) => update(name, event.target.value)} placeholder={props.placeholder} />
        )
      }
    </Field>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <FormMessage>{formError}</FormMessage>

      <FormSection title="Basics" description="The name, where it is, and how travelers will find it.">
        {text("name", "Name", { required: true, half: true })}
        <Field id="d-slug" label="URL slug" required error={errors.slug} hint={`/destinations/${values.slug || "…"}`}>
          {(aria) => (
            <Input
              {...aria}
              value={values.slug}
              onChange={(event) => {
                setSlugTouched(true);
                update("slug", slugify(event.target.value));
              }}
            />
          )}
        </Field>
        <Field id="d-village" label="Village or town" required error={errors.villageId} className="sm:col-span-2" hint={village ? `District and state are taken from the village: ${village.district}, ${village.state}` : "Add missing villages under Villages first."}>
          {(aria) => (
            <Select {...aria} value={values.villageId} onChange={(event) => selectVillage(event.target.value)}>
              <option value="">Choose a village…</option>
              {villages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.district}, {item.state}
                </option>
              ))}
            </Select>
          )}
        </Field>
        {text("latitude", "Latitude", { required: true, half: true, type: "number", step: "any", hint: "Exact point of the destination" })}
        {text("longitude", "Longitude", { required: true, half: true, type: "number", step: "any" })}
        <CheckboxChips
          legend="Categories"
          options={categories.map((category) => ({ value: category.id, label: category.name }))}
          selected={values.categoryIds}
          onChange={(categoryIds) => update("categoryIds", categoryIds)}
          error={errors.categoryIds}
        />
        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input type="checkbox" checked={values.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)} className="h-4 w-4 accent-brand-700" />
          Feature this destination on the home page
        </label>
      </FormSection>

      <FormSection title="Description">
        {text("shortDescription", "Short summary", { required: true, rows: 2, hint: "One or two sentences shown on cards and at the top of the page (max 280 characters)." })}
        {text("description", "Full description", { required: true, rows: 7, hint: "Separate paragraphs with a blank line." })}
      </FormSection>

      <FormSection title="Photos" description="The cover appears on cards and at the top of the page. Gallery photos show in the order below — drag to rearrange.">
        <div className="sm:col-span-2">
          <ImageUrlField id="d-cover" label="Cover image" folder="destinations" value={values.coverImage} onChange={(value) => update("coverImage", value)} error={errors.coverImage} />
        </div>
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium text-ink">Gallery</p>
          <GalleryEditor
            photos={values.photos}
            onChange={(photos) => update("photos", photos)}
            coverImage={values.coverImage}
            onCoverChange={(url) => update("coverImage", url)}
            error={errors.photos}
          />
        </div>
      </FormSection>

      <FormSection title="Visitor information">
        {text("bestSeason", "Best time to visit", { half: true, placeholder: "October to April" })}
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-ink">Best months</legend>
          <p className="text-xs text-ink-subtle">Powers the “When to go” calendar and the home page’s “Best right now”.</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {MONTH_SHORT.map((label, index) => {
              const month = index + 1;
              const selected = values.bestMonths.includes(month);
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => update("bestMonths", selected ? values.bestMonths.filter((item) => item !== month) : [...values.bestMonths, month])}
                  className={`h-8 w-12 rounded-lg border text-xs font-medium transition-colors ${selected ? "border-brand-700 bg-brand-700 text-white" : "border-line-strong bg-surface text-ink-muted hover:text-ink"}`}
                >
                  {label}
                </button>
              );
            })}
            <Button size="sm" variant="ghost" onClick={() => update("bestMonths", parseBestMonths(values.bestSeason))} disabled={!values.bestSeason}>
              Fill from text
            </Button>
          </div>
        </fieldset>
        {text("estimatedDuration", "Time needed", { half: true, placeholder: "1–2 days" })}
        {text("openingHours", "Opening hours", { half: true })}
        {text("entryFee", "Entry fee", { half: true })}
        {text("transportation", "Getting there", { rows: 3 })}
        {text("accessibility", "Accessibility", { rows: 2 })}
        {text("safetyInfo", "Safety tips", { rows: 3, hint: "Weather, terrain, permits, local rules — anything travelers should know before going." })}
      </FormSection>

      <FormSection title="Things to do" description="One item per line.">
        {text("thingsToDo", "Things to do", { rows: 5 })}
        {text("hiddenGems", "Hidden gems", { rows: 3 })}
        {text("nearbyAttractions", "Nearby attractions", { rows: 3 })}
        {text("tags", "Search keywords", { rows: 2, hint: "Extra words people might search for, e.g. rhino, safari, unesco" })}
      </FormSection>

      <FormSection title="Food, culture & history">
        {text("food", "Food to try", { rows: 3 })}
        {text("history", "History", { rows: 4 })}
        {text("culture", "Culture", { rows: 3 })}
        {text("religion", "Religion & beliefs", { rows: 2 })}
        {text("traditions", "Traditions & etiquette", { rows: 2 })}
        {text("language", "Language", { rows: 2 })}
      </FormSection>

      <FormSection title="Stays & emergency contacts">
        <div className="sm:col-span-2">
          <RecordListEditor legend="Hotels" fields={STAY_FIELDS} records={values.hotels} onChange={(records) => update("hotels", records)} emptyRecord={{ name: "", type: "Hotel" }} addLabel="Add hotel" />
          {errors.hotels ? <p className="mt-1 text-xs font-medium text-danger-ink">Each hotel needs a name.</p> : null}
        </div>
        <div className="sm:col-span-2">
          <RecordListEditor legend="Homestays" fields={STAY_FIELDS} records={values.homestays} onChange={(records) => update("homestays", records)} emptyRecord={{ name: "", type: "Homestay" }} addLabel="Add homestay" />
          {errors.homestays ? <p className="mt-1 text-xs font-medium text-danger-ink">Each homestay needs a name.</p> : null}
        </div>
        <div className="sm:col-span-2">
          <RecordListEditor
            legend="Emergency contacts"
            fields={EMERGENCY_FIELDS}
            records={values.emergencyContacts}
            onChange={(records) => update("emergencyContacts", records)}
            emptyRecord={{ label: "", value: "" }}
            addLabel="Add contact"
          />
          {errors.emergencyContacts ? <p className="mt-1 text-xs font-medium text-danger-ink">Each contact needs a label and a number.</p> : null}
        </div>
      </FormSection>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : destination ? "Save changes" : "Create destination"}
          </Button>
          <ButtonLink href="/admin/destinations" variant="secondary">
            Cancel
          </ButtonLink>
        </div>
        {destination ? (
          <div className="flex gap-2">
            <ButtonLink href={`/destinations/${destination.slug}`} variant="ghost" target="_blank">
              View live page ↗
            </ButtonLink>
            <Button variant="danger-ghost" onClick={() => setConfirmDelete(true)} disabled={pending}>
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      {destination ? (
        <ConfirmDialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={remove}
          pending={pending}
          title="Delete this destination?"
          description={`“${destination.name}” and its photos, experiences, festivals, stories and reviews will be permanently deleted. Trips that include it will keep their other details, and its souvenirs stay listed without it.`}
        />
      ) : null}
    </form>
  );
}
