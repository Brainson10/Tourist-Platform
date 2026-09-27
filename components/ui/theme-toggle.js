"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/components/ui/cn";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

const listeners = new Set();

function readTheme() {
  try {
    return localStorage.getItem("theme") ?? "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function setTheme(theme) {
  try {
    if (theme === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", theme);
  } catch {
    // Storage blocked (private mode): the choice still applies for this page view.
  }
  applyTheme(theme);
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => readTheme() === "system" && applyTheme("system");
  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", listener);
  };
}

/** Light / dark / system switch. The pre-paint script in app/layout.js applies the saved choice. */
export function ThemeToggle({ className }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system");

  return (
    <div role="radiogroup" aria-label="Colour theme" className={cn("inline-flex rounded-full border border-line bg-surface p-0.5", className)}>
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          title={`${label} theme`}
          onClick={() => setTheme(value)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
            theme === value ? "bg-brand-700 text-white" : "text-ink-muted hover:text-ink"
          )}
        >
          <Icon aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}
