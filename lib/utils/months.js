export const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MONTH_SHORT = MONTH_NAMES.map((name) => name.slice(0, 3));

const MONTH_LOOKUP = new Map(
  MONTH_NAMES.flatMap((name, index) => {
    const lower = name.toLowerCase();
    return [
      [lower, index + 1],
      [lower.slice(0, 3), index + 1],
      ...(lower === "september" ? [["sept", 9]] : []),
    ];
  })
);

const SEASONS = {
  winter: [11, 12, 1, 2],
  spring: [3, 4],
  summer: [4, 5, 6],
  monsoon: [6, 7, 8, 9],
  autumn: [10, 11],
  "post-monsoon": [10, 11],
};

const MONTH_WORD = "(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";

/** Inclusive month range that wraps over the new year, e.g. 11→3 gives 11,12,1,2,3. */
export function monthRange(start, end) {
  const months = [];
  let month = start;

  for (let steps = 0; steps < 12; steps += 1) {
    months.push(month);
    if (month === end) break;
    month = (month % 12) + 1;
  }

  return months;
}

/**
 * Turns free text like "November to April", "March to June and September to October",
 * "Oct–Mar", "winter" or "year-round" into sorted month numbers (1–12).
 */
export function parseBestMonths(text = "") {
  const input = String(text ?? "").toLowerCase();
  if (!input.trim()) return [];
  if (/\b(year[\s-]?round|all\s+year|any\s*time|throughout the year)\b/.test(input)) return MONTH_NAMES.map((_, index) => index + 1);

  const found = new Set();
  const rangePattern = new RegExp(`\\b${MONTH_WORD}\\b\\s*(?:to|till|until|through|[-–—])\\s*\\b${MONTH_WORD}\\b`, "g");
  let rest = input;

  for (const match of input.matchAll(rangePattern)) {
    monthRange(MONTH_LOOKUP.get(match[1].slice(0, 3)), MONTH_LOOKUP.get(match[2].slice(0, 3))).forEach((month) => found.add(month));
    rest = rest.replace(match[0], " ");
  }

  for (const match of rest.matchAll(new RegExp(`\\b${MONTH_WORD}\\b`, "g"))) {
    found.add(MONTH_LOOKUP.get(match[1].slice(0, 3)));
  }

  for (const [season, months] of Object.entries(SEASONS)) {
    if (new RegExp(`\\b${season}\\b`).test(rest)) months.forEach((month) => found.add(month));
  }

  return [...found].filter(Boolean).sort((first, second) => first - second);
}

/** "Nov – Apr", "Mar – Jun, Sep – Oct", "All year". Groups consecutive months, wrapping December→January. */
export function formatMonthSpans(months = []) {
  const set = new Set(months);
  if (set.size === 12) return "All year";
  if (!set.size) return "";

  const spans = [];
  // Start each span at a month whose previous month is not included, so wrapped spans stay whole.
  for (let month = 1; month <= 12; month += 1) {
    const previous = month === 1 ? 12 : month - 1;
    if (!set.has(month) || set.has(previous)) continue;
    let end = month;
    while (set.has((end % 12) + 1) && (end % 12) + 1 !== month) end = (end % 12) + 1;
    spans.push(end === month ? MONTH_SHORT[month - 1] : `${MONTH_SHORT[month - 1]} – ${MONTH_SHORT[end - 1]}`);
  }

  return spans.join(", ");
}
