"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiRequest } from "@/lib/utils/api-client";

export function SaveButton({ destinationId, initialSaved, signedIn, returnTo }) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);
  const { notify } = useToast();
  const router = useRouter();

  async function toggle() {
    if (!signedIn) {
      router.push(`/login?redirectTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    const next = !saved;
    setSaved(next);
    setPending(true);
    const result = await apiRequest(`/api/destinations/${destinationId}/save`, { method: next ? "PUT" : "DELETE" });
    setPending(false);

    if (!result.ok) {
      setSaved(!next);
      notify(result.message, "error");
      return;
    }

    notify(result.message);
    router.refresh();
  }

  return (
    <Button variant="secondary" onClick={toggle} disabled={pending} aria-pressed={saved}>
      <span aria-hidden="true" className={saved ? "text-danger-ink" : "text-ink-muted"}>
        {saved ? "♥" : "♡"}
      </span>
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
