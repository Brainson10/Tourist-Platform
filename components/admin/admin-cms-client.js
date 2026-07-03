"use client";

import { useMemo, useState } from "react";
import { DestinationAdminClient } from "@/components/admin/destination-admin-client";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "destinations", label: "Destinations" },
  { key: "villages", label: "Villages" },
  { key: "categories", label: "Categories" },
  { key: "festivals", label: "Festivals" },
  { key: "experiences", label: "Experiences" },
  { key: "stories", label: "Stories" },
  { key: "reviews", label: "Reviews" },
  { key: "users", label: "Users" },
  { key: "settings", label: "Settings" },
];

const EXPERIENCE_CATEGORIES = ["ADVENTURE", "CULTURE", "FOOD", "NATURE", "FESTIVAL", "WILDLIFE", "SPIRITUAL"];
const USER_ROLES = ["TOURIST", "ADMIN", "GUIDE", "GOVERNMENT"];
const REVIEW_STATUSES = ["PENDING", "APPROVED", "HIDDEN"];

const CONFIG = {
  villages: {
    title: "Village Management",
    description: "Maintain village intelligence that powers destination location data.",
    endpoint: "/api/admin/villages",
    primary: "name",
    secondary: (item) => [item.district, item.state].filter(Boolean).join(", "),
    empty: { name: "", district: "", state: "Manipur", pincode: "", description: "", latitude: "", longitude: "" },
    fields: [
      { name: "name", label: "Village name", required: true },
      { name: "district", label: "District", required: true },
      { name: "state", label: "State", required: true },
      { name: "pincode", label: "Pincode" },
      { name: "latitude", label: "Latitude", type: "number", required: true },
      { name: "longitude", label: "Longitude", type: "number", required: true },
      { name: "description", label: "Description", kind: "textarea" },
    ],
    filters: [{ name: "district", label: "District" }],
  },
  categories: {
    title: "Category Management",
    description: "Organize destinations into reusable discovery categories.",
    endpoint: "/api/admin/categories",
    primary: "name",
    secondary: (item) => item.slug,
    empty: { name: "", slug: "", icon: "", description: "" },
    fields: [
      { name: "name", label: "Category name", required: true, slugTarget: "slug" },
      { name: "slug", label: "Slug", required: true },
      { name: "icon", label: "Icon" },
      { name: "description", label: "Description", kind: "textarea" },
    ],
  },
  festivals: {
    title: "Festival Management",
    description: "Publish seasonal cultural intelligence connected to destinations.",
    endpoint: "/api/admin/festivals",
    primary: "title",
    secondary: (item) => item.destination?.name ?? item.category,
    empty: { destinationId: "", title: "", slug: "", description: "", imageUrl: "", category: "FESTIVAL", startDate: "", endDate: "", isFeatured: false },
    fields: [
      { name: "destinationId", label: "Destination", kind: "destination", required: true },
      { name: "title", label: "Festival title", required: true, slugTarget: "slug" },
      { name: "slug", label: "Slug", required: true },
      { name: "category", label: "Category", kind: "select", options: EXPERIENCE_CATEGORIES },
      { name: "startDate", label: "Start date", type: "date", required: true },
      { name: "endDate", label: "End date", type: "date", required: true },
      { name: "imageUrl", label: "Image URL", required: true },
      { name: "isFeatured", label: "Featured festival", kind: "checkbox" },
      { name: "description", label: "Description", kind: "textarea", required: true },
    ],
    filters: [{ name: "category", label: "Category", options: EXPERIENCE_CATEGORIES }],
  },
  experiences: {
    title: "Experience Management",
    description: "Maintain bookable or discoverable activities for travel planning.",
    endpoint: "/api/admin/experiences",
    primary: "title",
    secondary: (item) => [item.destination?.name, item.category].filter(Boolean).join(" - "),
    empty: { destinationId: "", title: "", description: "", category: "NATURE", difficulty: "", duration: "", price: "" },
    fields: [
      { name: "destinationId", label: "Destination", kind: "destination", required: true },
      { name: "title", label: "Experience title", required: true },
      { name: "category", label: "Category", kind: "select", options: EXPERIENCE_CATEGORIES },
      { name: "difficulty", label: "Difficulty", required: true },
      { name: "duration", label: "Duration", required: true },
      { name: "price", label: "Price", type: "number", required: true },
      { name: "description", label: "Description", kind: "textarea", required: true },
    ],
    filters: [{ name: "category", label: "Category", options: EXPERIENCE_CATEGORIES }],
  },
  stories: {
    title: "Story Management",
    description: "Curate local stories, oral history, and cultural context.",
    endpoint: "/api/admin/stories",
    primary: "title",
    secondary: (item) => [item.destination?.name, item.language].filter(Boolean).join(" - "),
    empty: { destinationId: "", title: "", language: "English", content: "" },
    fields: [
      { name: "destinationId", label: "Destination", kind: "destination", required: true },
      { name: "title", label: "Story title", required: true },
      { name: "language", label: "Language", required: true },
      { name: "content", label: "Content", kind: "textarea", required: true },
    ],
  },
  reviews: {
    title: "Review Moderation",
    description: "Approve, hide, or remove destination reviews.",
    endpoint: "/api/admin/reviews",
    primary: (item) => item.title || `${item.rating}-star review`,
    secondary: (item) => [item.destination?.name, item.user?.fullName, item.status].filter(Boolean).join(" - "),
    empty: { status: "PENDING" },
    readonly: true,
    actions: "review",
    filters: [{ name: "status", label: "Status", options: REVIEW_STATUSES }],
  },
  users: {
    title: "User Management",
    description: "View users, change roles, and block or unblock accounts.",
    endpoint: "/api/admin/users",
    primary: "fullName",
    secondary: (item) => [item.email, item.role, item.isBlocked ? "Blocked" : "Active"].filter(Boolean).join(" - "),
    empty: { role: "TOURIST", isBlocked: false },
    fields: [
      { name: "role", label: "Role", kind: "select", options: USER_ROLES },
      { name: "isBlocked", label: "Blocked account", kind: "checkbox" },
    ],
    noCreate: true,
    noDelete: true,
    filters: [{ name: "role", label: "Role", options: USER_ROLES }],
  },
  settings: {
    title: "Settings",
    description: "Configure operational platform defaults for admin workflows.",
    endpoint: "/api/admin/settings",
    primary: "platformName",
    secondary: (item) => item.supportEmail,
    empty: { platformName: "", supportEmail: "", defaultState: "", emergencyHelpline: "" },
    fields: [
      { name: "platformName", label: "Platform name", required: true },
      { name: "supportEmail", label: "Support email", type: "email", required: true },
      { name: "defaultState", label: "Default state", required: true },
      { name: "emergencyHelpline", label: "Emergency helpline", required: true },
    ],
    singleton: true,
    noDelete: true,
  },
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toInputDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function normalizeItem(resource, item) {
  if (!item) {
    return { ...CONFIG[resource].empty };
  }

  if (resource === "festivals") {
    return {
      ...CONFIG[resource].empty,
      ...item,
      startDate: toInputDate(item.startDate),
      endDate: toInputDate(item.endDate),
    };
  }

  return { ...CONFIG[resource].empty, ...item };
}

function cleanPayload(resource, form) {
  const config = CONFIG[resource];
  const payload = {};

  for (const field of config.fields ?? []) {
    const value = form[field.name];

    if (field.kind === "checkbox") {
      payload[field.name] = Boolean(value);
    } else if (field.type === "number") {
      payload[field.name] = value === "" ? undefined : Number(value);
    } else if (value !== undefined) {
      payload[field.name] = typeof value === "string" ? value.trim() : value;
    }
  }

  return payload;
}

function getTitle(config, item) {
  if (typeof config.primary === "function") {
    return config.primary(item);
  }

  return item?.[config.primary] ?? "Untitled";
}

function Toast({ toast, onClose }) {
  if (!toast.message) {
    return null;
  }

  const tone = toast.type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <div className={`fixed right-5 top-5 z-50 max-w-sm rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <p>{toast.message}</p>
        <button type="button" onClick={onClose} className="text-xs font-semibold">
          Close
        </button>
      </div>
    </div>
  );
}

function Field({ field, value, destinations, onChange }) {
  if (field.kind === "textarea") {
    return (
      <div className="md:col-span-2">
        <label htmlFor={field.name} className="text-sm font-medium text-slate-700">
          {field.label}
        </label>
        <textarea
          id={field.name}
          value={value ?? ""}
          required={field.required}
          rows={5}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
    );
  }

  if (field.kind === "select" || field.kind === "destination") {
    const options = field.kind === "destination" ? destinations.map((destination) => ({ value: destination.id, label: destination.name })) : field.options.map((option) => ({ value: option, label: option }));

    return (
      <div>
        <label htmlFor={field.name} className="text-sm font-medium text-slate-700">
          {field.label}
        </label>
        <select
          id={field.name}
          value={value ?? ""}
          required={field.required}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Select {field.label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.kind === "checkbox") {
    return (
      <label className="mt-8 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-emerald-700"
        />
        {field.label}
      </label>
    );
  }

  return (
    <div>
      <label htmlFor={field.name} className="text-sm font-medium text-slate-700">
        {field.label}
      </label>
      <input
        id={field.name}
        type={field.type ?? "text"}
        value={value ?? ""}
        required={field.required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}

function Dashboard({ stats, onNavigate }) {
  const cards = [
    ["Destinations", stats.destinations, "destinations"],
    ["Villages", stats.villages, "villages"],
    ["Categories", stats.categories, "categories"],
    ["Festivals", stats.festivals, "festivals"],
    ["Experiences", stats.experiences, "experiences"],
    ["Stories", stats.stories, "stories"],
    ["Reviews", stats.reviews, "reviews"],
    ["Users", stats.users, "users"],
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Admin Dashboard</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Tourism CMS overview</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Manage the operational intelligence that supports destination discovery, experience planning, cultural storytelling, and safe travel decisions.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, key]) => (
          <button
            key={key}
            type="button"
            onClick={() => onNavigate(key)}
            className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
          >
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{value ?? 0}</p>
          </button>
        ))}
      </section>
    </div>
  );
}

function ResourceManager({ resource, initialItems, initialMeta, destinations, onToast }) {
  const config = CONFIG[resource];
  const [items, setItems] = useState(initialItems);
  const [meta, setMeta] = useState(initialMeta ?? { page: 1, limit: 10, total: initialItems.length, totalPages: 1 });
  const [form, setForm] = useState(normalizeItem(resource, config.singleton ? initialItems[0] : null));
  const [selectedId, setSelectedId] = useState(config.singleton ? "settings" : "");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedItem = items.find((item) => item.id === selectedId);

  async function loadPage(nextPage = 1) {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(meta.limit ?? 10),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      for (const [key, value] of Object.entries(filters)) {
        if (value) {
          params.set(key, value);
        }
      }

      const response = await fetch(`${config.endpoint}?${params.toString()}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message ?? "Resource could not be loaded");
      }

      setItems(result.data);
      setMeta(result.meta);
      if (config.singleton && result.data[0]) {
        setForm(normalizeItem(resource, result.data[0]));
      }
    } catch (error) {
      onToast("error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field.name]: value };

      if (field.slugTarget && !current[field.slugTarget]) {
        next[field.slugTarget] = slugify(value);
      }

      return next;
    });
  }

  function startCreate() {
    setSelectedId("");
    setForm({ ...config.empty });
  }

  function selectItem(item) {
    setSelectedId(item.id ?? "settings");
    setForm(normalizeItem(resource, item));
  }

  async function saveItem(event) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = cleanPayload(resource, form);
      const isUpdate = Boolean(selectedItem?.id) || config.singleton;
      const endpoint = isUpdate && !config.singleton ? `${config.endpoint}/${selectedItem.id}` : config.endpoint;
      const method = config.singleton ? "POST" : isUpdate ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message ?? "Resource could not be saved");
      }

      if (config.singleton) {
        setItems([result.data]);
        setForm(normalizeItem(resource, result.data));
      } else if (isUpdate) {
        setItems((current) => current.map((item) => (item.id === result.data.id ? result.data : item)));
        setForm(normalizeItem(resource, result.data));
      } else {
        setItems((current) => [result.data, ...current]);
        setSelectedId(result.data.id);
        setForm(normalizeItem(resource, result.data));
      }

      onToast("success", "Changes saved.");
    } catch (error) {
      onToast("error", error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteItem(item) {
    if (!item?.id || !window.confirm(`Delete ${getTitle(config, item)}? This cannot be undone.`)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${config.endpoint}/${item.id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message ?? "Resource could not be deleted");
      }

      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
      startCreate();
      onToast("success", "Record deleted.");
    } catch (error) {
      onToast("error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateReviewStatus(item, status) {
    setIsLoading(true);

    try {
      const response = await fetch(`${config.endpoint}/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message ?? "Review could not be moderated");
      }

      setItems((current) => current.map((currentItem) => (currentItem.id === item.id ? result.data : currentItem)));
      onToast("success", "Review updated.");
    } catch (error) {
      onToast("error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const listSummary = useMemo(() => `${meta.total ?? items.length} records`, [items.length, meta.total]);

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside className="self-start rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{config.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{listSummary}</p>
          </div>
          {!config.noCreate && !config.singleton ? (
            <button type="button" onClick={startCreate} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
              New
            </button>
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          <label htmlFor={`${resource}-search`} className="sr-only">
            Search
          </label>
          <input
            id={`${resource}-search`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search records"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          />

          {config.filters?.map((filter) =>
            filter.options ? (
              <select
                key={filter.name}
                value={filters[filter.name] ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, [filter.name]: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">All {filter.label.toLowerCase()}</option>
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                key={filter.name}
                value={filters[filter.name] ?? ""}
                onChange={(event) => setFilters((current) => ({ ...current, [filter.name]: event.target.value }))}
                placeholder={`Filter by ${filter.label.toLowerCase()}`}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              />
            )
          )}

          <button type="button" onClick={() => loadPage(1)} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
            {isLoading ? "Loading..." : "Apply filters"}
          </button>
        </div>

        <div className="mt-4 max-h-[560px] space-y-2 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : items.length ? (
            items.map((item, index) => (
              <div key={item.id ?? index} className={`rounded-lg border p-3 ${item.id === selectedId ? "border-emerald-700 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                <button type="button" onClick={() => selectItem(item)} className="w-full text-left">
                  <span className="block text-sm font-semibold text-slate-950">{getTitle(config, item)}</span>
                  <span className="mt-1 block text-xs text-slate-600">{config.secondary?.(item)}</span>
                </button>
                {config.actions === "review" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => updateReviewStatus(item, "APPROVED")} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">
                      Approve
                    </button>
                    <button type="button" onClick={() => updateReviewStatus(item, "HIDDEN")} className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-800">
                      Hide
                    </button>
                    <button type="button" onClick={() => deleteItem(item)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700">
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
              No records found.
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
          <button type="button" disabled={meta.page <= 1 || isLoading} onClick={() => loadPage(meta.page - 1)} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold disabled:opacity-40">
            Previous
          </button>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button type="button" disabled={meta.page >= meta.totalPages || isLoading} onClick={() => loadPage(meta.page + 1)} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold disabled:opacity-40">
            Next
          </button>
        </div>
      </aside>

      <form onSubmit={saveItem} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{selectedItem?.id || config.singleton ? "Edit record" : "Create record"}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">{getTitle(config, form)}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{config.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!config.noDelete && selectedItem?.id ? (
              <button type="button" onClick={() => deleteItem(selectedItem)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50">
                Delete
              </button>
            ) : null}
            {!config.readonly ? (
              <button type="submit" disabled={isSaving} className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60">
                {isSaving ? "Saving..." : "Save"}
              </button>
            ) : null}
          </div>
        </div>

        {config.readonly ? (
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Selected review</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{selectedItem?.comment ?? "Select a review to inspect its comment."}</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <Field
                key={field.name}
                field={field}
                value={form[field.name]}
                destinations={destinations}
                onChange={(value) => updateField(field, value)}
              />
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

export function AdminCmsClient({ initialStats, initialResources, destinations, destinationOptions }) {
  const [active, setActive] = useState("dashboard");
  const [toast, setToast] = useState({ type: "", message: "" });

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast({ type: "", message: "" }), 3200);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <Toast toast={toast} onClose={() => setToast({ type: "", message: "" })} />
      <aside className="self-start rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-6">
        <nav aria-label="Admin navigation" className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActive(item.key)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                active === item.key ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main>
        {active === "dashboard" ? <Dashboard stats={initialStats} onNavigate={setActive} /> : null}
        {active === "destinations" ? (
          <DestinationAdminClient initialDestinations={destinations.data} villages={destinationOptions.villages} categories={destinationOptions.categories} />
        ) : null}
        {CONFIG[active] ? (
          <ResourceManager
            key={active}
            resource={active}
            initialItems={initialResources[active]?.data ?? []}
            initialMeta={initialResources[active]?.meta}
            destinations={destinationOptions.destinations}
            onToast={showToast}
          />
        ) : null}
      </main>
    </div>
  );
}
