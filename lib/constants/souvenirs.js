/**
 * "Take Home a Memory" vocabulary. The single source of truth for labels used by the
 * server (validation, ranking reasons) and the UI (filters, badges, Help me choose).
 * Values match the Prisma enums; URL params use the lowercase-kebab form.
 */

export const FEATURE_NAME = "Take Home a Memory";

export const AUDIENCES = [
  { value: "MYSELF", label: "Myself", tag: "A memory for yourself" },
  { value: "FAMILY", label: "Family", tag: "Great for family" },
  { value: "FRIENDS", label: "Friends", tag: "A gift for friends" },
  { value: "PARTNER", label: "Partner", tag: "Lovely for a partner" },
  { value: "CHILDREN", label: "Children", tag: "Kids will enjoy it" },
  { value: "PARENTS", label: "Parents", tag: "Thoughtful for parents" },
  { value: "COLLECTORS", label: "Collectors", tag: "Prized by collectors" },
];

export const INTERESTS = [
  { value: "CULTURE", label: "Culture" },
  { value: "FOOD", label: "Food" },
  { value: "ART", label: "Art" },
  { value: "FASHION", label: "Fashion" },
  { value: "CRAFTS", label: "Handmade crafts" },
  { value: "HOME_DECOR", label: "Home decor" },
  { value: "UNIQUE", label: "Something unique" },
];

export const QUALITIES = [
  { value: "HANDMADE", label: "Handmade" },
  { value: "TRADITIONAL", label: "Traditional" },
  { value: "LOCALLY_MADE", label: "Locally made" },
  { value: "ARTISAN_MADE", label: "Artisan made" },
  { value: "REGIONAL_SPECIALTY", label: "Regional specialty" },
];

export const AVAILABILITY = [
  { value: "YEAR_ROUND", label: "Available all year" },
  { value: "SEASONAL", label: "Seasonal" },
  { value: "FESTIVAL_TIME", label: "Mostly around festivals" },
  { value: "LIMITED", label: "Limited — ask locally" },
];

export const SELLER_KINDS = [
  { value: "MARKET", label: "Market" },
  { value: "SHOP", label: "Shop" },
  { value: "ARTISAN_WORKSHOP", label: "Artisan workshop" },
  { value: "HANDICRAFT_CENTER", label: "Handicraft centre" },
  { value: "COOPERATIVE", label: "Cooperative" },
  { value: "OTHER", label: "Other" },
];

export const PHOTO_KINDS = [
  { value: "PRODUCT", label: "The product" },
  { value: "MAKING", label: "Being made" },
  { value: "MARKET", label: "Where it's sold" },
];

/** Icon keys an admin can pick for a souvenir category (mapped to icons in components/souvenirs/souvenir-icon.js). */
export const CATEGORY_ICONS = [
  { value: "craft", label: "Handicraft" },
  { value: "pottery", label: "Pottery" },
  { value: "textile", label: "Textile" },
  { value: "clothing", label: "Clothing" },
  { value: "jewelry", label: "Jewellery" },
  { value: "food", label: "Food" },
  { value: "tea", label: "Tea & drinks" },
  { value: "art", label: "Art" },
  { value: "home", label: "Home decor" },
  { value: "gift", label: "Gift" },
  { value: "heritage", label: "Traditional" },
  { value: "other", label: "Other" },
];

/** Budget bands in whole rupees. `max: null` means open-ended. */
export const BUDGET_BANDS = [
  { value: "under-500", label: "Under ₹500", min: 0, max: 499 },
  { value: "500-1000", label: "₹500–₹1,000", min: 500, max: 1000 },
  { value: "1000-2500", label: "₹1,000–₹2,500", min: 1000, max: 2500 },
  { value: "2500-plus", label: "₹2,500+", min: 2500, max: null },
];

export const values = (list) => list.map((entry) => entry.value);
export const labelOf = (list, value) => list.find((entry) => entry.value === value)?.label ?? value;
export const budgetBand = (value) => BUDGET_BANDS.find((band) => band.value === value) ?? null;

/** FAMILY ↔ "family", HOME_DECOR ↔ "home-decor" for readable URLs. */
export const toParam = (value) => value.toLowerCase().replace(/_/g, "-");
export const fromParam = (list, param) => list.find((entry) => toParam(entry.value) === String(param ?? "").toLowerCase())?.value ?? null;
