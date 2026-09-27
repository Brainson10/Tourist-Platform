import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun } from "lucide-react";
import { createElement } from "react";

const ICONS = { sun: Sun, "cloud-sun": CloudSun, cloud: Cloud, fog: CloudFog, drizzle: CloudDrizzle, rain: CloudRain, snow: CloudSnow, storm: CloudLightning };

export function WeatherIcon({ icon, className = "h-5 w-5" }) {
  return createElement(ICONS[icon] ?? Cloud, { "aria-hidden": true, className, strokeWidth: 1.75 });
}
