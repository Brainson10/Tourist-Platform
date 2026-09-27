import { Droplets, Wind } from "lucide-react";
import { Skeleton } from "@/components/ui/states";
import { WeatherIcon } from "@/components/ui/weather-icon";
import { getWeather } from "@/lib/services/weather.service";

const dayName = new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" });

/** Streams in after the page shell; a slow or failed weather lookup never blocks the page. */
export async function WeatherCard({ latitude, longitude, name }) {
  const weather = await getWeather(latitude, longitude);

  if (!weather.available) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5">
        <h3 className="font-semibold text-ink">Weather</h3>
        <p className="mt-1 text-sm text-ink-muted">The forecast isn&apos;t available right now. Check a local forecast before you set out.</p>
      </div>
    );
  }

  const { current, days } = weather;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-center gap-4 bg-gradient-to-br from-brand-soft to-surface p-5">
        <WeatherIcon icon={current.icon} className="h-12 w-12 text-brand-600 dark:text-link" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Now in {name}</p>
          <p className="font-display text-3xl font-semibold text-ink">{current.temperature}°C</p>
          <p className="text-sm text-ink-muted">
            {current.label} · feels like {current.feelsLike}°
          </p>
        </div>
        <dl className="ml-auto hidden space-y-1 text-xs text-ink-muted sm:block">
          <div className="flex items-center gap-1.5">
            <Droplets aria-hidden="true" className="h-3.5 w-3.5" />
            <dt className="sr-only">Humidity</dt>
            <dd>{current.humidity}%</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind aria-hidden="true" className="h-3.5 w-3.5" />
            <dt className="sr-only">Wind</dt>
            <dd>{current.wind} km/h</dd>
          </div>
        </dl>
      </div>
      <ol className="scrollbar-none relative grid grid-flow-col auto-cols-[minmax(4.5rem,1fr)] overflow-x-auto border-t border-line" aria-label="7-day forecast">
        {days.map((day, index) => (
          <li key={day.date} className="relative flex flex-col items-center gap-1 border-r border-line px-2 py-3 text-center last:border-r-0">
            <span className="text-xs font-medium text-ink-muted">{index === 0 ? "Today" : dayName.format(new Date(`${day.date}T12:00:00+05:30`))}</span>
            <WeatherIcon icon={day.icon} className="h-5 w-5 text-ink-muted" />
            <span className="sr-only">{day.label}</span>
            <span className="text-sm font-semibold text-ink">{day.max}°</span>
            <span className="text-xs text-ink-subtle">{day.min}°</span>
            {day.rainChance ? <span className="text-[11px] text-info-ink">{day.rainChance}% rain</span> : null}
          </li>
        ))}
      </ol>
      <p className="border-t border-line px-5 py-2 text-[11px] text-ink-subtle">Forecast by Open-Meteo</p>
    </div>
  );
}

export function WeatherCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5" aria-busy="true" aria-label="Loading weather">
      <Skeleton className="h-14 w-48" />
      <Skeleton className="mt-4 h-20" />
    </div>
  );
}

/** Compact "24°C · Partly cloudy" for the at-a-glance row. */
export async function WeatherNow({ latitude, longitude }) {
  const weather = await getWeather(latitude, longitude);
  if (!weather.available) return <span className="text-ink-muted">Unavailable</span>;

  return (
    <span className="inline-flex items-center gap-1.5">
      <WeatherIcon icon={weather.current.icon} className="h-4 w-4" />
      {weather.current.temperature}°C · {weather.current.label}
    </span>
  );
}
