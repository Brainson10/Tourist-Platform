/**
 * WMO weather interpretation codes (as returned by Open-Meteo) → a short label and an icon key.
 * https://open-meteo.com/en/docs#weathervariables
 */
const GROUPS = [
  { codes: [0], label: "Clear", icon: "sun" },
  { codes: [1], label: "Mostly clear", icon: "cloud-sun" },
  { codes: [2], label: "Partly cloudy", icon: "cloud-sun" },
  { codes: [3], label: "Overcast", icon: "cloud" },
  { codes: [45, 48], label: "Fog", icon: "fog" },
  { codes: [51, 53, 55, 56, 57], label: "Drizzle", icon: "drizzle" },
  { codes: [61, 63, 66], label: "Rain", icon: "rain" },
  { codes: [65, 67], label: "Heavy rain", icon: "rain" },
  { codes: [71, 73, 75, 77, 85, 86], label: "Snow", icon: "snow" },
  { codes: [80, 81], label: "Rain showers", icon: "rain" },
  { codes: [82], label: "Heavy showers", icon: "rain" },
  { codes: [95, 96, 99], label: "Thunderstorm", icon: "storm" },
];

export function describeWeather(code) {
  const group = GROUPS.find((entry) => entry.codes.includes(Number(code)));
  return group ? { label: group.label, icon: group.icon } : { label: "Unknown", icon: "cloud" };
}

/** Rain, storm or snow in the forecast is worth a heads-up on trip and destination pages. */
export function isWetWeather(code) {
  return ["drizzle", "rain", "storm", "snow"].includes(describeWeather(code).icon);
}
