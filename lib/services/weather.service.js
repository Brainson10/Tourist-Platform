import { cache } from "react";
import { describeWeather } from "@/lib/utils/weather-codes";

/**
 * Current weather + 7-day forecast from Open-Meteo (no key for non-commercial use;
 * set OPEN_METEO_API_KEY for the commercial endpoint). Cached for 30 minutes.
 * Returns { available: false } instead of throwing, so pages never break.
 */
export const getWeather = cache(async (latitude, longitude) => {
  const apiKey = process.env.OPEN_METEO_API_KEY;
  const base = apiKey ? "https://customer-api.open-meteo.com/v1/forecast" : "https://api.open-meteo.com/v1/forecast";
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "Asia/Kolkata",
    forecast_days: "7",
    ...(apiKey ? { apikey: apiKey } : {}),
  });

  try {
    const response = await fetch(`${base}?${params}`, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error(`Open-Meteo responded ${response.status}`);
    const data = await response.json();

    return {
      available: true,
      current: {
        temperature: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        wind: Math.round(data.current.wind_speed_10m),
        ...describeWeather(data.current.weather_code),
      },
      days: data.daily.time.map((date, index) => ({
        date,
        max: Math.round(data.daily.temperature_2m_max[index]),
        min: Math.round(data.daily.temperature_2m_min[index]),
        rainChance: data.daily.precipitation_probability_max?.[index] ?? null,
        ...describeWeather(data.daily.weather_code[index]),
      })),
    };
  } catch (error) {
    console.warn("[weather] lookup failed:", error?.message ?? error);
    return { available: false };
  }
});
