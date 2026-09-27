/** "Asha Devi" → "AD". Shared by server and client components. */
export function initials(name = "") {
  return (
    String(name)
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}
