export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatPageTitle(title) {
  return `${title} | Smart Tourism Platform`;
}
