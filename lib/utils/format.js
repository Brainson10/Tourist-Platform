const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const shortDateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "Asia/Kolkata" });
const dayFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", timeZone: "Asia/Kolkata" });
const weekdayFormatter = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const priceFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : "";
}

export function formatWeekday(value) {
  const date = toDate(value);
  return date ? weekdayFormatter.format(date) : "";
}

/** "12 – 14 Nov 2026", "30 Nov – 2 Dec 2026", or "Dates to be announced". */
export function formatDateRange(start, end) {
  const startDate = toDate(start);
  const endDate = toDate(end);

  if (!startDate) return "Dates to be announced";
  if (!endDate || dateFormatter.format(startDate) === dateFormatter.format(endDate)) return dateFormatter.format(startDate);

  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  return `${sameYear ? shortDateFormatter.format(startDate) : dateFormatter.format(startDate)} – ${dateFormatter.format(endDate)}`;
}

export function dateBadge(value) {
  const date = toDate(value);
  return date ? { day: dayFormatter.format(date), month: monthFormatter.format(date) } : null;
}

export function formatPrice(value) {
  if (value === null || value === undefined) return null;
  if (Number(value) === 0) return "Free";
  return priceFormatter.format(value);
}

/** Always a rupee amount (₹0 for zero), for totals and budgets. */
export function formatRupees(value) {
  return priceFormatter.format(Number(value) || 0);
}

export function formatRating(value) {
  return Number(value || 0).toFixed(1);
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function titleCase(value = "") {
  return value.toLowerCase().replace(/(^|[\s_-])([a-z])/g, (_, space, letter) => `${space === "_" ? " " : space}${letter.toUpperCase()}`);
}

export function locationLabel(village, { includeVillage = false } = {}) {
  if (!village) return "";
  return [includeVillage ? village.name : null, village.district, village.state].filter(Boolean).join(", ");
}

export function tripLength(start, end) {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return 0;
  return Math.max(1, Math.round((endDate - startDate) / 86_400_000) + 1);
}

export function daysUntil(value) {
  const date = toDate(value);
  if (!date) return null;
  const today = new Date(`${toDateInput(new Date())}T00:00:00Z`);
  const target = new Date(`${toDateInput(date)}T00:00:00Z`);
  return Math.round((target - today) / 86_400_000);
}

export function readingMinutes(text = "") {
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
}

export function excerpt(text = "", length = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length).replace(/\s+\S*$/, "")}…` : clean;
}

export function paragraphs(text = "") {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

const isoDateFormatter = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Kolkata" });

/** "YYYY-MM-DD" in India time, for <input type="date">. */
export function toDateInput(value) {
  const date = toDate(value);
  return date ? isoDateFormatter.format(date) : "";
}

/** Date of day N (1-based) of a trip. */
export function addDays(value, days) {
  const date = toDate(value);
  return date ? new Date(date.getTime() + days * 86_400_000) : null;
}
