const normalize = (value = "") =>
  String(value)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/**
 * How well `text` matches `query`: 4 exact, 3 prefix, 2 a word starts with it, 1 contains, 0 no match.
 * Every word of a multi-word query must match for a non-zero score.
 */
export function matchScore(text, query) {
  const haystack = normalize(text);
  const needle = normalize(query);
  if (!needle || !haystack) return 0;
  if (haystack === needle) return 4;
  if (haystack.startsWith(needle)) return 3;

  const words = needle.split(/\s+/);
  if (!words.every((word) => haystack.includes(word))) return 0;
  return words.every((word) => new RegExp(`(^|[\\s,(/-])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(haystack)) ? 2 : 1;
}

/**
 * Ranks items by the best score across their fields (the first field counts double as the "name"),
 * breaking ties with an optional popularity number.
 */
export function rankMatches(items, query, { fields, popularity = () => 0, limit = 5 }) {
  return items
    .map((item) => {
      const [nameField, ...otherFields] = fields;
      const nameScore = matchScore(nameField(item), query) * 2;
      const otherScore = Math.max(0, ...otherFields.map((field) => matchScore(field(item), query)));
      return { item, score: Math.max(nameScore, otherScore) };
    })
    .filter((entry) => entry.score > 0)
    .sort((first, second) => second.score - first.score || popularity(second.item) - popularity(first.item))
    .slice(0, limit)
    .map((entry) => entry.item);
}
