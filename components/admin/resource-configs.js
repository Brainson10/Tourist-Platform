import { CATEGORY_ICONS, SELLER_KINDS, labelOf } from "@/lib/constants/souvenirs";
import { formatDateRange, formatPrice, titleCase, toDateInput } from "@/lib/utils/format";

const CATEGORY_OPTIONS = ["ADVENTURE", "CULTURE", "FOOD", "NATURE", "FESTIVAL", "WILDLIFE", "SPIRITUAL"].map((value) => ({ value, label: titleCase(value) }));

/**
 * Field kinds: text, textarea, number, date, select, checkbox, image, slug (auto-filled from `from`).
 * `options: "destinations"` (or "states", "villages") pulls choices from the page's option lists.
 * `placeholder` on an optional select adds an empty first choice.
 */
export const RESOURCE_CONFIGS = {
  permits: {
    singular: "permit rule",
    columns: [
      { label: "State", render: (row) => row.state, primary: true },
      { label: "Permit needed", render: (row) => (row.required ? row.permitName ?? "Yes" : "No") },
      { label: "Last checked", render: (row) => (row.lastVerifiedAt ? formatDateRange(row.lastVerifiedAt) : "Not yet") },
    ],
    fields: [
      { name: "state", label: "State", kind: "select", options: "states", required: true, half: true },
      { name: "permitName", label: "Permit name", half: true, hint: "e.g. Inner Line Permit (ILP)" },
      { name: "required", label: "Visitors need a permit to enter this state", kind: "checkbox" },
      { name: "whoNeedsIt", label: "Who needs it", kind: "textarea", rows: 2 },
      { name: "howToApply", label: "How to apply", kind: "textarea", rows: 3 },
      { name: "applyUrl", label: "Official application link", hint: "Must be the state government's own portal (https://)" },
      { name: "fee", label: "Fee", half: true },
      { name: "processingTime", label: "Processing time", half: true },
      { name: "foreignersNote", label: "Foreign nationals", kind: "textarea", rows: 2 },
      { name: "lastVerifiedAt", label: "Last checked against official sources", kind: "date", half: true },
    ],
    empty: { state: "", permitName: "", required: false, whoNeedsIt: "", howToApply: "", applyUrl: "", fee: "", processingTime: "", foreignersNote: "", lastVerifiedAt: "" },
    toForm: (row) => ({ ...row, lastVerifiedAt: toDateInput(row.lastVerifiedAt) }),
    deleteWarning: "Destinations in this state will stop showing permit information.",
  },
  villages: {
    singular: "village",
    columns: [
      { label: "Village", render: (row) => row.name, primary: true },
      { label: "District", render: (row) => row.district },
      { label: "State", render: (row) => row.state },
      { label: "Destinations", render: (row) => row._count?.destinations ?? 0 },
    ],
    fields: [
      { name: "name", label: "Village or town name", required: true },
      { name: "district", label: "District", required: true, half: true },
      { name: "state", label: "State", required: true, half: true },
      { name: "latitude", label: "Latitude", kind: "number", required: true, half: true, step: "any", hint: "e.g. 24.53" },
      { name: "longitude", label: "Longitude", kind: "number", required: true, half: true, step: "any", hint: "e.g. 93.78" },
      { name: "pincode", label: "PIN code", half: true },
      { name: "description", label: "Description", kind: "textarea" },
    ],
    empty: { name: "", district: "", state: "", latitude: "", longitude: "", pincode: "", description: "" },
    deleteWarning: "Villages that still have destinations can't be deleted.",
  },
  categories: {
    singular: "category",
    columns: [
      { label: "Category", render: (row) => row.name, primary: true },
      { label: "Slug", render: (row) => row.slug },
      { label: "Destinations", render: (row) => row._count?.destinations ?? 0 },
    ],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "URL slug", kind: "slug", from: "name", required: true },
      { name: "description", label: "Description", kind: "textarea" },
    ],
    empty: { name: "", slug: "", description: "" },
    deleteWarning: "Destinations in this category will simply lose the tag.",
  },
  experiences: {
    singular: "experience",
    columns: [
      { label: "Experience", render: (row) => row.title, primary: true },
      { label: "Destination", render: (row) => row.destination?.name },
      { label: "Type", render: (row) => titleCase(row.category) },
      { label: "Price", render: (row) => formatPrice(row.price) ?? "—" },
    ],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "destinationId", label: "Destination", kind: "select", options: "destinations", required: true, half: true },
      { name: "category", label: "Type", kind: "select", options: CATEGORY_OPTIONS, required: true, half: true },
      { name: "duration", label: "Duration", half: true, hint: "e.g. 3 hours" },
      { name: "difficulty", label: "Difficulty", half: true, hint: "e.g. Easy" },
      { name: "price", label: "Price per person (₹)", kind: "number", half: true, hint: "Leave empty if unknown, 0 if free" },
      { name: "imageUrl", label: "Image", kind: "image", folder: "experiences" },
      { name: "description", label: "Description", kind: "textarea", required: true, rows: 6 },
    ],
    empty: { title: "", destinationId: "", category: "NATURE", duration: "", difficulty: "", price: "", imageUrl: "", description: "" },
    toForm: (row) => ({ ...row, price: row.price ?? "" }),
    filters: [{ name: "category", label: "All types", options: CATEGORY_OPTIONS }],
  },
  festivals: {
    singular: "festival",
    columns: [
      { label: "Festival", render: (row) => row.title, primary: true },
      { label: "Destination", render: (row) => row.destination?.name },
      { label: "Dates", render: (row) => formatDateRange(row.startDate, row.endDate) },
      { label: "Featured", render: (row) => (row.isFeatured ? "Yes" : "—") },
    ],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "URL slug", kind: "slug", from: "title", required: true },
      { name: "destinationId", label: "Destination", kind: "select", options: "destinations", required: true, half: true },
      { name: "category", label: "Type", kind: "select", options: CATEGORY_OPTIONS, half: true },
      { name: "startDate", label: "Start date", kind: "date", half: true, hint: "Leave empty if not announced" },
      { name: "endDate", label: "End date", kind: "date", half: true },
      { name: "imageUrl", label: "Image", kind: "image", folder: "festivals" },
      { name: "description", label: "Description", kind: "textarea", required: true, rows: 5 },
      { name: "significance", label: "Cultural significance", kind: "textarea", rows: 4 },
      { name: "isFeatured", label: "Feature on the home page", kind: "checkbox" },
    ],
    empty: { title: "", slug: "", destinationId: "", category: "FESTIVAL", startDate: "", endDate: "", imageUrl: "", description: "", significance: "", isFeatured: false },
    toForm: (row) => ({ ...row, startDate: toDateInput(row.startDate), endDate: toDateInput(row.endDate) }),
  },
  "souvenir-categories": {
    singular: "souvenir category",
    columns: [
      { label: "Category", render: (row) => row.name, primary: true },
      { label: "Slug", render: (row) => row.slug },
      { label: "Icon", render: (row) => (row.icon ? labelOf(CATEGORY_ICONS, row.icon) : "—") },
      { label: "Souvenirs", render: (row) => row._count?.souvenirs ?? 0 },
    ],
    fields: [
      { name: "name", label: "Name", required: true, half: true },
      { name: "slug", label: "URL slug", kind: "slug", from: "name", required: true, half: true },
      { name: "icon", label: "Icon", kind: "select", options: CATEGORY_ICONS, placeholder: "Default (gift)", half: true, hint: "Shown on cards that have no photo yet" },
      { name: "description", label: "Description", kind: "textarea", rows: 2 },
    ],
    empty: { name: "", slug: "", icon: "", description: "" },
    deleteWarning: "Categories that still have souvenirs can't be deleted — move them first.",
  },
  sellers: {
    singular: "place to buy",
    columns: [
      { label: "Place", render: (row) => row.name, primary: true },
      { label: "Type", render: (row) => labelOf(SELLER_KINDS, row.kind) },
      { label: "Location", render: (row) => (row.village ? `${row.village.name}, ${row.village.state}` : row.address) },
      { label: "Souvenirs", render: (row) => row._count?.souvenirs ?? 0 },
      { label: "Verified", render: (row) => (row.isVerified ? "Yes" : "Not yet") },
    ],
    fields: [
      { name: "name", label: "Name", required: true, half: true, hint: "e.g. Ima Keithel (Mothers' Market)" },
      { name: "slug", label: "URL slug", kind: "slug", from: "name", required: true, half: true },
      { name: "kind", label: "Type of place", kind: "select", options: SELLER_KINDS, required: true, half: true },
      { name: "villageId", label: "Village or town", kind: "select", options: "villages", placeholder: "Not linked", half: true, hint: "District and state come from the village" },
      { name: "address", label: "Address or area", hint: "How a traveler would find it" },
      { name: "latitude", label: "Latitude", kind: "number", required: true, half: true, step: "any", hint: "Used for the map pin and directions" },
      { name: "longitude", label: "Longitude", kind: "number", required: true, half: true, step: "any" },
      { name: "openingHours", label: "Opening hours", half: true, hint: "e.g. Daily 7 am – 6 pm" },
      { name: "phone", label: "Phone", half: true },
      { name: "website", label: "Website", hint: "https:// only" },
      { name: "description", label: "Description", kind: "textarea", rows: 3 },
      { name: "isVerified", label: "Details checked recently (shows a verified mark to travelers)", kind: "checkbox" },
    ],
    empty: { name: "", slug: "", kind: "MARKET", villageId: "", address: "", latitude: "", longitude: "", openingHours: "", phone: "", website: "", description: "", isVerified: false },
    deleteWarning: "It will be removed from the “Where to buy” list of every souvenir that mentions it.",
  },
  stories: {
    singular: "story",
    columns: [
      { label: "Story", render: (row) => row.title, primary: true },
      { label: "Destination", render: (row) => row.destination?.name },
      { label: "Author", render: (row) => row.authorName ?? "—" },
    ],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "URL slug", kind: "slug", from: "title", required: true },
      { name: "destinationId", label: "Destination", kind: "select", options: "destinations", required: true, half: true },
      { name: "authorName", label: "Author", half: true },
      { name: "excerpt", label: "Short summary", kind: "textarea", rows: 2, hint: "Shown on story cards. One or two sentences." },
      { name: "coverImage", label: "Cover image", kind: "image", folder: "stories" },
      { name: "content", label: "Story", kind: "textarea", required: true, rows: 12, hint: "Separate paragraphs with a blank line." },
      { name: "language", label: "Language", half: true },
    ],
    empty: { title: "", slug: "", destinationId: "", authorName: "", excerpt: "", coverImage: "", content: "", language: "English" },
  },
};

/** Converts form strings into the JSON the admin API expects. */
export function toPayload(config, values) {
  const payload = {};

  for (const field of config.fields) {
    const value = values[field.name];

    if (field.kind === "checkbox") payload[field.name] = Boolean(value);
    else if (field.kind === "number") payload[field.name] = value === "" || value === null || value === undefined ? (field.required ? undefined : null) : Number(value);
    else payload[field.name] = typeof value === "string" ? value.trim() : value ?? "";
  }

  return payload;
}
