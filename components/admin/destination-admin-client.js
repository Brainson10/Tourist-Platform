"use client";

import { useMemo, useState } from "react";

const emptyForm = {
  id: "",
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  fullDescription: "",
  villageId: "",
  villageName: "",
  district: "",
  state: "",
  latitude: "",
  longitude: "",
  bestSeason: "",
  openingHours: "",
  estimatedDuration: "",
  entryFee: "",
  accessibility: "",
  safetyInfo: "",
  coverImage: "",
  heroImage: "",
  tags: "",
  galleryImages: "",
  categoryIds: [],
  history: "",
  culture: "",
  religion: "",
  traditions: "",
  language: "",
  food: "",
  thingsToDo: "",
  nearbyAttractions: "",
  transportation: "",
  hotels: [],
  homestays: [],
  emergencyContacts: [],
  hiddenGems: "",
  isFeatured: false,
};

function toCsv(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function normalizeRecordList(value) {
  return Array.isArray(value) ? value : [];
}

function createStayRecord() {
  return {
    name: "",
    type: "",
    contact: "",
    address: "",
    note: "",
  };
}

function createEmergencyRecord() {
  return {
    label: "",
    value: "",
    availableHours: "",
    note: "",
  };
}

function fromDestination(destination) {
  const categoryIds = destination.categoryObjects?.map((category) => category.id) ?? [];

  return {
    ...emptyForm,
    id: destination.id,
    name: destination.name ?? "",
    slug: destination.slug ?? "",
    description: destination.description ?? "",
    shortDescription: destination.shortDescription ?? "",
    fullDescription: destination.fullDescription ?? "",
    villageId: destination.villageId ?? "",
    villageName: destination.village?.name ?? "",
    district: destination.district ?? destination.village?.district ?? "",
    state: destination.state ?? destination.village?.state ?? "",
    latitude: destination.latitude ?? "",
    longitude: destination.longitude ?? "",
    bestSeason: destination.bestSeason ?? "",
    openingHours: destination.openingHours ?? "",
    estimatedDuration: destination.estimatedDuration ?? "",
    entryFee: destination.entryFee ?? "",
    accessibility: destination.accessibility ?? "",
    safetyInfo: destination.safetyInfo ?? "",
    coverImage: destination.coverImage ?? "",
    heroImage: destination.heroImage ?? "",
    tags: toCsv(destination.tags),
    galleryImages: toCsv(destination.galleryImages),
    categoryIds,
    history: destination.history ?? "",
    culture: destination.culture ?? "",
    religion: destination.religion ?? "",
    traditions: destination.traditions ?? "",
    language: destination.language ?? "",
    food: destination.food ?? "",
    thingsToDo: toCsv(destination.thingsToDo),
    nearbyAttractions: toCsv(destination.nearbyAttractions),
    transportation: destination.transportation ?? "",
    hotels: normalizeRecordList(destination.hotels),
    homestays: normalizeRecordList(destination.homestays),
    emergencyContacts: normalizeRecordList(destination.emergencyContacts),
    hiddenGems: toCsv(destination.hiddenGems),
    isFeatured: Boolean(destination.isFeatured),
  };
}

function splitCsv(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanRecord(record) {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]).filter(([, value]) => value));
}

function cleanRecordList(records) {
  const cleanedRecords = records.map(cleanRecord).filter((record) => Object.keys(record).length);

  return cleanedRecords.length ? cleanedRecords : undefined;
}

function buildPayload(form) {
  return {
    name: form.name,
    slug: form.slug,
    description: form.description,
    shortDescription: form.shortDescription,
    fullDescription: form.fullDescription,
    villageId: form.villageId || undefined,
    villageName: form.villageId ? undefined : form.villageName,
    district: form.district,
    state: form.state,
    latitude: Number(form.latitude),
    longitude: Number(form.longitude),
    bestSeason: form.bestSeason || undefined,
    openingHours: form.openingHours || undefined,
    estimatedDuration: form.estimatedDuration || undefined,
    entryFee: form.entryFee || undefined,
    accessibility: form.accessibility || undefined,
    safetyInfo: form.safetyInfo || undefined,
    coverImage: form.coverImage || undefined,
    heroImage: form.heroImage || undefined,
    tags: splitCsv(form.tags),
    galleryImages: splitCsv(form.galleryImages),
    categoryIds: form.categoryIds,
    history: form.history || undefined,
    culture: form.culture || undefined,
    religion: form.religion || undefined,
    traditions: form.traditions || undefined,
    language: form.language || undefined,
    food: form.food || undefined,
    thingsToDo: splitCsv(form.thingsToDo),
    nearbyAttractions: splitCsv(form.nearbyAttractions),
    transportation: form.transportation || undefined,
    hotels: cleanRecordList(form.hotels),
    homestays: cleanRecordList(form.homestays),
    emergencyContacts: cleanRecordList(form.emergencyContacts),
    hiddenGems: splitCsv(form.hiddenGems),
    isFeatured: form.isFeatured,
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Field({ id, label, value, onChange, required = false, type = "text", placeholder = "", list, readOnly = false }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        list={list}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}

function TextArea({ id, label, value, onChange, required = false, rows = 4, placeholder = "" }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        required={required}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}

function SelectField({ id, label, value, onChange, required = false, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
      >
        {children}
      </select>
    </div>
  );
}

function StatusMessage({ type, message }) {
  if (!message) {
    return null;
  }

  const classes =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return <p className={`rounded-lg border px-4 py-3 text-sm font-medium ${classes}`}>{message}</p>;
}

function StructuredRecordEditor({ title, description, records, emptyRecord, fields, onChange }) {
  const editorId = slugify(title);

  function updateRecord(index, field, value) {
    onChange(records.map((record, recordIndex) => (recordIndex === index ? { ...record, [field]: value } : record)));
  }

  function addRecord() {
    onChange([...records, emptyRecord()]);
  }

  function removeRecord(index) {
    onChange(records.filter((_, recordIndex) => recordIndex !== index));
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={addRecord}
          className="inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Add
        </button>
      </div>

      {records.length ? (
        <div className="mt-4 space-y-3">
          {records.map((record, index) => (
            <div key={index} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="grid gap-3 md:grid-cols-2">
                {fields.map((field) => (
                  <Field
                    key={field.name}
                    id={`${editorId}-${index}-${field.name}`}
                    label={field.label}
                    value={record[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(value) => updateRecord(index, field.name, value)}
                  />
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRecord(index)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-600">
          No records added yet.
        </div>
      )}
    </section>
  );
}

export function DestinationAdminClient({ initialDestinations, villages, categories }) {
  const [destinations, setDestinations] = useState(initialDestinations);
  const [form, setForm] = useState(initialDestinations[0] ? fromDestination(initialDestinations[0]) : emptyForm);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedDestination = destinations.find((destination) => destination.id === form.id);
  const featuredCount = destinations.filter((destination) => destination.isFeatured).length;
  const districtCount = new Set(destinations.map((destination) => destination.district).filter(Boolean)).size;
  const filteredDestinations = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return destinations;
    }

    return destinations.filter((destination) =>
      [destination.name, destination.slug, destination.district, destination.village?.name].filter(Boolean).some((value) => value.toLowerCase().includes(search))
    );
  }, [destinations, query]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function selectDestination(destination) {
    setForm(fromDestination(destination));
    setStatus({ type: "", message: "" });
  }

  function startNewDestination() {
    setForm(emptyForm);
    setStatus({ type: "", message: "" });
  }

  function updateName(value) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: current.slug || slugify(value),
    }));
  }

  function selectVillage(villageId) {
    const village = villages.find((item) => item.id === villageId);

    setForm((current) => ({
      ...current,
      villageId,
      villageName: village?.name ?? "",
      district: village?.district ?? "",
      state: village?.state ?? "",
      latitude: village?.latitude ?? current.latitude,
      longitude: village?.longitude ?? current.longitude,
    }));
  }

  async function saveDestination(event) {
    event.preventDefault();
    setIsSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = buildPayload(form);
      const endpoint = form.id ? `/api/destinations/${form.id}` : "/api/destinations";
      const method = form.id ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message ?? "Destination could not be saved");
      }

      const savedDestination = result.data;

      setDestinations((current) => {
        if (form.id) {
          return current.map((destination) => (destination.id === savedDestination.id ? savedDestination : destination));
        }

        return [savedDestination, ...current];
      });
      setForm(fromDestination(savedDestination));
      setStatus({ type: "success", message: "Destination saved to the database." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteSelectedDestination() {
    if (!form.id || !selectedDestination) {
      return;
    }

    setIsDeleting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(`/api/destinations/${form.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message ?? "Destination could not be deleted");
      }

      setDestinations((current) => current.filter((destination) => destination.id !== form.id));
      setForm(emptyForm);
      setStatus({ type: "success", message: "Destination deleted from the database." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <aside className="self-start rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Destinations</h2>
            <p className="mt-1 text-sm text-slate-600">{destinations.length} records</p>
          </div>
          <button
            type="button"
            onClick={startNewDestination}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            New
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-lg font-semibold text-slate-950">{destinations.length}</p>
            <p className="text-xs text-slate-600">Records</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-lg font-semibold text-emerald-900">{featuredCount}</p>
            <p className="text-xs text-emerald-800">Featured</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3">
            <p className="text-lg font-semibold text-amber-900">{districtCount}</p>
            <p className="text-xs text-amber-800">Districts</p>
          </div>
        </div>

        <label htmlFor="destination-search" className="sr-only">
          Search destinations
        </label>
        <input
          id="destination-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, slug, district"
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        />

        <div className="mt-4 max-h-[680px] space-y-2 overflow-y-auto pr-1">
          {filteredDestinations.length ? (
            filteredDestinations.map((destination) => (
              <button
                key={destination.id}
                type="button"
                onClick={() => selectDestination(destination)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  destination.id === form.id ? "border-emerald-700 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="block text-sm font-semibold text-slate-950">{destination.name}</span>
                  {destination.isFeatured ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Featured</span> : null}
                </span>
                <span className="mt-1 block text-xs text-slate-600">
                  {[destination.village?.name, destination.district].filter(Boolean).join(", ") || destination.slug}
                </span>
              </button>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
              No destinations match this search.
            </div>
          )}
        </div>
      </aside>

      <form onSubmit={saveDestination} className="space-y-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{form.id ? "Edit destination" : "Create destination"}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">{form.name || "Untitled destination"}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Save changes through the admin API so the destination intelligence record is persisted in PostgreSQL.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={deleteSelectedDestination}
              disabled={!form.id || isDeleting}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <StatusMessage type={status.type} message={status.message} />

        <section className="grid gap-4 md:grid-cols-2">
          <Field id="name" label="Name" value={form.name} required onChange={updateName} />
          <Field id="slug" label="Slug" value={form.slug} required onChange={(value) => updateField("slug", value)} />
          <SelectField id="villageId" label="Village" value={form.villageId} required onChange={selectVillage}>
            <option value="">Select a managed village</option>
            {villages.map((village) => (
              <option key={village.id} value={village.id}>
                {village.name} - {village.district}, {village.state}
              </option>
            ))}
          </SelectField>
          <Field id="district" label="District" value={form.district} required readOnly placeholder="Auto-filled from village" onChange={() => {}} />
          <Field id="state" label="State" value={form.state} required readOnly placeholder="Auto-filled from village" onChange={() => {}} />
          <label className="mt-8 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) => updateField("isFeatured", event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-700"
            />
            Featured destination
          </label>
          <Field id="latitude" label="Latitude" value={form.latitude} required type="number" onChange={(value) => updateField("latitude", value)} />
          <Field id="longitude" label="Longitude" value={form.longitude} required type="number" onChange={(value) => updateField("longitude", value)} />
          <Field id="coverImage" label="Cover image URL" value={form.coverImage} onChange={(value) => updateField("coverImage", value)} />
          <Field id="heroImage" label="Hero image URL" value={form.heroImage} onChange={(value) => updateField("heroImage", value)} />
        </section>

        <section className="grid gap-4">
          <TextArea id="shortDescription" label="Short description" value={form.shortDescription} required rows={3} onChange={(value) => updateField("shortDescription", value)} />
          <TextArea id="description" label="Overview description" value={form.description} required rows={4} onChange={(value) => updateField("description", value)} />
          <TextArea id="fullDescription" label="Full description" value={form.fullDescription} required rows={5} onChange={(value) => updateField("fullDescription", value)} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Field id="bestSeason" label="Best season" value={form.bestSeason} onChange={(value) => updateField("bestSeason", value)} />
          <Field id="openingHours" label="Opening hours" value={form.openingHours} onChange={(value) => updateField("openingHours", value)} />
          <Field id="estimatedDuration" label="Estimated duration" value={form.estimatedDuration} onChange={(value) => updateField("estimatedDuration", value)} />
          <Field id="entryFee" label="Entry fee" value={form.entryFee} onChange={(value) => updateField("entryFee", value)} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <TextArea id="history" label="History" value={form.history} onChange={(value) => updateField("history", value)} />
          <TextArea id="culture" label="Culture" value={form.culture} onChange={(value) => updateField("culture", value)} />
          <TextArea id="religion" label="Religion" value={form.religion} onChange={(value) => updateField("religion", value)} />
          <TextArea id="traditions" label="Traditions" value={form.traditions} onChange={(value) => updateField("traditions", value)} />
          <TextArea id="language" label="Language" value={form.language} onChange={(value) => updateField("language", value)} />
          <TextArea id="food" label="Food" value={form.food} onChange={(value) => updateField("food", value)} />
          <TextArea id="transportation" label="Transportation" value={form.transportation} onChange={(value) => updateField("transportation", value)} />
          <TextArea id="accessibility" label="Accessibility" value={form.accessibility} onChange={(value) => updateField("accessibility", value)} />
          <TextArea id="safetyInfo" label="Safety information" value={form.safetyInfo} onChange={(value) => updateField("safetyInfo", value)} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <TextArea id="tags" label="Tags" value={form.tags} placeholder="nature, culture, photography" onChange={(value) => updateField("tags", value)} />
          <TextArea id="galleryImages" label="Gallery image URLs" value={form.galleryImages} placeholder="https://..., https://..." onChange={(value) => updateField("galleryImages", value)} />
          <TextArea id="thingsToDo" label="Things to do" value={form.thingsToDo} onChange={(value) => updateField("thingsToDo", value)} />
          <TextArea id="nearbyAttractions" label="Nearby attractions" value={form.nearbyAttractions} onChange={(value) => updateField("nearbyAttractions", value)} />
          <TextArea id="hiddenGems" label="Hidden gems" value={form.hiddenGems} onChange={(value) => updateField("hiddenGems", value)} />
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-800">Categories</h3>
          {categories.length ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const checked = form.categoryIds.includes(category.id);

                return (
                  <label key={category.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        updateField(
                          "categoryIds",
                          event.target.checked
                            ? [...form.categoryIds, category.id]
                            : form.categoryIds.filter((categoryId) => categoryId !== category.id)
                        );
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-700"
                    />
                    {category.name}
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
              No categories are available in the database yet.
            </p>
          )}
        </section>

        <section className="grid gap-4">
          <StructuredRecordEditor
            title="Hotels"
            description="Add verified hotels or guesthouses that a traveler can use while planning this destination."
            records={form.hotels}
            emptyRecord={createStayRecord}
            fields={[
              { name: "name", label: "Hotel name", placeholder: "Loktak Lake View Stay" },
              { name: "type", label: "Type", placeholder: "Hotel, resort, guesthouse" },
              { name: "contact", label: "Contact", placeholder: "+91..." },
              { name: "address", label: "Address", placeholder: "Nearest town or landmark" },
              { name: "note", label: "Note", placeholder: "Family friendly, lake view, budget stay" },
            ]}
            onChange={(records) => updateField("hotels", records)}
          />
          <StructuredRecordEditor
            title="Homestays"
            description="Add community stays, village stays, and local host options that support responsible tourism."
            records={form.homestays}
            emptyRecord={createStayRecord}
            fields={[
              { name: "name", label: "Homestay name", placeholder: "Thanga Community Homestay" },
              { name: "type", label: "Type", placeholder: "Homestay, farm stay, eco stay" },
              { name: "contact", label: "Contact", placeholder: "+91..." },
              { name: "address", label: "Address", placeholder: "Village or locality" },
              { name: "note", label: "Note", placeholder: "Local meals, guide support, family rooms" },
            ]}
            onChange={(records) => updateField("homestays", records)}
          />
          <StructuredRecordEditor
            title="Emergency Contacts"
            description="Add traveler safety contacts in a simple format for offline guides and destination pages."
            records={form.emergencyContacts}
            emptyRecord={createEmergencyRecord}
            fields={[
              { name: "label", label: "Contact name", placeholder: "Emergency, Police, Tourist office" },
              { name: "value", label: "Phone or detail", placeholder: "112" },
              { name: "availableHours", label: "Available hours", placeholder: "24 hours" },
              { name: "note", label: "Note", placeholder: "Use for medical, route, or local support" },
            ]}
            onChange={(records) => updateField("emergencyContacts", records)}
          />
        </section>
      </form>
    </div>
  );
}
