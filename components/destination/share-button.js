"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ShareButton({ title, text }) {
  const { notify } = useToast();

  async function share() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      notify("Link copied to clipboard");
    } catch (error) {
      if (error?.name !== "AbortError") notify("Couldn't share. Copy the address from your browser instead.", "error");
    }
  }

  return (
    <Button variant="secondary" onClick={share}>
      <span aria-hidden="true">↗</span>
      Share
    </Button>
  );
}
