"use client";

import { Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";

/** Packing checklist with rule-based suggestions. Ticks are saved immediately. */
export function Checklist({ tripId, items }) {
  const [label, setLabel] = useState("");
  const [pending, setPending] = useState(null);
  const [optimistic, setOptimistic] = useState({});
  const { notify } = useToast();
  const router = useRouter();
  const done = items.filter((item) => optimistic[item.id] ?? item.done).length;

  async function call(key, url, options, successMessage) {
    setPending(key);
    const result = await apiRequest(url, options);
    setPending(null);
    if (!result.ok) {
      notify(result.message, "error");
      return false;
    }
    if (successMessage) notify(typeof successMessage === "function" ? successMessage(result) : successMessage);
    router.refresh();
    return true;
  }

  async function add(event) {
    event.preventDefault();
    if (!label.trim()) return;
    if (await call("add", `/api/trips/${tripId}/checklist`, { method: "POST", body: { label } })) setLabel("");
  }

  async function toggle(item) {
    const next = !(optimistic[item.id] ?? item.done);
    setOptimistic((current) => ({ ...current, [item.id]: next }));
    const ok = await call(`toggle-${item.id}`, `/api/trips/${tripId}/checklist/${item.id}`, { method: "PATCH", body: { done: next } });
    if (!ok) setOptimistic((current) => ({ ...current, [item.id]: !next }));
  }

  return (
    <section aria-labelledby="checklist-title" className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="checklist-title" className="text-lg font-semibold text-ink">
            Packing checklist
          </h2>
          <p className="text-sm text-ink-muted">{items.length ? `${done} of ${items.length} packed` : "Nothing on your list yet."}</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="no-print"
          disabled={pending === "suggest"}
          onClick={() => call("suggest", `/api/trips/${tripId}/checklist/suggest`, { method: "POST" }, (result) => result.message)}
        >
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          {pending === "suggest" ? "Thinking…" : "Suggest items"}
        </Button>
      </div>

      {items.length ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${Math.round((done / items.length) * 100)}%` }} />
        </div>
      ) : null}

      <ul className="mt-3 divide-y divide-line">
        {items.map((item) => {
          const checked = optimistic[item.id] ?? item.done;
          return (
            <li key={item.id} className="group flex items-center gap-3 py-2">
              <input
                id={`check-${item.id}`}
                type="checkbox"
                checked={checked}
                onChange={() => toggle(item)}
                className="h-4 w-4 shrink-0 accent-brand-700"
              />
              <label htmlFor={`check-${item.id}`} className={cn("flex-1 text-sm", checked ? "text-ink-subtle line-through" : "text-ink")}>
                {item.label}
              </label>
              <button
                type="button"
                onClick={() => call(`delete-${item.id}`, `/api/trips/${tripId}/checklist/${item.id}`, { method: "DELETE" })}
                className="no-print rounded p-1 text-ink-subtle opacity-60 hover:bg-danger-soft hover:text-danger-ink group-hover:opacity-100"
                aria-label={`Remove ${item.label}`}
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>

      <form onSubmit={add} className="no-print mt-3 flex gap-2">
        <label htmlFor="checklist-new" className="sr-only">
          Add an item
        </label>
        <Input id="checklist-new" value={label} maxLength={120} placeholder="Add an item…" onChange={(event) => setLabel(event.target.value)} />
        <Button type="submit" variant="secondary" disabled={pending === "add" || !label.trim()}>
          Add
        </Button>
      </form>
    </section>
  );
}
