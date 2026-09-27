const monthInIndia = new Intl.DateTimeFormat("en-IN", { month: "numeric", timeZone: "Asia/Kolkata" });

const BASE = ["Photo ID (Aadhaar, passport or driving licence)", "Phone charger and power bank", "Reusable water bottle", "Basic medicines and first-aid kit", "Some cash — ATMs can be far apart"];

const BY_CATEGORY = {
  adventure: ["Trekking shoes with good grip", "Headlamp or torch"],
  wildlife: ["Binoculars", "Neutral-coloured clothing for safaris", "Insect repellent"],
  nature: ["Insect repellent", "Sunscreen and a hat"],
  spiritual: ["Modest clothing for monasteries and temples"],
  culture: ["Modest clothing for village and temple visits"],
  photography: ["Camera, spare batteries and memory cards"],
  food: ["Digestive tablets for trying new food"],
};

const MONSOON = ["Rain jacket or umbrella", "Quick-dry clothes", "Waterproof pouch for your phone", "Leech socks for forest trails"];
const WINTER = ["Warm layers and a jacket", "Woollen cap and gloves"];

/**
 * Rule-based packing suggestions from what we know about the trip.
 * `categories` are category slugs; months are 1–12 in India time.
 */
export function suggestPackingList({ categories = [], startDate, endDate, permit } = {}) {
  const items = [...BASE];
  const months = new Set();

  if (startDate) {
    const start = new Date(startDate);
    const end = new Date(endDate ?? startDate);
    for (let date = new Date(start); date <= end && months.size < 12; date.setDate(date.getDate() + 1)) {
      months.add(Number(monthInIndia.format(date)));
    }
  }

  if ([6, 7, 8, 9].some((month) => months.has(month))) items.push(...MONSOON);
  if ([11, 12, 1, 2].some((month) => months.has(month))) items.push(...WINTER);
  for (const category of categories) items.push(...(BY_CATEGORY[category] ?? []));
  if (permit?.required) items.push(`${permit.permitName ?? "Entry permit"} — printed and digital copies`);

  return [...new Set(items)].slice(0, 20);
}
