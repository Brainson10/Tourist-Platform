"use client";

import { CalendarDays, Clock, Compass, Gift, MapPin, Search, Shuffle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { apiRequest } from "@/lib/utils/api-client";

const RECENT_KEY = "recent-searches";
const GROUPS = [
  { key: "destinations", label: "Destinations", Icon: MapPin },
  { key: "states", label: "States", Icon: Compass },
  { key: "experiences", label: "Experiences", Icon: Sparkles },
  { key: "festivals", label: "Festivals", Icon: CalendarDays },
  { key: "souvenirs", label: "Souvenirs", Icon: Gift },
];

function readRecent() {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item) => typeof item === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

function saveRecent(query) {
  try {
    const next = [query, ...readRecent().filter((item) => item.toLowerCase() !== query.toLowerCase())].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode): recents are a nicety, so ignore.
  }
}

/**
 * Search with instant suggestions (ARIA 1.2 combobox pattern).
 * Without JavaScript it is a plain GET form to /destinations?q=.
 */
export function SearchCombobox({ variant = "default", autoFocus = false, placeholder = "Search places, festivals, experiences…", onNavigate, inlineResults = false }) {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const inputRef = useRef(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [recent, setRecent] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const trimmed = query.trim();

  // Fetch suggestions 200 ms after typing stops; stale responses are ignored.
  useEffect(() => {
    if (trimmed.length < 2) return undefined;
    let cancelled = false;
    const timer = setTimeout(() => {
      apiRequest(`/api/search/suggest?q=${encodeURIComponent(trimmed)}`).then((result) => {
        if (!cancelled) setResults(result.ok ? { query: trimmed, ...result.data } : { query: trimmed, error: true });
      });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed]);

  const showSuggestions = trimmed.length >= 2 && results?.query === trimmed;

  // Flat list of options for keyboard navigation, in display order.
  const options = useMemo(() => {
    if (trimmed.length < 2) {
      return [
        ...recent.map((item) => ({ group: "recent", name: item, href: `/destinations?q=${encodeURIComponent(item)}`, search: item })),
        { group: "actions", name: "Surprise me", detail: "Open a random destination", href: "/destinations/surprise" },
      ];
    }
    if (!showSuggestions || results.error) return [];
    return [
      ...GROUPS.flatMap(({ key }) => (results[key] ?? []).map((item) => ({ ...item, group: key }))),
      { group: "actions", name: `Search all for “${trimmed}”`, href: `/destinations?q=${encodeURIComponent(trimmed)}`, search: trimmed },
    ];
  }, [recent, results, showSuggestions, trimmed]);

  function go(option) {
    // Remember what was typed, whether they picked a suggestion or searched everything.
    const remembered = option.search ?? (trimmed.length >= 2 ? trimmed : null);
    if (remembered) saveRecent(remembered);
    setOpen(false);
    setActiveIndex(-1);
    onNavigate?.();
    router.push(option.href);
  }

  function onSubmit(event) {
    event.preventDefault();
    if (activeIndex >= 0 && options[activeIndex]) return go(options[activeIndex]);
    if (trimmed) go({ href: `/destinations?q=${encodeURIComponent(trimmed)}`, search: trimmed });
  }

  function onKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (options.length ? (index + 1) % options.length : -1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (options.length ? (index <= 0 ? options.length - 1 : index - 1) : -1));
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
      } else {
        setQuery("");
      }
    }
  }

  const expanded = open && options.length > 0;
  const activeOptionId = expanded && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined;
  const hero = variant === "hero";

  const renderGroup = (key, label, Icon, items) => {
    if (!items.length) return null;
    const headingId = `${id}-group-${key}`;

    return (
      <li key={key} role="presentation">
        {label ? (
          <p id={headingId} className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
            {label}
          </p>
        ) : null}
        <ul role="group" aria-labelledby={label ? headingId : undefined}>
          {items.map((item) => {
            const index = options.indexOf(item);
            return (
              <li
                key={`${key}-${item.href}-${item.name}`}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => go(item)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2", index === activeIndex ? "bg-surface-muted" : "")}
              >
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-soft text-brand-strong">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- tiny thumbnail; next/image adds little here
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{item.name}</span>
                  {item.detail ? <span className="block truncate text-xs text-ink-muted">{item.detail}</span> : null}
                </span>
              </li>
            );
          })}
        </ul>
      </li>
    );
  };

  return (
    <form action="/destinations" role="search" onSubmit={onSubmit} className="relative">
      <div
        className={cn(
          "flex items-center gap-2 border border-line-strong bg-surface shadow-sm transition-shadow focus-within:border-link focus-within:shadow-md",
          hero ? "rounded-full p-1.5" : "rounded-full px-1 py-1"
        )}
      >
        <Search aria-hidden="true" className={cn("shrink-0 text-ink-subtle", hero ? "ml-3 h-5 w-5" : "ml-2 h-4 w-4")} />
        <label htmlFor={`${id}-input`} className="sr-only">
          Search destinations, experiences and festivals
        </label>
        <input
          ref={inputRef}
          id={`${id}-input`}
          name="q"
          type="search"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          autoComplete="off"
          autoFocus={autoFocus}
          data-autofocus={autoFocus || undefined}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            setRecent(readRecent());
            setOpen(true);
          }}
          onBlur={() => !inlineResults && setOpen(false)}
          onKeyDown={onKeyDown}
          className={cn("min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-subtle focus:outline-none", hero ? "h-11 text-base" : "h-9 text-sm")}
        />
        <button type="submit" className={cn("shrink-0 rounded-full bg-brand-700 font-semibold text-white hover:bg-brand-800", hero ? "h-11 px-6" : "h-9 px-4 text-sm")}>
          Search
        </button>
      </div>

      <ul
        id={listboxId}
        role="listbox"
        aria-label="Search suggestions"
        hidden={!expanded}
        className={cn(
          "overflow-y-auto rounded-2xl bg-surface text-left",
          inlineResults ? "mt-3" : "absolute inset-x-0 top-full z-50 mt-2 max-h-[26rem] border border-line p-1.5 shadow-xl"
        )}
      >
        {trimmed.length < 2 ? (
          <>
            {renderGroup("recent", recent.length ? "Recent searches" : null, Clock, options.filter((option) => option.group === "recent"))}
            {renderGroup("actions", null, Shuffle, options.filter((option) => option.group === "actions"))}
          </>
        ) : (
          <>
            {GROUPS.map(({ key, label, Icon }) => renderGroup(key, label, Icon, options.filter((option) => option.group === key)))}
            {renderGroup("actions", null, Search, options.filter((option) => option.group === "actions"))}
          </>
        )}
      </ul>
      <p className="sr-only" aria-live="polite">
        {showSuggestions && !results.error ? `${options.length - 1} suggestions` : ""}
      </p>
    </form>
  );
}
