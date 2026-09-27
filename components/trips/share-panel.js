"use client";

import { Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";

/** Manage the read-only share link for a trip. */
export function SharePanel({ tripId, sharePath }) {
  const [path, setPath] = useState(sharePath);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const { notify } = useToast();
  const router = useRouter();
  const url = path && typeof window !== "undefined" ? `${window.location.origin}${path}` : "";

  async function request(method, body) {
    setPending(true);
    const result = await apiRequest(`/api/trips/${tripId}/share`, { method, body });
    setPending(false);
    notify(result.message, result.ok ? "success" : "error");
    if (result.ok) {
      setPath(result.data.sharePath);
      setCopied(false);
      router.refresh();
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      notify("Couldn't copy automatically. Select the link and copy it.", "error");
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-ink-muted">
        Anyone with the link can see your itinerary and route. They <strong className="text-ink">won&apos;t</strong> see your notes, budget or checklist, and they can&apos;t change anything.
      </p>

      {path ? (
        <>
          <div className="flex gap-2">
            <label htmlFor="share-url" className="sr-only">
              Share link
            </label>
            <Input id="share-url" readOnly value={url} onFocus={(event) => event.target.select()} />
            <Button variant="secondary" onClick={copy}>
              {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => request("POST", { regenerate: true })}>
              Create a new link
            </Button>
            <Button size="sm" variant="danger-ghost" disabled={pending} onClick={() => request("DELETE")}>
              Stop sharing
            </Button>
          </div>
          <p className="text-xs text-ink-subtle">Creating a new link or stopping sharing makes the current link stop working.</p>
        </>
      ) : (
        <Button disabled={pending} onClick={() => request("POST", {})}>
          {pending ? "Creating…" : "Create share link"}
        </Button>
      )}
    </div>
  );
}
